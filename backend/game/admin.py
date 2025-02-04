from django.contrib import admin

# Register your models here.

from .models import Game, Dashboard

admin.site.register(Game)
admin.site.register(Dashboard)