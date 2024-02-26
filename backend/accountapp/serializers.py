from rest_framework import serializers
from django.core.exceptions import ValidationError
from utils.school_loader import load_schools_from_json
from .models import User, Profile
import json

from PIL import Image
from django.core.files.base import ContentFile
import io
import os
from django.conf import settings

class AccountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "school", "email", "password"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        school_domains = load_schools_from_json()

        domain = value.split('@')[1]
        school = self.initial_data['school']

        try:
            school_id = int(school)
        except ValueError:
            raise ValidationError("학교 ID가 유효하지 않습니다.")

        # 학교 ID를 기반으로 도메인 정보 찾기
        school_domain_info = next((item for item in school_domains if item['id'] == school_id), None)
        print("get school domain info:", school_domain_info)
        # 학교 정보가 없거나 도메인 영역이 빈 배열일 경우 예외 처리
        if school_domain_info is None or not school_domain_info['domains']:
            raise ValidationError("해당 학교는 아직 준비중입니다.")

        # 도메인 검증
        if domain not in school_domain_info['domains']:
            raise ValidationError("자신의 학교 계정 이메일을 입력해주세요!")

        return value

    def create(self, validated_data):
        # 사용자 생성 로직
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # 사용자를 비활성화 상태로 설정
        user.save()
        return user
    

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')

    class Meta:
        model = Profile
        fields = ['nickname', 'profile_pic', 'bio', 'username']

    # def update(self, instance, validated_data):
    #    instance.nickname = validated_data.get('nickname', instance.nickname)
    #    instance.profile_pic = validated_data.get('profile_pic', instance.profile_pic)
    #    instance.bio = validated_data.get('bio', instance.bio)
    #    instance.save()
    #    return instance
    def update(self, instance, validated_data):
        instance.nickname = validated_data.get('nickname', instance.nickname)
        instance.bio = validated_data.get('bio', instance.bio)
        
        # 이미지 파일 처리
        if 'profile_pic' in validated_data:
            profile_pic = validated_data.pop('profile_pic')
            image = Image.open(profile_pic)
            file_path = os.path.join(settings.MEDIA_ROOT, f"profile_pics/{instance.user.username}.png")
            if os.path.exists(file_path):
                os.remove(file_path)
            if image.format != 'PNG': # 똑같은거 맞는데 나중에 분기시킬 수 있을거같아서 남겨둠
                output = io.BytesIO()
                image.save(output, format='PNG', quality=80)
                image_data = output.getvalue()
                instance.profile_pic.save(f"{instance.user.username}.png", ContentFile(image_data), save=False)
            else:
                output = io.BytesIO()
                image.save(output, format='PNG', quality=80)
                image_data = output.getvalue()
                instance.profile_pic.save(f"{instance.user.username}.png", ContentFile(image_data), save=False)

        instance.save()
        return instance