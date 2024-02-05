from django.urls import path
from .views import FriendListAPI

app_name = 'friends'

urlpatterns = [
    path('list/', FriendListAPI.as_view(), name='friend_list'),
]