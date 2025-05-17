import json
import os
from django.conf import settings

def load_school_choices(filename='domain.json'):
    """
    학교 선택 목록을 반환하는 함수
    DB에 데이터가 있으면 DB에서 가져오고, 없으면 JSON 파일에서 가져옴
    """
    try:
        # django.db.utils.ProgrammingError 피하기 위해 여기서 임포트
        from utils.models import School
        
        # DB에 데이터가 있는지 확인
        if School.objects.exists():
            return [(str(school.school_id), school.name) for school in School.objects.all()]
    except:
        pass
    
    # DB에 데이터가 없거나 오류 발생 시 파일에서 가져옴
    file_path = os.path.join(settings.BASE_DIR, 'utils', filename)
    with open(file_path, 'r') as file:
        data = json.load(file)
        return [(str(item['id']), item['name']) for item in data]

def load_schools_from_json(filename='domain.json'):
    """
    모든 학교 정보를 반환하는 함수
    DB에 데이터가 있으면 DB에서 가져오고, 없으면 JSON 파일에서 가져옴
    """
    try:
        # django.db.utils.ProgrammingError 피하기 위해 여기서 임포트
        from utils.models import School, SchoolDomain
        
        # DB에 데이터가 있는지 확인
        if School.objects.exists():
            schools = []
            for school in School.objects.prefetch_related('domains').all():
                schools.append({
                    'id': school.school_id,
                    'name': school.name,
                    'domains': [domain.domain for domain in school.domains.all()]
                })
            return schools
    except:
        pass
        
    # DB에 데이터가 없거나 오류 발생 시 파일에서 가져옴
    file_path = os.path.join(settings.BASE_DIR, 'utils', filename)
    with open(file_path, 'r') as file:
        return json.load(file)

def import_json_to_db(filename='domain.json'):
    """
    JSON 파일의 데이터를 DB로 가져오는 함수
    """
    from utils.models import School, SchoolDomain
    
    file_path = os.path.join(settings.BASE_DIR, 'utils', filename)
    with open(file_path, 'r') as file:
        data = json.load(file)
        
    for school_data in data:
        school, created = School.objects.update_or_create(
            school_id=school_data['id'],
            defaults={'name': school_data['name']}
        )
        
        # 기존 도메인 삭제 후 새로 추가
        school.domains.all().delete()
        
        for domain in school_data.get('domains', []):
            if domain:  # 빈 도메인 제외
                SchoolDomain.objects.create(school=school, domain=domain)
                
    return len(data)