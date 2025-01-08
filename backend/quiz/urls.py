from django.urls import path
from . import views

app_name = 'quiz'

urlpatterns = [
	path('create_room/', views.create_room, name='create_room'),
	path('api/room_list/', views.room_list, name='room_list'),
	path('', views.index, name='index'),
]
