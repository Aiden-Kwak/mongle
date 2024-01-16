from django.shortcuts import render
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from django.contrib.auth import get_user_model
from accountapp.token import account_activation_token
from accountapp.models import User
from accountapp.serializers import AccountCreateSerializer
from django.conf import settings
from django.urls import reverse

class AccountCreateAPI(APIView):
    def post(self, request):
        serializer = AccountCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            current_site = get_current_site(request)
            mail_subject = '[ Mongle ]이메일 인증을 완료해주세요!'
            # URL 생성
            activation_link = request.build_absolute_uri(
                reverse('account:activate', kwargs={
                    'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': account_activation_token.make_token(user)
                })
            )
            message = render_to_string('accountapp/validation_email.html', {
                'user': user,
                'activation_link': activation_link,
            })
            to_email = serializer.validated_data['email']
            send_mail(mail_subject, message, 'dev.mongle@gmail.com', [to_email])

            return Response({'message': '회원가입이 완료되었습니다.'}, status=HTTP_201_CREATED)
        return Response(serializer.error, status=HTTP_400_BAD_REQUEST)
    
# 계정활성화
class ActivateAccountAPI(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': '이메일 인증이 완료되었습니다.'})
        else:
            return Response({'message': '이메일 인증이 실패하였습니다.'})