from django.contrib import admin

# Register your models here.

from .models import Game, Player

admin.site.register(Game)
admin.site.register(Player)