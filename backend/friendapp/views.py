from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Friendship
from accountapp.models import Profile
from .serializers import FriendProfileSerializer

User = get_user_model()

class FriendListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        
        # Friendship 객체와 관련된 모든 users와 각 user의 profile을 prefetch_related와 select_related를 사용하여 가져옵니다.
        friendships = Friendship.objects.filter(users=user).prefetch_related(
            'users__profile'  # users 필드를 통해 Profile에 접근합니다.
        ).distinct()
        
        # 친구 목록을 저장할 집합
        friends_profiles = set()
        
        # 각 Friendship 객체에 대해 반복하며, 각 친구의 Profile 정보를 추출합니다.
        for friendship in friendships:
            for friend in friendship.users.all():
                if friend != user:
                    # 각 친구의 Profile 정보를 집합에 추가합니다.
                    # friend.profile 접근은 select_related 또는 prefetch_related 덕분에 이미 최적화되어 있습니다.
                    friends_profiles.add(friend.profile)
        
        # Profile 정보를 직렬화합니다.
        serializer = FriendProfileSerializer(list(friends_profiles), many=True)
        return Response(serializer.data)