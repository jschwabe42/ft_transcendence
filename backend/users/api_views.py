import django.shortcuts
import requests
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .models import OAuthUsers


class CreateOAUTHUserView(APIView):
	permission_classes = [AllowAny]
	OAUTH_CALLBACK = 'http%3A%2F%2Flocalhost%3A8000%2Fusers%2Foauth%2Fcallback'
	from transcendence.settings import CLIENT_ID, REMOTE_OAUTH_SECRET, SECRET_STATE

	def request_login_oauth(self):
		"""request user login on API endpoint"""
		params = {
			'client_id': CreateOAUTHUserView.CLIENT_ID,
			'redirect_uri': CreateOAUTHUserView.OAUTH_CALLBACK,
			'response_type': 'code',
			'state': CreateOAUTHUserView.SECRET_STATE,
			'scope': 'public',
		}

		auth_url = f'https://api.intra.42.fr/oauth/authorize?{"&".join(f"{k}={v}" for k, v in params.items())}'

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
			'client_id': CreateOAUTHUserView.CLIENT_ID,
			'client_secret': CreateOAUTHUserView.REMOTE_OAUTH_SECRET,
			'code': code,
			'redirect_uri': CreateOAUTHUserView.OAUTH_CALLBACK,
			'state': CreateOAUTHUserView.SECRET_STATE,
		}

		bearer_token_response = requests.post(
			f'https://api.intra.42.fr/oauth/token?{"&".join(f"{k}={v}" for k, v in params.items())}'
		)
		# Error: could not exchange code for token
		bearer_token_response.raise_for_status()
		return bearer_token_response.json()['access_token']

	def login_or_create(request, username, email):
		"""handle user management from oauth"""
		already_exists = OAuthUsers.objects.filter(login=username)
		if not already_exists.exists():
			# create the account
			user = OAuthUsers.create(username, email)
		else:
			user = already_exists.first()
		# log the user into the account
		user.login(request)

	def get(self, request):
		"""handle the callback from the 42 API: obtain user public data"""
		BEARER_TOKEN = CreateOAUTHUserView.__bearer_token(self, request)
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
		username, email = response.json()['login'], response.json()['email']
		if username is None or email is None:
			return HttpResponse('Error: could not obtain username from token')
		CreateOAUTHUserView.login_or_create(request, username, email)
		return HttpResponse(response, content_type='text/html')
