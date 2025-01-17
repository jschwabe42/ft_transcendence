from django.contrib import admin
from .models import Profile, Friends, Friends_Manager

admin.site.register(Profile)
admin.site.register(Friends)
# admin.site.register(Friends_Manager)# causes TypeError

# Register your models here.
