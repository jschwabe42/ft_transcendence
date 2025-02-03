import django.shortcuts
import requests
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView


# @audit fate TBD!
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
	OAUTH_CALLBACK = 'http%3A%2F%2Flocalhost%3A8000%2Fusers%2Foauth%2Fcallback'
	from transcendence.settings import CLIENT_ID, REMOTE_OAUTH_SECRET, SECRET_STATE

	# @audit fate TBD!
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
		"""request login on endpoint https://api.intra.42.fr/oauth/authorize"""

		base_url = 'https://api.intra.42.fr/oauth/authorize'
		params = {
			'client_id': CreateOAUTHUserView.CLIENT_ID,
			'redirect_uri': CreateOAUTHUserView.OAUTH_CALLBACK,
			'response_type': 'code',
			'state': CreateOAUTHUserView.SECRET_STATE,
			'scope': 'public',
		}

		auth_url = f'{base_url}?{"&".join(f"{k}={v}" for k, v in params.items())}'

		return django.shortcuts.redirect(auth_url)

	def get(self, request):
		"""handle the callback from the 42 API: exchange code for bearer token"""
		from transcendence.settings import SECRET_STATE

		code = request.GET.get('code')
		state = request.GET.get('state')

		if code is None:
			return HttpResponse('Error: user did not authorize the app')

		if state is None or state != SECRET_STATE:
			return HttpResponse('Error: state mismatch')

		base_url = 'https://api.intra.42.fr/oauth/token'

		params = {
			'grant_type': 'authorization_code',
			'client_id': CreateOAUTHUserView.CLIENT_ID,
			'client_secret': CreateOAUTHUserView.REMOTE_OAUTH_SECRET,
			'code': code,
			'redirect_uri': CreateOAUTHUserView.OAUTH_CALLBACK,
			'state': CreateOAUTHUserView.SECRET_STATE,
		}

		exchange_url = f'{base_url}?{"&".join(f"{k}={v}" for k, v in params.items())}'

		bearer_token_httpresponse = requests.post(exchange_url)
		if bearer_token_httpresponse is None:
			return HttpResponse('Error: could not exchange code for token')
		# try obtaining the username from token
		bearer_token = bearer_token_httpresponse.json()['access_token']
		if bearer_token is None:
			return HttpResponse('Error: bearer token invalid/not found')
		headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': f'Bearer {bearer_token}',
		}
		url = 'https://api.intra.42.fr/v2/me'

		response = requests.get(url, headers=headers)
		# to check that the request was successful - token is valid
		response.raise_for_status()
		username = response.json()['login']
		if username is None:
			return HttpResponse('Error: could not obtain username from token')
		print(username, flush=True)
		# @todo handle user creation from response
		return HttpResponse(response, content_type='text/html')
