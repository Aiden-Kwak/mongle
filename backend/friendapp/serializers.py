from rest_framework import serializers
from accountapp.models import Profile
from utils.school_loader import load_schools_from_json

class FriendProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    # school 필드를 직접 정의하지 않고 아래에서 메소드 필드로 추가합니다.
    
    class Meta:
        model = Profile
        fields = ['id', 'nickname', 'profile_pic', 'username', 'bio', 'school']

    def get_school_name(self, obj):
        # 학교 ID를 이름으로 매핑하는 딕셔너리를 로드합니다.
        schools = load_schools_from_json()
        school_id_to_name = {str(school['id']): school['name'] for school in schools}
        
        # obj.user.school은 school id를 나타냅니다. 이를 이름으로 변환합니다.
        school_id = obj.user.school
        return school_id_to_name.get(school_id, "알 수 없는 학교")  # 기본값으로 "알 수 없는 학교"를 사용합니다.

    # school 필드를 SerializerMethodField로 추가합니다.
    school = serializers.SerializerMethodField(method_name='get_school_name')
