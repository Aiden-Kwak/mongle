import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
import aioredis

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_authenticated:
            await self.accept()
            print(f"{self.user.username} connected and trying to add to waiting list")

            # Redis에 연결
            self.redis = await aioredis.from_url("redis://localhost", encoding="utf-8", decode_responses=True)
            
            # 사용자의 채널 이름을 Redis에 저장
            await self.redis.set(f"channel_name_{self.user.username}", self.channel_name)

            # 대기 목록에 사용자 추가
            await self.redis.sadd("waiting_users", self.user.username)

            # 랜덤 매칭 시도
            waiting_users = await self.redis.smembers("waiting_users")
            print(f"Current waiting users: {waiting_users}")

            if len(waiting_users) > 1:
                peer_user = random.choice(list(waiting_users - {self.user.username}))
                await self.redis.srem("waiting_users", self.user.username, peer_user)
                print(f"Matched: {self.user.username} with {peer_user}")

                # 매칭된 사용자와 채팅 시작
                self.room_name = f"chat_{self.user.username}_{peer_user}"
                await self.channel_layer.group_add(
                    self.room_name,
                    self.channel_name
                )

                # 매칭된 상대방의 채널이름 조회 및 상대방의 채널을 그룹에 추가하는 과정 필요
                # 매칭된 상대방의 채널 이름 조회
                peer_channel_name = await self.redis.get(f"channel_name_{peer_user}")

                # 매칭된 상대방의 채널을 그룹에 추가
                if peer_channel_name:
                    await self.channel_layer.group_add(
                        self.room_name,
                        peer_channel_name
                    )


                # 매칭 성공 메시지 전송
                await self.channel_layer.group_send(self.room_name, {
                    'type': 'match_success_message',
                    'message': '매칭되었습니다!'
                })

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
        # WebSocket 클라이언트에 JSON 객체로 메시지 전송
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message
        }))

    async def match_success_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'match_success',
            'message': message
        }))