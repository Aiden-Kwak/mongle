from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer

class SendMessageAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
