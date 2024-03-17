from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

TYPE_CHOICES = (('0', '랜덤채팅'),
            ('1', '썸/연애'),
            ('2', '주식/투자'),
            ('3', '재수/반수/편입'),
            ('4', '취업/창업'),
            ('5', '여행/먹방'),
            ('6', '게임'),
            ('7', '패션/뷰티'),
            ('8', '유머'),
            ('9', '군대'),
            ('10', '팀원모집/프로젝트'))

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=100)
    content = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.IntegerField(default=0)
    type = models.CharField(max_length=2, choices=TYPE_CHOICES, default='0')
    
    # Meta 클래스를 사용해 게시물의 기본 정렬 순서를 최신 순으로 설정
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def increment_view_count(self):
        self.view_count += 1
        self.save()

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'post')  # 한 사용자가 같은 게시물에 여러 번 좋아요를 누르지 못하도록 설정

    def __str__(self):
        return f'{self.user.username} likes {self.post.title}'
