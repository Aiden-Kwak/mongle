import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
import aioredis

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_authenticated:
            await self.accept()

            # Redis에 연결
            self.redis = await aioredis.from_url("redis://localhost", encoding="utf-8", decode_responses=True)

            # 대기 목록에 사용자 추가
            await self.redis.sadd("waiting_users", self.user.username)

            # 랜덤 매칭 시도
            waiting_users = await self.redis.smembers("waiting_users")
            if len(waiting_users) > 1:
                peer_user = random.choice(list(waiting_users - {self.user.username}))
                await self.redis.srem("waiting_users", self.user.username, peer_user)

                # 매칭된 사용자와 채팅 시작
                self.room_name = f"chat_{self.user.username}_{peer_user}"
                await self.channel_layer.group_add(
                    self.room_name,
                    self.channel_name
                )

                # 클라이언트에게 매칭 성공 메시지 전송
                await self.send(text_data=json.dumps({
                    'type': 'match_success',
                    'message': '매칭되었습니다!'
                }))

    async def disconnect(self, close_code):
        # 대기 목록에서 사용자 제거
        if hasattr(self, 'redis'):
            await self.redis.srem("waiting_users", self.user.username)
            await self.redis.close()

        # 채팅방에서 사용자 제거
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # 채팅방에 메시지 전송
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # WebSocket 클라이언트에 메시지 전송
        await self.send(text_data=json.dumps({
            'message': message
        }))
