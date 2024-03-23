from rest_framework import serializers
from .models import Post, Comment
from accountapp.models import User

class UserSerializer(serializers.ModelSerializer):
    school_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['username', 'school', 'school_name']

    def get_school_name(self, obj):
        return obj.get_school_display()

class PostSerializer(serializers.ModelSerializer):
    type_display = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)  # 작성자 정보를 UserSerializer를 통해 반환

    def get_type_display(self, obj):
        return obj.get_type_display()

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()

    class Meta:
        model = Post
        fields = ['id', 'user', 'title', 'content', 'created_at', 'updated_at', 'view_count', 'type', 'type_display', 'comments_count']
        read_only_fields = ['user']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # 댓글 작성자 정보를 UserSerializer를 통해 반환

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'content', 'created_at', 'updated_at']
        read_only_fields = ['user', 'post']
