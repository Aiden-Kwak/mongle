from django.core.management.base import BaseCommand
from utils.school_loader import import_json_to_db

class Command(BaseCommand):
    help = 'domain.json 파일에서 학교와 도메인 정보를 데이터베이스로 가져옵니다.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            default='domain.json',
            help='JSON 파일 경로 (기본값: domain.json)',
        )

    def handle(self, *args, **options):
        file_name = options['file']
        try:
            count = import_json_to_db(file_name)
            self.stdout.write(
                self.style.SUCCESS(f'성공적으로 {count}개의 학교 데이터를 가져왔습니다.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'데이터 가져오기 실패: {e}')
            ) 