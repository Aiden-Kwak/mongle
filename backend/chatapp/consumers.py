import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
import aioredis
import asyncio

class ChatConsumer(AsyncWebsocketConsumer):
    lock = asyncio.Lock()

    async def connect(self):
        self.user = self.scope['user']
        self.room_name = None

        if self.user.is_authenticated:
            await self.accept()
            # Redis에 연결
            self.redis = await aioredis.from_url("redis://localhost", encoding="utf-8", decode_responses=True)
            # 매칭 로직 실행
            asyncio.create_task(self.attempt_matching())

    async def attempt_matching(self):
        async with ChatConsumer.lock:
            await self.redis.set(f"channel_name_{self.user.username}", self.channel_name)
            await self.redis.sadd("waiting_users", self.user.username)
            waiting_users = await self.redis.smembers("waiting_users")

            if len(waiting_users) > 1:
                peer_user = random.choice(list(waiting_users - {self.user.username}))
                await self.redis.srem("waiting_users", self.user.username, peer_user)

                sorted_usernames = sorted([self.user.username, peer_user])
                room_name = f"chat_{sorted_usernames[0]}_{sorted_usernames[1]}"
                await self.channel_layer.group_add(room_name, self.channel_name)
                await self.redis.set(f"room_name_{self.user.username}", room_name)

                peer_channel_name = await self.redis.get(f"channel_name_{peer_user}")
                if peer_channel_name:
                    await self.channel_layer.group_add(room_name, peer_channel_name)
                    await self.redis.set(f"room_name_{peer_user}", room_name)

                await self.channel_layer.group_send(room_name, {
                    'type': 'match_success_message',
                    'message': '매칭되었습니다!'
                })

    async def disconnect(self, close_code):
        if hasattr(self, 'redis'):
            room_name = await self.redis.get(f"room_name_{self.user.username}")
            if room_name:
                await self.channel_layer.group_discard(room_name, self.channel_name)
            await self.redis.srem("waiting_users", self.user.username)
            await self.redis.delete(f"room_name_{self.user.username}")
            await self.redis.close()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        room_name = await self.redis.get(f"room_name_{self.user.username}")
        if room_name:
            await self.channel_layer.group_send(room_name, {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username
            })

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'sender': sender
        }))

    async def match_success_message(self, event):
        # 매칭 성공 메시지 처리 로직
        message = event['message']
        print(f"[match_success_message] Handling 'match_success_message' event: {message}")

        # WebSocket 클라이언트에 매칭 성공 메시지 전송
        await self.send(text_data=json.dumps({
            'type': 'match_success',
            'message': message
        }))
