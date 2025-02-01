import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import aioredis
import asyncio
from django.contrib.auth import get_user_model
from utils.school_loader import load_schools_from_json
import notificationapp
import os
import uuid



class ChatConsumer(AsyncWebsocketConsumer):
    lock = asyncio.Lock()

    async def connect(self):
        redis_url = os.environ.get('REDIS_URL')
        if redis_url!="redis://redis":
            redis_url = "redis://localhost"
        self.user = self.scope['user']

        query_string = self.scope["query_string"].decode("utf-8")
        query_params = dict(qc.split("=") for qc in query_string.split("&"))
        connection_type = query_params.get("type")
        friend_username = query_params.get("friend_username")

        try:
            self.room_name = self.scope['url_route']['kwargs']['room_name']
        except:
            self.room_name = None

        if self.user.is_authenticated:
            await self.accept()
            # Redis에 연결 # 주소 잠깐 서버용으로. 로컬과 범용성있게 바꿀것. 환경변수활용
            self.redis = await aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
            # 매칭 로직 실행
            #asyncio.create_task(self.attempt_matching())

            #if self.room_name == None and connection_type=="random": # 디엠기능에서도 이게 논으로 뜰 수 있음
            #    print("room_name is None")
            #    await self.attempt_matching()
            #else:
            #    print(f"room_name: {self.room_name}")
            #    if "random" in self.room_name:
            #        await self.attempt_matching()
            #    elif "dm" in self.room_name:
            #        await self.setup_direct_message()
            
            if connection_type=="random":
                await self.attempt_matching()
            elif connection_type=="dm" and friend_username:
                await self.setup_direct_message(friend_username)
    
    async def setup_direct_message(self, friend_username):
        sorted_usernames = sorted([self.user.username, friend_username])
        room_name = f"dm_{sorted_usernames[0]}_{sorted_usernames[1]}"
        self.room_name = room_name
        await self.channel_layer.group_add(room_name, self.channel_name)
        await self.redis.set(f"dm_room_name_{self.user.username}", room_name)

    async def setup_friend_list(self, friend_list):
        print(f"setup_friend_list: {friend_list}")
        for friend_username in friend_list:
            sorted_usernames = sorted([self.user.username, friend_username])
            room_name = f"dm_{sorted_usernames[0]}_{sorted_usernames[1]}"
            self.room_name = room_name
            await self.channel_layer.group_add(room_name, self.channel_name)
            await self.redis.set(f"dm_room_name_{self.user.username}", room_name)

    @database_sync_to_async
    def get_user_school(self, username):
        User = get_user_model()
        user = User.objects.filter(username=username).first()

        schools = load_schools_from_json()
        school_id_to_name = {str(school['id']): school['name'] for school in schools}

        if user and user.school in school_id_to_name:
            return school_id_to_name[user.school]
        return "알 수 없는 학교"

    """
    async def attempt_matching(self):
        async with self.lock:
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

                peer_school = await self.get_user_school(peer_user)
                your_school = await self.get_user_school(self.user.username)
                await self.channel_layer.group_send(room_name, {
                    'type': 'match_success_message',
                    'message': [{"username":peer_user, "school":peer_school}, 
                                {"username":self.user.username, "school":your_school}]
                })
    """

    async def attempt_matching(self):
        async with self.lock:
            await self.redis.set(f"channel_name_{self.user.username}", self.channel_name)
            await self.redis.sadd("waiting_users", self.user.username)
            waiting_users = await self.redis.smembers("waiting_users")
            
            # 채팅 중인 사용자를 제외해서 대기중인 사용자 집합 생성함.
            available_users = set()
            for user in waiting_users:
                room_name = await self.redis.get(f"room_name_{user}")
                if not room_name:
                    available_users.add(user)
            
            if len(available_users) > 1:
                peer_user = random.choice(list(available_users - {self.user.username}))
                await self.redis.srem("waiting_users", self.user.username, peer_user)

                sorted_usernames = sorted([self.user.username, peer_user])
                room_name = f"chat_{sorted_usernames[0]}_{sorted_usernames[1]}"
                await self.channel_layer.group_add(room_name, self.channel_name)
                await self.redis.set(f"room_name_{self.user.username}", room_name)

                peer_channel_name = await self.redis.get(f"channel_name_{peer_user}")
                if peer_channel_name:
                    await self.channel_layer.group_add(room_name, peer_channel_name)
                    await self.redis.set(f"room_name_{peer_user}", room_name)

                peer_school = await self.get_user_school(peer_user)
                your_school = await self.get_user_school(self.user.username)
                await self.channel_layer.group_send(room_name, {
                    'type': 'match_success_message',
                    'message': [{"username": peer_user, "school": peer_school}, 
                                {"username": self.user.username, "school": your_school}]
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
        message_type = text_data_json['type']

        if message_type == 'chat_message':
            message = text_data_json['message']
            room_name = await self.redis.get(f"room_name_{self.user.username}")
            if room_name:
                await self.channel_layer.group_send(room_name, {
                    'type': 'chat_message',
                    'message': message,
                    'sender': self.user.username
                })
        elif message_type == 'dm_message':
            message = text_data_json['message']
            room_name = await self.redis.get(f"dm_room_name_{self.user.username}")
            if room_name:
                message = await self.save_message(self.user.username, room_name, message)
                print(f"dm문제 확인중. message: {message.id}")
                await self.channel_layer.group_send(room_name, {
                    'message': [message.message, message.id],
                    'type': 'dm_message',
                    'sender': message.sender.username,
                })
            #await database_sync_to_async(self.save_message)(self.user.username, room_name, message)
            
        elif message_type == 'friend_list':
            friend_list = text_data_json['username_list']
            print(f"friend_list: {friend_list}")
            await self.setup_friend_list(friend_list)

        elif message_type == 'start_dm':
            my_username = self.user.username
            friend_username = text_data_json.get('friend_username')
            # 레디스에 dm_active 설정
            key = f"dm_active:{my_username}:{friend_username}"
            await self.redis.set(key, "True")
            await self.setup_direct_message(friend_username)
        
        elif message_type == 'end_dm': # 웹소켓은 종료안하고, 키만 삭제하면 됨.
            my_username = self.user.username
            friend_username = text_data_json.get('friend_username')
            # 레디스에 dm_active 설정
            key = f"dm_active:{my_username}:{friend_username}"
            await self.redis.delete(key)

        elif message_type == 'start_chat':
            await self.attempt_matching()

        elif message_type == 'chat_end':
            await self.end_chat()

        elif message_type in ['typing_start', 'typing_end']:
            room_name = await self.redis.get(f"room_name_{self.user.username}")
            if room_name:
                await self.channel_layer.group_send(room_name, {
                    'type': f'{message_type}_message',
                    'sender': self.user.username
                })
        
        elif message_type == 'accept_friend_request' or message_type == 'reject_friend_request':
            print(f"receive: {message_type}") # 여기 체크해보자. text_data_json 까보면 될듯. 아예 안받는디?
            print(f"receive: {text_data_json}")
            if 'from_username' in text_data_json:
                if message_type == 'accept_friend_request':
                    print(f"accept_friend_request: {text_data_json['from_username']}")
                    await self.accept_friend_request(text_data_json['from_username'])
                else:
                    room_name = await self.redis.get(f"room_name_{self.user.username}")
                    if room_name:
                        await self.channel_layer.group_send(room_name, {
                            'type': 'reject_friend_request'
                        })
                    await self.reject_friend_request(text_data_json['from_username'])
        elif message_type == 'send_friend_request':
            if 'to_username' in text_data_json:
                await self.handle_send_friend_request(text_data_json['to_username'])
    
    # 비동기로 바꿔야 할 함수를 동기 방식으로 정의
    def save_message_sync(self, sender_username, room_name, message):
        from .models import Message
        User = get_user_model()
        
        # User 모델에서 sender와 receiver를 동기적으로 가져옴
        sender = User.objects.get(username=sender_username)
        _, first_username, second_username = room_name.split('_')
        receiver_username = second_username if sender_username == first_username else first_username
        receiver = User.objects.get(username=receiver_username)
        
        # 메시지를 데이터베이스에 저장
        message=Message.objects.create(sender=sender, receiver=receiver, message=message)
        return message
    
    # save_message_sync 함수를 비동기적으로 실행할 수 있도록 래핑
    async def save_message(self, sender_username, room_name, message):
        message_instance = await database_sync_to_async(self.save_message_sync)(sender_username, room_name, message)
        
        my_username = self.user.username
        friend_username = [username for username in room_name.split("_") if username != my_username][1]
        my_key = f"dm_active:{my_username}:{friend_username}"
        friend_key = f"dm_active:{friend_username}:{my_username}"
        my_dm_status = await self.redis.get(my_key)
        friend_dm_status = await self.redis.get(friend_key)
        # 나와 상대가 모두 dm접속 상태가 아니라면 알림을 생성
        if (my_dm_status == "False" or my_dm_status == None) or (friend_dm_status == "False" or friend_dm_status == None):
            await self.create_notification(message_instance)
        return message_instance
    
    async def create_notification(self, message_instance):
        # 비동기적으로 알림을 생성하는 메서드입니다.
        await database_sync_to_async(self.create_notification_sync)(message_instance)

    def create_notification_sync(self, message_instance):
        # 실제로 알림을 생성하는 동기 메서드입니다.
        notificationapp.models.Notification.objects.create(
            notification_type=0,  # 'dm'에 해당하는 코드
            sender=message_instance.sender,
            receiver=message_instance.receiver,
            text_preview=message_instance.message[:20],  # 필요에 따라 조정
            user_has_seen=False
        )
    
    
    async def end_chat(self):
        room_name = await self.redis.get(f"room_name_{self.user.username}")
        if room_name:
            # 채팅 종료 알림을 채팅방의 모든 참여자에게 전송
            await self.channel_layer.group_send(room_name, {
                'type': 'chat_end_message',
            })
            
            # 채팅방에서 사용자를 제거
            await self.channel_layer.group_discard(room_name, self.channel_name)


    async def accept_friend_request(self, friend_username):
        from friendapp.models import Friendship, FriendRequest
        # 비동기로 친구 요청을 조회
        friend_request = await self.get_friend_request(friend_username)
        if friend_request:
            from_user_instance = await database_sync_to_async(FriendRequest.objects.get)(pk=friend_request.pk)
            from_user = await database_sync_to_async(lambda: from_user_instance.from_user)()
            
            # 비동기로 친구 관계 생성
            await database_sync_to_async(Friendship.create_friendship)(self.user, from_user)
            room_name = await self.redis.get(f"room_name_{self.user.username}")
            if room_name:
                await self.channel_layer.group_send(room_name, {
                    'type': 'send_friend_request_response',  # 이 메서드는 아래에 정의해야 합니다.
                    'response_type': 'accept_friend_request'
                })
            
            # 비동기로 FriendRequest 인스턴스 삭제
            await database_sync_to_async(friend_request.delete)()


    async def reject_friend_request(self, friend_username):
        # 비동기로 친구 요청을 조회
        friend_request = await self.get_friend_request(friend_username)
        if friend_request:
            room_name = await self.redis.get(f"room_name_{self.user.username}")
            if room_name:
                await self.channel_layer.group_send(room_name, {
                    'type': 'send_friend_request_response',  # 이 메서드는 아래에 정의해야 합니다.
                    'response_type': 'reject_friend_request'
                })
            # 비동기로 FriendRequest 인스턴스 삭제
            await database_sync_to_async(friend_request.delete)()
    
    async def get_friend_request(self, friend_username):
        from friendapp.models import FriendRequest
        friend_request_query = await database_sync_to_async(FriendRequest.objects.filter)(
            from_user__username=friend_username,
            to_user=self.user
        )
        friend_request = await database_sync_to_async(friend_request_query.first)()
        return friend_request


        
   
    async def handle_send_friend_request(self, to_username):
        room_name = await self.redis.get(f"room_name_{self.user.username}")
        if room_name:
            usernames = room_name.split("_")[1:]  # room_name이 "chat_user1_user2" 형식이라고 가정
            peer_username = [username for username in usernames if username != self.user.username][0]

            User = get_user_model()
            peer_user = await database_sync_to_async(User.objects.get)(username=peer_username)

            from friendapp.models import FriendRequest
            friend_request = await database_sync_to_async(FriendRequest.objects.create)(
                from_user=self.scope['user'],
                to_user=peer_user
            )
            
            peer_channel_name = await self.redis.get(f"channel_name_{peer_username}")
            if peer_channel_name:
                await self.channel_layer.send(peer_channel_name, {
                    "type": "friend_request",
                    "from_username": self.user.username,
                    "peer_username": peer_username
                })



    ###########################
    #                         #
    # 아래는 전부 처리로직들. 핸들러 #
    #                         #
    ###########################
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
    
    async def chat_end_message(self, event):
        # 채팅 종료 처리 로직
        await self.send(text_data=json.dumps({
            'type': 'chat_end',
            'message': '채팅이 종료되었습니다.'
        }))
    
    async def typing_start_message(self, event):
        # 클라이언트에 타이핑 시작 메시지 전송
        await self.send(text_data=json.dumps({
            'type': 'typing_start',
            'sender': event['sender']
        }))

    async def typing_end_message(self, event):
        # 클라이언트에 타이핑 종료 메시지 전송
        await self.send(text_data=json.dumps({
            'type': 'typing_end',
            'sender': event['sender']
        }))

    async def friend_request(self, event):
        # 친구 요청 메시지를 클라이언트에 전송
        await self.send(text_data=json.dumps({
            'type': 'friend_request',
            'from_username': event['from_username'],
            'peer_username': event['peer_username']
        }))
    
    async def dm_message(self, event):
        message = event['message']
        sender = event['sender']

        await self.send(text_data=json.dumps({
            'type': 'dm_message',
            'message': message,
            'sender': sender
        }))

    async def send_friend_request_response(self, event):
        # 클라이언트로 보낼 메시지 구성
        response_type = event['response_type']

        # 클라이언트에게 메시지 전송
        await self.send(text_data=json.dumps({
            'type': response_type,  # 클라이언트가 이해할 수 있는 메시지 타입
        }))



class CountConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        redis_url = os.environ.get('REDIS_URL')
        if redis_url != "redis://redis":
            redis_url = "redis://localhost"
        self.redis = await aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.channel_layer.group_add("online_users_group", self.channel_name)
            await self.accept()
            await self.add_online_user()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.remove_online_user()
            await self.channel_layer.group_discard("online_users_group", self.channel_name)
        await self.redis.close()

    async def add_online_user(self):
        try:
            username = self.user.username
            online_users = await self.redis.lrange("online_users_list", 0, -1)
            if username not in online_users:
                await self.redis.rpush("online_users_list", username)
        except Exception as e:
            print(f"Add User Error: {e}")

        await self.update_online_users_count()

    async def remove_online_user(self):
        try:
            username = self.user.username
            await self.redis.lrem("online_users_list", 1, username)
        except Exception as e:
            print(f"Remove User Error: {e}")

        await self.update_online_users_count()

    @staticmethod
    async def get_online_users_count():
        redis_url = os.environ.get('REDIS_URL')
        if redis_url != "redis://redis":
            redis_url = "redis://localhost"
        redis = await aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        online_users = await redis.lrange("online_users_list", 0, -1)
        return len(online_users)

    async def update_online_users_count(self):
        count = await self.get_online_users_count()
        await self.channel_layer.group_send("online_users_group", {
            "type": "update_online_users_count_message",
            "count": count
        })

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']

        if message_type == 'get_online_users_count':
            count = await self.get_online_users_count()
            await self.send(text_data=json.dumps({
                'type': 'online_users_count',
                'count': count
            }))

    async def update_online_users_count_message(self, event):
        count = event['count']
        await self.send(text_data=json.dumps({
            'type': 'online_users_count',
            'count': count
        }))


#e1i5
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class VideoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("video_stream", self.channel_name)
        print("WebSocket connected:", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("video_stream", self.channel_name)
        print("WebSocket disconnected:", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type in ['offer', 'answer', 'candidate']:
            await self.channel_layer.group_send(
                'video_stream',
                {
                    'type': 'video_message',
                    'message': data
                }
            )
            print(f"{message_type} received and broadcasted:", data)
        else:
            print("Unknown message type received:", message_type)

    async def video_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
        print("Message sent to client:", message)
"""
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class VideoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'streaming_room'
        self.room_group_name = 'stream_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'video_data':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'video_message',
                    'data': data['data']
                }
            )

    async def video_message(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'video_data',
            'data': data
        }))

## DB에 영상을 올려버리자.
## 영상을 송출하는 방식으로.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class VideoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'video_stream'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['action'] == 'play_sound':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'play_sound',
                    'username': data['username']
                }
            )

    async def play_sound(self, event):
        if self.scope['user'].username == event['username']:
            await self.send(text_data=json.dumps({
                'action': 'play_sound'
            }))


class GroupChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        if "url_route" in self.scope and "kwargs" in self.scope["url_route"]:
            self.room_name = self.scope['url_route']['kwargs'].get('room_name', None)
        else:
            self.room_name = None
        #self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            await self.accept()
            redis_url = os.environ.get('REDIS_URL')
            if redis_url != "redis://redis":
                redis_url = "redis://localhost"
            self.redis = await aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)

            # 방 참여
            if self.room_name:
                await self.channel_layer.group_add(self.room_name, self.channel_name)
            #await self.channel_layer.group_add(self.room_name, self.channel_name)
                await self.redis.sadd(f"{self.room_name}_members", self.user.username)

                await self.send(text_data=json.dumps({
                    "type": "joined_group_chat",
                    "room_name": self.room_name
                }))
        else:
            await self.close()


    async def disconnect(self, close_code):
        if hasattr(self, 'redis'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
            await self.redis.srem(f"{self.room_name}_members", self.user.username)

            # 참여자 수 업데이트
            remaining_users = await self.redis.scard(f"{self.room_name}_members")
            await self.redis.hset(self.room_name, "current_users", remaining_users)

            await self.send_participant_list()

            # 참여자 목록을 모든 사용자에게 전송
            participants = await self.redis.smembers(f"{self.room_name}_members")
            await self.channel_layer.group_send(
                self.room_name,
                {
                    "type": "update_participants",
                    "participants": list(participants),
                }
            )

            # 방 삭제 조건 추가 (방이 비었을 경우)
            if remaining_users == 0:
                await self.redis.delete(f"{self.room_name}_members")
                await self.redis.srem("group_chat_rooms", self.room_name)
                await self.redis.delete(self.room_name)

            await self.redis.close()
    
    
    async def update_participants(self, event):
        await self.send(text_data=json.dumps({
            "type": "participant_list",
            "participants": event["participants"]
        }))
    
    async def send_participant_list(self):
        from accountapp.models import Profile
        members = await self.redis.smembers(f"{self.room_name}_members")

        participants = []
        for username in members:
            try:
                user=self.user
                profile = await database_sync_to_async(Profile.objects.get)(user=user)
                nickname = profile.nickname
                school_name = await database_sync_to_async(user.get_school_display)()
                participants.append(f"{nickname}({school_name})")  # 닉네임(학교명) 형태로 변환
            except Profile.DoesNotExist:
                continue

        # 모든 참여자 목록을 브로드캐스트
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "update_participants",
                "participants": participants,
            }
        )

    async def receive(self, text_data):
        from accountapp.models import Profile
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'join_group_chat':
            await self.join_group_chat(text_data_json)
            await self.send_participant_list() #테스트

        elif message_type == 'group_chat_message':
            message = text_data_json['message']
            message_id = text_data_json.get('message_id', str(uuid.uuid4()))  # 메시지에 고유 ID 추가

            
            user_profile = await database_sync_to_async(Profile.objects.get)(user=self.user)
            user_nickname = user_profile.nickname
            school_name = await database_sync_to_async(self.user.get_school_display)()

            sender_display_name = f"{user_nickname}({school_name})"

            # 메시지 중복 확인 (Redis에 존재하는지 검사)
            is_duplicate = await self.redis.sismember(f"{self.room_name}_message_ids", message_id)
            if is_duplicate:
                print(f"중복된 메시지 감지: {message_id}")
                return  # 중복 메시지라면 무시

            # 메시지 ID 저장 (중복 방지)
            await self.redis.sadd(f"{self.room_name}_message_ids", message_id)
            await self.redis.expire(f"{self.room_name}_message_ids", 10)  # 메시지 ID는 60초 후 자동 삭제

            # 메시지 그룹 브로드캐스트
            await self.channel_layer.group_send(self.room_name, {
                'type': 'group_chat_message',
                'message': message,
                'sender_nick': user_nickname,
                'sender': self.user.username,
                'sender_school': school_name,
                'message_id': message_id
            })


    async def group_chat_message(self, event):
        message = event['message']
        sender = event['sender']
        sender_nick = event['sender_nick']
        sender_school = event['sender_school']
        message_id = event.get('message_id', str(uuid.uuid4()))  # 메시지 ID가 없으면 랜덤 ID 생성

        await self.send(text_data=json.dumps({
            'type': 'group_chat',
            'message': message,
            'sender': sender,
            'sender_nick': sender_nick,
            'sender_school': sender_school,
            'message_id': message_id
        }))
    
    async def create_group_chat(self, data):
        room_title = data.get("room_title")
        max_users = int(data.get("max_users", 15))

        if not room_title:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "방 제목을 입력하세요."
            }))
            return

        room_name = f"group_{uuid.uuid4().hex[:8]}"  # 랜덤한 고유 방 ID 생성
        room_data = {
            "room_title": room_title,
            "max_users": max_users,
            "current_users": 0
        }

        await self.redis.hmset_dict(room_name, room_data)
        await self.redis.sadd("group_chat_rooms", room_name)

        # 생성된 방 정보를 클라이언트로 전송
        await self.send(text_data=json.dumps({
            "type": "group_chat_created",
            "room_name": room_name,
            "room_title": room_title,
            "max_users": max_users
        }))

    async def join_group_chat(self, data):
        room_name = data.get("room_name")
        room_info = await self.redis.hgetall(room_name)

        if not room_info:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "방을 찾을 수 없습니다."
            }))
            return

        max_users = int(room_info["max_users"])

        # 현재 사용자가 이미 입장한 경우 방지
        is_member = await self.redis.sismember(f"{room_name}_members", self.user.username)
        if is_member:
            print(f"사용자 {self.user.username} 는 이미 {room_name} 방에 참여 중")
            return  # 기존 참여자는 다시 추가하지 않음

        # 사용자 추가
        await self.redis.sadd(f"{room_name}_members", self.user.username)
        await self.channel_layer.group_add(room_name, self.channel_name)

        # 참여자 수를 직접 조회하여 설정 (중복 방지)
        participants = await self.redis.smembers(f"{room_name}_members")
        await self.redis.hset(room_name, "current_users", len(participants))

        # 클라이언트에 새로운 유저 리스트 전송
        await self.channel_layer.group_send(
            room_name,
            {
                "type": "update_participants",
                "participants": list(participants),
            }
        )

        await self.send(text_data=json.dumps({
            "type": "joined_group_chat",
            "room_name": room_name
        }))