from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import User

class AccountCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "school", "email", "password"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        # 이메일 유효성 검사 로직
        domain = value.split('@')[1]
        school = self.initial_data['school']
        validation = {
            '0': ['skku.edu', 'g.skku.edu'],
            '1': ['gist.ac.kr','gm.gist.ac.kr'],
            '2': ['sogang.ac.kr'],
            '3': ['unist.ac.kr'],
            '4': ['cau.ac.kr'],
            '5': ['kaist.ac.kr'],
            '6': ['hanyang.ac.kr'],
            '7': ['snu.ac.kr'],
            '8': ['yonsei.ac.kr'],
            '9': ['korea.ac.kr'],
            '10': ['khu.ac.kr'],
            '11': ['hufs.ac.kr'],
            '12': ['uos.ac.kr'],
            '13': ['catholic.ac.kr'],
            '14': ['konkuk.ac.kr'],
            '15': ['kw.ac.kr'],
            '16': ['kookmin.ac.kr'],
            '17': ['dgu.ac.kr', 'dongguk.edu'],
            '18': ['seoultech.ac.kr'],
            '19': ['sju.ac.kr', 'sejong.ac.kr'],
            '20': ['soongsil.ac.kr'],
            '21': ['hongik.ac.kr'],
            '22': ['gachon.ac.kr'],
            '23': ['inha.edu', 'inha.ac.kr'],
            '24': ['ajou.ac.kr'],
            '25': ['kau.ac.kr', ' kau.kr'],
            '26': ['ewhain.net', 'ewha.ac.kr'],
            '27': ['sungshin.ac.kr'],
            '28': ['swu.ac.kr', 'swuo365.onmicrosoft.com'],
            '29': ['sookmyung.ac.kr', 'sm.ac.kr'],
            '30': ['dongduk.ac.kr'],
            '31': ['duksung.ac.kr'],
            '32': ['knua.ac.kr', 'karts.ac.kr'],
            '33': ['dgist.ac.kr'],
            '34': ['postech.ac.kr'],
            '35': ['jnu.ac.kr'],
            '36': ['handong.edu'],
            '37': ['cnu.kr', 'cnu.ac.kr'],
            '38': ['pusan.ac.kr'],
            '39': ['ut.ac.kr']
        }

        valid_email = validation.get(school, [])
        if domain not in valid_email:
            raise ValidationError("자신의 학교 계정 이메일을 입력해주세요!")
        return value

    def create(self, validated_data):
        # 사용자 생성 로직
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # 사용자를 비활성화 상태로 설정
        user.save()
        return user
