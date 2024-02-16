from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Friendship
from notificationapp.models import Notification
from accountapp.models import Profile
from .serializers import FriendProfileSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Prefetch, Q


User = get_user_model()

class FriendListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        user_profiles = Profile.objects.filter(user__friendships__users=user).exclude(user=user).distinct()

        profiles_data = []
        for profile in user_profiles:
            friend = profile.user

            # 각 친구로부터 온 안 읽은 알림의 수를 계산
            unread_notifications_count = Notification.objects.filter(
                receiver=user, 
                sender=friend,
                user_has_seen=False
            ).count()

            # 최근 알림 메시지를 가져옵니다. (예: DM 메시지)
            recent_notification = Notification.objects.filter(
                receiver=user, 
                sender=friend
            ).order_by('-date').first()

            profile_data = FriendProfileSerializer(profile).data
            profile_data['unread_count'] = unread_notifications_count
            profile_data['recent_message'] = recent_notification.text_preview if recent_notification else ""
            
            profiles_data.append(profile_data)
        
        return Response(profiles_data)

    #def get(self, request, format=None):
    #    user = request.user
    #    
    #    # Friendship 객체와 관련된 모든 users와 각 user의 profile을 prefetch_related와 select_related를 사용하여 가져옵니다.
    #    friendships = Friendship.objects.filter(users=user).prefetch_related(
    #        'users__profile'  # users 필드를 통해 Profile에 접근합니다.
    #    ).distinct()
    #    
    #    # 친구 목록을 저장할 집합
    #    friends_profiles = set()
    #    
    #    # 각 Friendship 객체에 대해 반복하며, 각 친구의 Profile 정보를 추출합니다.
    #    for friendship in friendships:
    #        for friend in friendship.users.all():
    #            if friend != user:
    #                # 각 친구의 Profile 정보를 집합에 추가합니다.
    #                # friend.profile 접근은 select_related 또는 prefetch_related 덕분에 이미 최적화되어 있습니다.
    #                friends_profiles.add(friend.profile)
    #    
    #    # Profile 정보를 직렬화합니다.
    #    serializer = FriendProfileSerializer(list(friends_profiles), many=True)
    #    return Response(serializer.data)

class RemoveFriendAPI(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, friend_username, format=None):
        user = request.user
        friend = get_object_or_404(User, username=friend_username)  # 친구의 사용자 객체를 가져옵니다.

        # 해당 사용자 사이의 Friendship 인스턴스를 찾습니다.
        friendship = Friendship.objects.filter(users=user).filter(users=friend)

        if friendship.exists():
            friendship.first().remove_friendship()  # Friendship 인스턴스를 삭제합니다.
            return Response({"message": "Friendship removed successfully"}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"error": "Friendship does not exist"}, status=status.HTTP_404_NOT_FOUND)