from django.urls import path

from . import views
from .api_views import OauthCallBackView, OauthView

app_name = 'users'
urlpatterns = [
	path('api/oauth/', OauthView.as_view(), name='oauth'),
	path('api/oauth-callback/', OauthCallBackView.as_view(), name='api-callback'),
	path('api/blocked/', views.blocked_users, name='blocked_users'),
	path('api/block/<str:username>/', views.block_user, name='block_user'),
	path('api/unblock/<str:username>/', views.unblock_user, name='unblock_user'),
	# friends: endpoints
	path('api/friends/active/', views.friends_users_active, name='friends'),
	path('api/friends/active/<str:username>/', views.friends_users_active, name='friends-public'),
	path('api/friends/inactive/', views.friends_requests, name='friends-requests'),
	path(
		'api/friends/request/<str:username>/',
		views.friends_send_request,
		name='friends-send-request',
	),
	path('api/register/', views.register, name='register'),
	path('api/login/', views.login_view, name='login'),
	path('api/logout/', views.logout_view, name='logout'),
	path('api/get_account_details/', views.get_account_details, name='get-account-details'),
	path('api/update_profile/', views.update_profile, name='update-profile'),
	path('api/change_password/', views.change_password, name='change-password'),
	path('api/check_authentication/', views.check_authentication, name='check-authentication'),
	# TODO: remove once dashboard is feature complete @follow-up
	path('<str:query_user>', views.public_profile, name='public-profile'),
	# friendship management: endpoints will be deprecated in favor of `api` prefix
	path('<str:target_username>/friend-request', views.friend_request, name='friends-request'),
	path(
		'<str:target_username>/cancel-friend-request',
		views.cancel_friend_request,
		name='friends-cancel',
	),
	path(
		'<str:origin_username>/deny-friend-request',
		views.deny_friend_request,
		name='friends-deny',
	),
	path(
		'<str:origin_username>/accept-friend-request',
		views.accept_friend_request,
		name='friends-accept',
	),
	path('<str:other_username>/remove-friend', views.remove_friend, name='friends-remove'),
]
