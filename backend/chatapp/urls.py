from django.urls import path
from .views import MessageListAPI

app_name = 'chatapp'

urlpatterns = [
    path('dm/<str:friend_username>/', MessageListAPI.as_view(), name='dm_detail'),
]