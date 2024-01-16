from django.contrib.auth.views import LogoutView, LoginView
from django.urls import path
from django.views.generic import TemplateView

from accountapp.views import AccountCreateView

app_name = 'account'

urlpatterns = [
    path('signup/', AccountCreateView.as_view(), name='signup')
]