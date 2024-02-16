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

class SendMessageAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MessageSerializer(data=request.data, context={'request': request})
        print(request.data)
        if serializer.is_valid():
            try:
                message_instance = serializer.save(sender=request.user)
                # 메시지 저장 후 알림 생성
                Notification.objects.create(
                    notification_type=0,
                    sender=request.user,
                    receiver=message_instance.receiver,
                    text_preview=message_instance.message[:100],
                    user_has_seen=False
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                # 유효성 검사 예외 처리
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                # 기타 예외 처리
                return Response({"error": "Notification creation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
