from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
	path('api/profile_list/', views.profile_list, name='profile_list'),
	path('api/get_profile/<str:username>/', views.get_profile, name='get_profile'),
]
