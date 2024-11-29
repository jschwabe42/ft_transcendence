from django.urls import path
from . import views

app_name = 'quiz'

urlpatterns = [
	path('', views.quiz_home, name='quiz_home'),  # Default route for the quiz app
	path('create/', views.create_room, name='create_room'),
	path('room/<str:room_name>/', views.join_room, name='join_room'),
	path('room/<str:room_name>/leave/', views.leave_room, name='leave_room')
]
