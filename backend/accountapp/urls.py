from django.contrib.auth.views import LogoutView, LoginView
from django.urls import path
from django.views.generic import TemplateView

from accountapp.views import AccountCreateAPI
from accountapp.views import ActivateAccountAPI
from accountapp.views import LoginAPI

app_name = 'account'

urlpatterns = [
    path('signup/', AccountCreateAPI.as_view(), name='signup'),
    path('activate/<uidb64>/<token>/', ActivateAccountAPI.as_view(), name='activate'),
    path('login/', LoginAPI.as_view(), name='login'),
]