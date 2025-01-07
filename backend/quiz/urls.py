from django.urls import path
from . import views

app_name = 'quiz'

urlpatterns = [
	path('create_room/', views.create_room, name='create_room'),
	path('', views.index, name='index'),
]
