from django.contrib import admin
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
import redis
import os

# Redis 연결 (decode_responses=False로 설정하여 값이 bytes로 반환됨)
REDIS_URL = os.environ.get('REDIS_URL')
if REDIS_URL!="redis://redis":
    REDIS_URL = "redis://localhost"

redis_client = redis.StrictRedis.from_url(REDIS_URL, decode_responses=False)

def redis_list(request):
    """ Redis 키-값 목록을 표시하는 Admin 페이지 (카테고리별 분류 포함) """
    keys = redis_client.keys('*')

    categorized_data = {
        "group": [],
        "channel": [],
        "room": [],
        "dm": [],
        "others": []
    }

    for key in keys:
        key_decoded = key.decode("utf-8")  # bytes -> string 변환
        key_type = redis_client.type(key)

        try:
            if key_type == b"string":
                value = redis_client.get(key)
                value = value.decode("utf-8")
            elif key_type == b"list":
                value = [item.decode("utf-8") for item in redis_client.lrange(key, 0, -1)]
            elif key_type == b"hash":
                value = {k.decode("utf-8"): v.decode("utf-8") for k, v in redis_client.hgetall(key).items()}
            elif key_type == b"set":
                value = {item.decode("utf-8") for item in redis_client.smembers(key)}
            elif key_type == b"zset":
                value = [(item.decode("utf-8"), score) for item, score in redis_client.zrange(key, 0, -1, withscores=True)]
            else:
                value = "(Unsupported Type)"
        except UnicodeDecodeError:
            value = "(Binary Data)"  

        # 키 이름을 기준으로 분류
        if key_decoded.startswith("group"):
            categorized_data["group"].append({"key": key_decoded, "value": value, "type": key_type.decode("utf-8")})
        elif key_decoded.startswith("channel"):
            categorized_data["channel"].append({"key": key_decoded, "value": value, "type": key_type.decode("utf-8")})
        elif key_decoded.startswith("room"):
            categorized_data["room"].append({"key": key_decoded, "value": value, "type": key_type.decode("utf-8")})
        elif key_decoded.startswith("dm"):
            categorized_data["dm"].append({"key": key_decoded, "value": value, "type": key_type.decode("utf-8")})
        else:
            categorized_data["others"].append({"key": key_decoded, "value": value, "type": key_type.decode("utf-8")})

    return render(request, "admin/redis_list.html", {"categorized_data": categorized_data})

def delete_key(request, key):
    """ 특정 Redis 키를 삭제 """
    redis_client.delete(key.encode("utf-8"))
    messages.success(request, f"Redis key '{key}' has been deleted.")
    return redirect('/admin/redis/')

# Django Admin 내부에서 URL을 추가
original_get_urls = admin.site.get_urls  

def get_urls():
    """ 기존 Django Admin의 URL 패턴을 유지하면서 admin/redis 추가 """
    urls = original_get_urls()
    custom_urls = [
        path('redis/', admin.site.admin_view(redis_list), name="redis_list"),
        path('redis/delete/<str:key>/', admin.site.admin_view(delete_key), name="redis_delete"),
    ]
    return custom_urls + urls  

admin.site.get_urls = get_urls  

# 기존 모델 등록 유지
from .models import Message
admin.site.register(Message)
