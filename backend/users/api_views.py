from rest_framework.views import APIView

class CreateOAUTHUserView(APIView):
	bearer_token = None
	def __init__(self):
		"""set the bearer token"""
		import requests
		from transcendence.settings import REMOTE_OAUTH_SECRET, CLIENT_ID, SECRET_STATE
		url = "https://api.intra.42.fr/oauth/token"

		payload = 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + REMOTE_OAUTH_SECRET
		# print(payload, flush=True)
		headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
		}
		response = requests.post(url, headers=headers, data=payload)
		self.bearer_token = response.json()['access_token']
		# print(self.bearer_token, flush=True)
