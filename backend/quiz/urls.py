from django.urls import path
from . import views

app_name = 'quiz'

urlpatterns = [
	path('', views.quiz_home, name='quiz_home'),  # Default route for the quiz app
	path('create/', views.create_room, name='create_room'),
	path('room/<str:room_name>/', views.join_room, name='join_room'),
	path('room/<str:room_name>/leave/', views.leave_room, name='leave_room'),
	path('room/<str:room_name>/ingame/', views.game_view, name='game_view'),
	path('room/<str:room_name>/submit_answer/', views.submit_answer, name='submit_answer'),
	path('room/<str:room_name>/get_correct_answer/', views.get_correct_answer, name='get_correct_answer'),
	path('start_game/<str:room_name>/', views.start_game, name='start_game'),
]
