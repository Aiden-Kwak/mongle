from django.urls import path
from .views import DeleteDMNotificationAPI

app_name = 'notifications'

urlpatterns = [
    path('delete/dm/<str:friend_username>/', DeleteDMNotificationAPI.as_view(), name='delete_dm_notification'),
]