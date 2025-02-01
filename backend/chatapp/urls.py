from django.urls import path
from .views import MessageListAPI, RemoveMessageAPI, CreateGroupChatView, GroupChatRoomsView

app_name = 'chatapp'

urlpatterns = [
    path('dm/<str:friend_username>/', MessageListAPI.as_view(), name='dm_detail'),
    path('remove-messages/<str:friend_username>/', RemoveMessageAPI.as_view(), name='remove_messages'),
    #path('dm/active-status/', DMActiveStatusAPI.as_view(), name='dm_active_status'),
    path('group-chat/create/', CreateGroupChatView.as_view(), name='create_group_chat'),
    path('group-rooms/', GroupChatRoomsView.as_view(), name='group_chat_rooms'),
]