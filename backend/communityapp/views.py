from rest_framework.generics import CreateAPIView, DestroyAPIView, ListAPIView
from .models import Post
from .serializers import PostSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Post, Like

class PostCreateAPI(CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PostDeleteAPI(DestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return user.posts.all()  # 사용자가 작성한 글만 삭제할 수 있도록 설정

class PostListAPI(ListAPIView):
    serializer_class = PostSerializer
    def get_queryset(self):
        queryset = Post.objects.all()
        # URL에서 type 파라미터를 가져오기
        post_type = self.request.query_params.get('type', None)
        if post_type is not None:
            queryset = queryset.filter(type=post_type)
        return queryset

class PostDetailView(APIView):
    def get(self, request, pk):
        post = Post.objects.get(pk=pk)
        post.increment_view_count()  # 조회수 1 증가
        serializer = PostSerializer(post)
        return Response(serializer.data)

class LikePostAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if created:
            return Response({'message': '좋아요!'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': '이미 좋아요를 눌렀습니다.'}, status=status.HTTP_409_CONFLICT)

class UnlikePostAPI(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, post_id):
        like = Like.objects.filter(user=request.user, post_id=post_id)
        
        if like.exists():
            like.delete()
            return Response({'message': '좋아요 취소됨.'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': '좋아요를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
