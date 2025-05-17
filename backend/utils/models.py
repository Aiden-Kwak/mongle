from django.db import models
from django.core.exceptions import ValidationError
import json

class School(models.Model):
    school_id = models.IntegerField(unique=True, help_text="기존 JSON에서 사용하던 ID")
    name = models.CharField(max_length=100, help_text="학교 이름")
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
        verbose_name = '학교'
        verbose_name_plural = '학교 목록'

class SchoolDomain(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='domains')
    domain = models.CharField(max_length=100, help_text="학교 이메일 도메인 (예: example.ac.kr)")
    
    def __str__(self):
        return f"{self.school.name} - {self.domain}"
    
    class Meta:
        unique_together = ['school', 'domain']
        verbose_name = '학교 도메인'
        verbose_name_plural = '학교 도메인 목록'
        
    def clean(self):
        # 도메인 형식 검증
        if not '.' in self.domain:
            raise ValidationError("유효한 도메인 형식이 아닙니다.") 