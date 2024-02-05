from rest_framework import serializers
from accountapp.models import Profile

class FriendProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['nickname', 'profile_pic']
