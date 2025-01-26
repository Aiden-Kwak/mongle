from django.contrib import admin
from .models import Post, PostImage, Like, Comment

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    # 검색 필드 (제목, 내용, 작성자 이름)
    search_fields = ('title', 'content', 'user__username')

    # 목록에 표시할 필드
    list_display = ('title', 'user', 'type', 'view_count', 'created_at', 'updated_at')

    # 필터링 옵션
    list_filter = ('type', 'created_at', 'updated_at')

    # 기본 정렬 순서
    ordering = ('-created_at',)

    # 관리 페이지에서 편집 가능한 필드 섹션
    fieldsets = (
        (None, {
            'fields': ('user', 'title', 'content', 'type')
        }),
        ('Additional Info', {
            'fields': ('view_count',)
        }),
    )

@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    # 검색 필드 (게시글 제목)
    search_fields = ('post__title',)

    # 목록에 표시할 필드
    list_display = ('post', 'image')

    # 필터링 옵션
    list_filter = ('post',)

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    # 검색 필드 (사용자 이름, 게시글 제목)
    search_fields = ('user__username', 'post__title')

    # 목록에 표시할 필드
    list_display = ('user', 'post', 'created_at')

    # 필터링 옵션
    list_filter = ('created_at',)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    # 검색 필드 (내용, 사용자 이름, 게시글 제목)
    search_fields = ('content', 'user__username', 'post__title')

    # 목록에 표시할 필드
    list_display = ('user', 'post', 'content', 'created_at', 'updated_at')

    # 필터링 옵션
    list_filter = ('created_at', 'updated_at')

    # 기본 정렬 순서
    ordering = ('-created_at',)
