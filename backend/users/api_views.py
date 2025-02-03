import django.shortcuts
import requests
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView


def get_bearer_token():
	"""get the bearer token"""
	from transcendence.settings import CLIENT_ID, REMOTE_OAUTH_SECRET

	url = 'https://api.intra.42.fr/oauth/token'

	payload = (
		'grant_type=client_credentials&client_id='
		+ CLIENT_ID
		+ '&client_secret='
		+ REMOTE_OAUTH_SECRET
	)
	# print(payload, flush=True)
	headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
	}
	response = requests.post(url, headers=headers, data=payload)
	return response.json()['access_token']


class CreateOAUTHUserView(APIView):
	permission_classes = [AllowAny]
	REDIRECT_URI = 'http%3A%2F%2Flocalhost%3A8000%2Fusers'

	# from transcendence.settings import CLIENT_ID, SECRET_STATE
	def authorize_api_user(self):
		"""authorize the user using a request to the 42 API"""
		BEARER_TOKEN = get_bearer_token()
		url = 'https://api.intra.42.fr/oauth/authorize'

		# payload = 'grant_type=client_credentials&client_id=' + CLIENT_ID \
		# 	+ '&redirect_uri=http%3A%2F%2Flocalhost%3A8080&scope=public' \
		# 	+ '&state=' + SECRET_STATE + '&response_type=scope'
		token = BEARER_TOKEN
		assert token is not None, 'Bearer token is not set'
		headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': f'Bearer {token}',
		}

		response = requests.get(url, headers=headers)
		return HttpResponse(response, content_type='text/html')

	def request_login_oauth(self):
		from transcendence.settings import CLIENT_ID, SECRET_STATE

		"""request login on endpoint https://api.intra.42.fr/oauth/authorize"""

		base_url = 'https://api.intra.42.fr/oauth/authorize'
		params = {
			'client_id': CLIENT_ID,
			'redirect_uri': CreateOAUTHUserView.REDIRECT_URI,
			'response_type': 'code',
			'state': SECRET_STATE,
			'scope': 'public',
		}

		auth_url = f'{base_url}?{"&".join(f"{k}={v}" for k, v in params.items())}'

		return django.shortcuts.redirect(auth_url)
