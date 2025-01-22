from django.urls import path
from . import views

app_name = "users"
urlpatterns = [
    path("players/", views.players, name="players"),
	path('<str:query_user>', views.public_profile, name='public-profile'),

	# friendship management
	path('<str:target_username>/friend-request', views.friend_request, name='friend-request'),
	path('<str:target_username>/cancel-friend-request', views.cancel_friend_request, name='cancel-friend-request'),
	path('<str:origin_username>/deny-friend-request', views.deny_friend_request, name='deny-friend-request'),
	path('<str:origin_username>/accept-friend-request', views.accept_friend_request, name='accept-friend-request'),
	path('<str:other_username>/remove-friend', views.remove_friend, name='remove-friend'),
]