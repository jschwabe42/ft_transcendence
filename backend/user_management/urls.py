from django.urls import include, path

from . import views
from .api_views import OauthCallBackView, OauthView
from .friends_api import (
	accept_request,
	cancel_request,
	deny_request,
	friendships,
	remove,
	requests,
	send_request,
)
from .two_factor import (
	confirm_2fa,
	disable_2fa,
	enable_2fa,
	get_2fa_status,
	verify_2fa,
)

app_name = 'users'

# urls under `/users/api/friends/`
friends_urls = [
	path('active/', friendships, name='friends'),
	path('active/<str:username>/', friendships, name='friends-public'),
	path('inactive/', requests, name='friends-requests'),
	path('request/<str:username>/', send_request, name='friends-send-request'),
	path('cancel/<str:username>/', cancel_request, name='friends-cancel-request'),
	path('accept/<str:username>/', accept_request, name='friends-accept-request'),
	path('deny/<str:username>/', deny_request, name='friends-deny-request'),
	path('remove/<str:username>/', remove, name='friends-remove'),
]

# urls under `/users/api/2fa/`
mfa_urls = [
	path('status/', get_2fa_status, name='get-2fa-status'),
	path('enable/', enable_2fa, name='enable-2fa'),
	path('confirm/', confirm_2fa, name='confirm-2fa'),
	path('disable/', disable_2fa, name='disable-2fa'),
	path('verify/', verify_2fa, name='verify-2fa'),
]

urlpatterns = [
	# Add the custom verification of jwt url
	path('api/oauth/', OauthView.as_view(), name='oauth'),
	path('api/oauth-callback/', OauthCallBackView.as_view(), name='api-callback'),
	path('api/blocked/', views.blocked_users, name='blocked_users'),
	path('api/block/<str:username>/', views.block_user, name='block_user'),
	path('api/unblock/<str:username>/', views.unblock_user, name='unblock_user'),
	path('api/friends/', include(friends_urls)),
	path('api/register/', views.register, name='register'),
	path('api/login/', views.login_view, name='login'),
	path('api/logout/', views.logout_view, name='logout'),
	path('api/get_account_details/', views.get_account_details, name='get-account-details'),
	path('api/update_profile/', views.update_profile, name='update-profile'),
	path('api/change_password/', views.change_password, name='change-password'),
	path('api/check_authentication/', views.check_authentication, name='check-authentication'),
	# 2FA APIS
	path('api/2fa/', include(mfa_urls)),
]
