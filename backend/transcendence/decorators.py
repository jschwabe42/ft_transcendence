from functools import wraps
from django.utils.translation import gettext as _
from django.conf import settings
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken


def login_required_redirect(view_func):
	"""
	Decorator that checks for both JWT authentication and session authentication.
	Returns JSON responses for SPA compatibility.
	"""

	@wraps(view_func)
	def _wrapper(request, *args, **kwargs):
		auth = JWTAuthentication()
		access_token = request.COOKIES.get('access_token')
		refresh_token = request.COOKIES.get('refresh_token')

		def create_unauthorized_response():
			is_logged = request.user.is_authenticated
			response = JsonResponse(
				{
					'message': _('Invalid JWT Token. Please Login'),
					'invalid_jwt': True,
					'redirected': True,
					'is_logged': is_logged,
				},
				status=401,
			)
			return response

		def set_secure_cookie(response, name, value):
			response.set_cookie(
				name,
				value,
				max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
				httponly=True,
				secure=True,
				samesite='Lax',
				domain=settings.SESSION_COOKIE_DOMAIN,
			)

		# Check JWT authentication first
		if access_token:
			try:
				validated_token = auth.get_validated_token(access_token)
				user = auth.get_user(validated_token)
				request.user = user
				return view_func(request, *args, **kwargs)

			except (InvalidToken, TokenError):
				print('NEW ACCESS TOKEN', flush=True)
				if refresh_token:
					try:
						refresh = RefreshToken(refresh_token)
						new_access_token = str(refresh.access_token)

						response = view_func(request, *args, **kwargs)
						set_secure_cookie(response, 'access_token', new_access_token)
						return response

					except (InvalidToken, TokenError):
						return create_unauthorized_response()
				return create_unauthorized_response()

		return create_unauthorized_response()

	return _wrapper
