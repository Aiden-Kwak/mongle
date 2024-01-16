from datetime import datetime, timedelta, timezone

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.validators import RegexValidator, EmailValidator
from django.utils import timezone

# Create your models here.
class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, username, email=None, password=None):
        if not username:
            raise ValueError('must have username')
        user=self.model(
            username=username,
            email=email,
        )
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, username, email, password):
        superuser=self.create_user(
            username=username,
            email=email,
            password=password,
        )
        superuser.is_admin=True
        superuser.is_superuser=True
        superuser.is_staff=True
        superuser.save()
        return superuser
    
class User(AbstractBaseUser):

    SCHOOL_CHOICES = (
        ('0','성균관대학교'),
        ('1','광주과학기술원'),
        ('2','서강대학교'),
        ('3','울산과학기술원'),
        ('4','중앙대학교'),
        ('5','한국과학기술원'),
        ('6','한양대학교'),
        ('7','서울대학교'),
        ('8','연세대학교'),
        ('9','고려대학교'),
        ('10','경희대학교'),
        ('11','한국외국어대학교'),
        ('12','서울시립대학교'),
        ('13','가톨릭대학교'),
        ('14','건국대학교'),
        ('15','광운대학교'),
        ('16','국민대학교'),
        ('17','동국대학교'),
        ('18','서울과학기술대학교'),
        ('19','세종대학교'),
        ('20','숭실대학교'),
        ('21','홍익대학교'),
        ('22','가천대학교'),
        ('23','인하대학교'),
        ('24','아주대학교'),
        ('25','한국항공대학교'),
        ('26','이화여자대학교'),
        ('27','성신여자대학교'),
        ('28','서울여자대학교'),
        ('29','숙명여자대학교'),
        ('30','동덕여자대학교'),
        ('31','덕성여자대학교'),
        ('32','한국예술종합학교'),
        ('33','대구경북과학기술원'),
        ('34','포항공과대학교'),
        ('35','전남대학교'),
        ('36','한동대학교'),
        ('37','충남대학교'),
        ('38','부산대학교'),
    )

    username_pattern = RegexValidator(r'^[0-9a-zA-Z_]{5,20}$', '5-20글자 사이의 숫자,영문,언더바만 가능합니다!')
    objects = UserManager()

    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=20, null=False,
                                unique=True, validators=[username_pattern])
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    school = models.CharField(choices=SCHOOL_CHOICES, max_length=2, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin
    
    
