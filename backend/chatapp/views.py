from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
from notificationapp.models import Notification
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
import aioredis

#class SendMessageAPI(APIView):
#    permission_classes = [IsAuthenticated]
#
#    def post(self, request):
#        serializer = MessageSerializer(data=request.data, context={'request': request})
#        print(request.data)
#        if serializer.is_valid():
#            try:
#                message_instance = serializer.save(sender=request.user)
#                # 메시지 저장 후 알림 생성
#                Notification.objects.create(
#                    notification_type=0,
#                    sender=request.user,
#                    receiver=message_instance.receiver,
#                    text_preview=message_instance.message[:100],
#                    user_has_seen=False
#                )
#                return Response(serializer.data, status=status.HTTP_201_CREATED)
#            except ValidationError as e:
#                # 유효성 검사 예외 처리
#                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#            except Exception as e:
#                # 기타 예외 처리
#                return Response({"error": "Notification creation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

User = get_user_model()
class MessageListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, friend_username):
        friend = User.objects.filter(username=friend_username).first()
        if not friend:
            return Response({"error": "친구를 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(
            Q(sender=request.user, receiver=friend) | 
            Q(sender=friend, receiver=request.user)
        ).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

class RemoveMessageAPI(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, friend_username, format=None):
        user = request.user
        friend = get_object_or_404(User, username=friend_username)
        messages = Message.objects.filter(
            Q(sender=user, receiver=friend) | 
            Q(sender=friend, receiver=user)
        )
        messages.delete()


        return Response({"message": "Messages removed successfully."})
  
#class DMActiveStatusAPI(APIView):
#    permission_classes = [IsAuthenticated]
#
#    async def post(self, request):
#        user = request.user
#        friend_username = request.data.get('friendUsername')
#        active = request.data.get('active', True)
#        redis_url = "redis://localhost"
#        redis = await aioredis.create_redis_pool(redis_url, encoding="utf8", decode_responses=True)
#
#        sorted_usernames = sorted([user.username, friend_username])
#        key = f"dm_active:{sorted_usernames[0]}:{sorted_usernames[1]}"
#        
#        if active:
#            await redis.set(key, "true")
#        else:
#            await redis.delete(key)
#
#        return Response({"status": "success"})


import uuid
import redis
import os

#redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)
redis_url = os.environ.get('REDIS_URL')
if not redis_url or not redis_url.startswith(("redis://", "rediss://", "unix://")):
    redis_url = "redis://localhost:6379"  # 기본값 설정
redis_client = redis.from_url(redis_url, decode_responses=True)

class CreateGroupChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        room_title = request.data.get("room_title")
        max_users = request.data.get("max_users", 5)

        if not room_title:
            return Response({"error": "방 제목을 입력하세요."}, status=400)
        
        creator_nickname = user.profile.nickname if hasattr(user, "profile") else user.username
        creator_school = user.get_school_display()

        room_name = f"group_{uuid.uuid4().hex[:8]}"  # 랜덤 방 ID 생성
        redis_client.hset(room_name, "room_title", room_title)
        redis_client.hset(room_name, "max_users", max_users)
        redis_client.hset(room_name, "current_users", 0)
        redis_client.hset(room_name, "creator_nickname", creator_nickname)
        redis_client.hset(room_name, "creator_school", creator_school)

        redis_client.sadd("group_chat_rooms", room_name)

        return Response({
            "room_name": room_name,
            "room_title": room_title,
            "max_users": max_users,
            "creator_nickname": creator_nickname,
            "creator_school": creator_school
        }, status=201)
    
class GroupChatRoomsView(APIView):
    def get(self, request):
        room_names = redis_client.smembers("group_chat_rooms")
        rooms = []

        for room_name in room_names:
            room_info = redis_client.hgetall(room_name)
            if room_info:
                rooms.append({
                    "room_name": room_name,
                    "room_title": room_info.get("room_title", "Untitled"),
                    "max_users": int(room_info.get("max_users", 0)),
                    "current_users": int(room_info.get("current_users", 0)),
                    "creator_nickname": room_info.get("creator_nickname", "Unknown"),
                    "creator_school": room_info.get("creator_school", "학교정보없음")
                })

        return Response({"rooms": rooms}, status=200)