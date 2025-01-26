from django.contrib import admin
from .models import Friendship, FriendRequest

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    # 목록에서 표시할 필드
    list_display = ('id', 'get_users', 'created_at')

    # 검색 필드 (사용자 이름으로 검색 가능)
    search_fields = ('users__username',)

    # 필터링 옵션 (생성 날짜로 필터링)
    list_filter = ('created_at',)

    # 기본 정렬 순서
    ordering = ('-created_at',)

    def get_users(self, obj):
        # 친구 관계에 포함된 사용자들을 쉼표로 구분해 표시
        return ', '.join([user.username for user in obj.users.all()])

    get_users.short_description = 'Users'  # 컬럼 제목

@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    # 목록에서 표시할 필드
    list_display = ('id', 'from_user', 'to_user', 'timestamp')

    # 검색 필드 (보낸 사용자와 받은 사용자의 이름으로 검색 가능)
    search_fields = ('from_user__username', 'to_user__username')

    # 필터링 옵션 (생성 날짜로 필터링)
    list_filter = ('timestamp',)

    # 기본 정렬 순서
    ordering = ('-timestamp',)
