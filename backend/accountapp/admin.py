from django.contrib import admin
from .models import User, Profile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # 검색 필드 설정 (사용자 이름, 이메일, 학교로 검색 가능)
    search_fields = ('username', 'email', 'school')

    # 목록에서 표시할 필드
    list_display = ('username', 'email', 'school', 'is_active', 'is_staff', 'date_joined')

    # 필터링 옵션
    list_filter = ('is_active', 'is_staff', 'school', 'date_joined')

    # 기본 정렬 순서
    ordering = ('-date_joined',)

    # 읽기 전용 필드 (기본 생성/수정 시간 등 수정 불가 필드)
    readonly_fields = ('date_joined',)

    # 관리 페이지에서 편집 가능한 필드 섹션
    fieldsets = (
        (None, {
            'fields': ('username', 'email', 'school', 'password')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser')
        }),
        ('Important Dates', {
            'fields': ('date_joined',)
        }),
    )

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    # 검색 필드 설정 (연결된 사용자 이름, 닉네임, 바이오로 검색 가능)
    search_fields = ('user__username', 'nickname', 'bio')

    # 목록에서 표시할 필드
    list_display = ('user', 'nickname', 'profile_pic', 'bio')

    # 필터링 옵션
    list_filter = ('nickname',)

    # 관리 페이지에서 편집 가능한 필드 섹션
    fieldsets = (
        (None, {
            'fields': ('user', 'nickname', 'profile_pic', 'bio')
        }),
    )

    # 기본 정렬 순서
    ordering = ('user__username',)
