from rest_framework import serializers
from accountapp.models import Profile

class FriendProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    school = serializers.CharField(source='user.school')
    class Meta:
        model = Profile
        fields = ['id', 'nickname', 'profile_pic', 'username', 'bio', 'school']
