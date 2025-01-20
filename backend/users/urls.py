from django.urls import path
from . import views

app_name = "users"
urlpatterns = [
	path('<str:query_user>', views.public_profile, name='user-profile'),

	# WIP Friendships
	path('<str:target_username>/friend-request', views.friend_request, name='user-profile'),
	path('<str:target_username>/cancel-friend-request', views.cancel_friend_request, name='user-profile'),
	path('<str:origin_username>/deny-friend-request', views.deny_friend_request, name='user-profile'),
	path('<str:origin_username>/accept-friend-request', views.accept_friend_request, name='user-profile'),
	path('<str:other_username>/remove-friend', views.remove_friend, name='user-profile'),
]