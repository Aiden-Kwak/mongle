from django.contrib import admin
from .models import School, SchoolDomain
from django import forms
import json
from django.contrib import messages
from django.shortcuts import redirect
from django.urls import path
from django.template.response import TemplateResponse
from django.conf import settings
import os

class SchoolDomainInline(admin.TabularInline):
    model = SchoolDomain
    extra = 1

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'school_id', 'get_domains')
    search_fields = ('name',)
    inlines = [SchoolDomainInline]
    
    def get_domains(self, obj):
        return ", ".join([domain.domain for domain in obj.domains.all()])
    get_domains.short_description = '도메인 목록'
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import-json/', self.admin_site.admin_view(self.import_json_view), name='import-json'),
            path('export-json/', self.admin_site.admin_view(self.export_json_view), name='export-json'),
        ]
        return custom_urls + urls
    
    def import_json_view(self, request):
        if request.method == 'POST':
            json_file = request.FILES.get('json_file')
            if json_file:
                try:
                    data = json.load(json_file)
                    
                    for school_data in data:
                        school, created = School.objects.update_or_create(
                            school_id=school_data['id'],
                            defaults={'name': school_data['name']}
                        )
                        
                        # 기존 도메인 삭제
                        school.domains.all().delete()
                        
                        # 새 도메인 추가
                        for domain in school_data.get('domains', []):
                            if domain:  # 빈 도메인 제외
                                SchoolDomain.objects.create(school=school, domain=domain)
                    
                    self.message_user(request, f"{len(data)}개 학교 데이터를 성공적으로 가져왔습니다.", messages.SUCCESS)
                    return redirect('..')
                except Exception as e:
                    self.message_user(request, f"데이터 가져오기 실패: {e}", messages.ERROR)
            else:
                self.message_user(request, "JSON 파일을 선택해주세요.", messages.ERROR)
                
        return TemplateResponse(request, 'admin/utils/school/import_json.html', {})
    
    def export_json_view(self, request):
        schools = School.objects.all().prefetch_related('domains')
        export_data = []
        
        for school in schools:
            school_data = {
                "id": school.school_id,
                "name": school.name,
                "domains": [domain.domain for domain in school.domains.all()]
            }
            export_data.append(school_data)
        
        response = TemplateResponse(request, 'admin/utils/school/export_json.html', {
            'export_data': json.dumps(export_data, indent=4, ensure_ascii=False)
        })
        return response

@admin.register(SchoolDomain)
class SchoolDomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'school')
    list_filter = ('school',)
    search_fields = ('domain', 'school__name') 