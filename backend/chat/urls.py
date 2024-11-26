from django.urls import path
from . import views


urlpatterns = [
	path('', views.show_all_chats, name='chat'),
	path('<int:room_id>/', views.room_detail, name='room_detail'),
]
