from urllib.parse import urlencode

import requests
from django.contrib.auth import login
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from user_management.models import CustomUser

OAUTH_CALLBACK = 'http://localhost:8000/users/oauth-callback/'


class OauthView(APIView):
	from transcendence.settings import CLIENT_ID, REMOTE_OAUTH_SECRET, SECRET_STATE

	def post(self, request):
		"""provide user with generated link for login on API endpoint: `/users/api/oauth/`"""
		params = {
			'client_id': OauthView.CLIENT_ID,
			'redirect_uri': OAUTH_CALLBACK,
			'response_type': 'code',
			'state': OauthView.SECRET_STATE,
			'scope': 'public',
		}
		auth_url = {'location': f'https://api.intra.42.fr/oauth/authorize?{urlencode(params)}'}
		return JsonResponse(auth_url)


class OauthCallBackView(APIView):
	permission_classes = [AllowAny]
	from transcendence.settings import CLIENT_ID, REMOTE_OAUTH_SECRET, SECRET_STATE

	def __get_or_create_oauth(jsonresponse):
		"""get or create user from oauth: this should be infallible"""
		user_instance = CustomUser.objects.filter(oauth_id=jsonresponse['login'])
		if not user_instance.exists():
			# create the account
			user_instance = CustomUser.objects.create_user(
				username=jsonresponse['login'],
				oauth_id=jsonresponse['login'],
				email=jsonresponse['email'],
			)
			user_instance.set_unusable_password()
			user_instance.save()
			assert user_instance.check_password('') is False
		else:
			user_instance = CustomUser.objects.filter(oauth_id=jsonresponse['login']).first()
		return user_instance

	def post(self, request):
		"""
		handle the callback from the 42 API: obtain user public data and log them in

		API endpoint: `/users/api/oauth-callback/`
		"""
		from transcendence.settings import SECRET_STATE

		code = request.GET.get('code')
		state = request.GET.get('state')
		if code is None:
			return JsonResponse({'success': False, 'error': 'could not obtain code from callback'})
		if state != SECRET_STATE:
			return JsonResponse({'success': False, 'error': 'state mismatch'})

		params = {
			'grant_type': 'authorization_code',
			'client_id': OauthCallBackView.CLIENT_ID,
			'client_secret': OauthCallBackView.REMOTE_OAUTH_SECRET,
			'code': code,
			'redirect_uri': OAUTH_CALLBACK,
			'state': OauthCallBackView.SECRET_STATE,
		}

		bearer_token_response = requests.post(
			f'https://api.intra.42.fr/oauth/token?{urlencode(params)}'
		)

		try:
			bearer_token_response.raise_for_status()
		except:  # noqa: E722
			return JsonResponse({'success': False, 'error': 'could not obtain bearer token'})
		bearer_token_response = bearer_token_response.json()
		BEARER_TOKEN = bearer_token_response['access_token']
		if BEARER_TOKEN is None:
			return JsonResponse({'success': False, 'error': 'bearer token invalid/not found'})
		response = requests.get(
			'https://api.intra.42.fr/v2/me',
			headers={
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': f'Bearer {BEARER_TOKEN}',
			},
		)
		jsonresponse = response.json()
		if not response.ok or jsonresponse['login'] is None:
			return JsonResponse({'success': False, 'error': 'could not obtain username from token'})
		user_instance = OauthCallBackView.__get_or_create_oauth(jsonresponse)
		# log the user into the account - this took way longer than it should have
		login(request, user=user_instance)
		return JsonResponse({'success': True, 'csrftoken': get_token(request)})
