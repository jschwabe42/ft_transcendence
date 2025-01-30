from django.urls import path, re_path
from . import views

app_name = 'quiz'

urlpatterns = [
	path('create_room/', views.create_room, name='create_room'),
	path('api/room_list/', views.room_list, name='room_list'),
	path('api/get_room_settings/<int:room_id>/', views.get_room_settings, name='get_room_settings'),
	path('join_room/<int:room_id>/', views.join_room, name='join_room'),
	path('leave_room/<int:room_id>/', views.leave_room, name='leave_room'),
	path('update_room_settings/<int:room_id>/', views.update_room_settings, name='update_room_settings'),
	path('start_game/<int:room_id>/', views.start_game, name='start_game'),
	path('submit_answer/<int:room_id>/', views.submit_answer, name='submit_answer'),
	# path('', views.index, name='index'),
	# re_path(r'^.*$', views.index, name='index'),
]
