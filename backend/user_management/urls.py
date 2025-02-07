from django.urls import path, re_path

from . import views
from .api_views import CreateOAUTHUserView

app_name = 'users'
urlpatterns = [
	path('api/register/', views.register, name='register'),
	path('api/login/', views.login_view, name='login'),
	path('api/logout/', views.logout_view, name='logout'),
	path('api/get_account_details/', views.get_account_details, name='get-account-details'),
	path('api/update_profile/', views.update_profile, name='update-profile'),
	path('api/change_password/', views.change_password, name='change-password'),
	path('api/check_authentication/', views.check_authentication, name='check-authentication'),
	# friendship management: both `user` and `users` prefix
	re_path(r'^user(s)?/(?P<query_user>[^/]+)$', views.public_profile, name='public-profile'),
	re_path(
		r'^user(s)?/(?P<target_username>[^/]+)/friend-request$',
		views.friend_request,
		name='friend-request',
	),
	re_path(
		r'^user(s)?/(?P<target_username>[^/]+)/cancel-friend-request$',
		views.cancel_friend_request,
		name='cancel-friend-request',
	),
	re_path(
		r'^user(s)?/(?P<origin_username>[^/]+)/deny-friend-request$',
		views.deny_friend_request,
		name='deny-friend-request',
	),
	re_path(
		r'^user(s)?/(?P<origin_username>[^/]+)/accept-friend-request$',
		views.accept_friend_request,
		name='accept-friend-request',
	),
	re_path(
		r'^user(s)?/(?P<other_username>[^/]+)/remove-friend$',
		views.remove_friend,
		name='remove-friend',
	),
	# WIP: oauth with 42 API
	path('oauth/', CreateOAUTHUserView.request_login_oauth, name='oauth'),
	path('oauth', CreateOAUTHUserView.request_login_oauth, name='oauth'),
	path(
		'oauth/callback',
		CreateOAUTHUserView.as_view(),
		name='oauth-callback',
	),
]
