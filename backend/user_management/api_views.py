from urllib.parse import urlencode

import django.shortcuts
import requests
from django.contrib.auth import login

# import rest_framework
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from user_management.models import CustomUser


class OauthView(APIView):
	permission_classes = [AllowAny]
	OAUTH_CALLBACK = 'http://localhost:8000/users/oauth/callback'
	from transcendence.settings import CLIENT_ID, REMOTE_OAUTH_SECRET, SECRET_STATE

	def request_login_oauth(self):
		"""request user login on API endpoint"""
		params = {
			'client_id': OauthView.CLIENT_ID,
			'redirect_uri': OauthView.OAUTH_CALLBACK,
			'response_type': 'code',
			'state': OauthView.SECRET_STATE,
			'scope': 'public',
		}

		auth_url = f'https://api.intra.42.fr/oauth/authorize?{urlencode(params)}'

		return django.shortcuts.redirect(auth_url)

	def __bearer_token(self, request):
		"""exchange the code for a users' bearer token"""
		from transcendence.settings import SECRET_STATE

		code = request.GET.get('code')
		state = request.GET.get('state')
		if code is None:
			return HttpResponse('Error: user did not authorize the app')
		if state != SECRET_STATE:
			return HttpResponse('Error: state mismatch')

		params = {
			'grant_type': 'authorization_code',
			'client_id': OauthView.CLIENT_ID,
			'client_secret': OauthView.REMOTE_OAUTH_SECRET,
			'code': code,
			'redirect_uri': OauthView.OAUTH_CALLBACK,
			'state': OauthView.SECRET_STATE,
		}

		bearer_token_response = requests.post(
			f'https://api.intra.42.fr/oauth/token?{urlencode(params)}'
		)
		# Error: could not exchange code for token
		bearer_token_response.raise_for_status()
		return bearer_token_response.json()

	def __create_user(request, jsonresponse, BEARER_TOKEN, REFRESH_TOKEN):
		"""handle user management from oauth"""
		user_instance = CustomUser.objects.filter(oauth_id=jsonresponse['login'])
		if not user_instance.exists():
			# create the account
			user_instance = CustomUser.objects.create_user(
				username=jsonresponse['login'],
				oauth_id=jsonresponse['login'],
				email=jsonresponse['email'],
			)
		else:
			user_instance = CustomUser.objects.filter(oauth_id=jsonresponse['login']).first()
		# log the user into the account - this took way longer than it should have
		print(user_instance)
		# user = authenticate(request, username=user.instance)
		# WIP: this is not working with @login_required
		login(request, user=user_instance)
		from .views import public_profile

		return public_profile(request, jsonresponse['login'])

	def get(self, request):
		"""handle the callback from the 42 API: obtain user public data"""
		bearer_token_response = OauthView.__bearer_token(self, request)
		BEARER_TOKEN = bearer_token_response.get('access_token')
		REFRESH_TOKEN = bearer_token_response.get('refresh_token')
		if BEARER_TOKEN is None:
			return HttpResponse('Error: bearer token invalid/not found')
		response = requests.get(
			'https://api.intra.42.fr/v2/me',
			headers={
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': f'Bearer {BEARER_TOKEN}',
			},
		)
		if not response.ok:
			django.contrib.messages.error(request, 'user did not authorize')
			return django.shortcuts.redirect('users:login')
		jsonresponse = response.json()
		username, email = jsonresponse['login'], jsonresponse['email']
		if username is None or email is None:
			return HttpResponse('Error: could not obtain username from token')
		return OauthView.__create_user(request, jsonresponse, BEARER_TOKEN, REFRESH_TOKEN)
