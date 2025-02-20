# users/views.py
import base64
import json
from io import BytesIO

import pyotp
import qrcode
from django.conf import settings
from django.contrib.auth import login, get_user_model
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from transcendence.decorators import login_required_redirect

from .models import CustomUser


@login_required_redirect
def get_2fa_status(request):
	return JsonResponse({'enabled': request.user.two_factor_enabled})


@api_view(['POST'])
@login_required_redirect
def enable_2fa(request):
	user = request.user

	# Generate new secret if none exists
	if not user.two_factor_secret:
		secret = pyotp.random_base32()
		user.two_factor_secret = secret
		user.save()

	# Generate QR code URI
	totp = pyotp.TOTP(user.two_factor_secret)
	uri = totp.provisioning_uri(
		name=user.email,
		issuer_name=settings.TOTP_ISSUER_NAME,
	)

	# Generate QR code image
	qr = qrcode.make(uri)
	buffer = BytesIO()
	qr.save(buffer)
	qr_base64 = base64.b64encode(buffer.getvalue()).decode()

	return JsonResponse(
		{
			'success': True,
			'secret': user.two_factor_secret,
			'qr_code_url': f'data:image/png;base64,{qr_base64}',
		}
	)


@login_required_redirect
def confirm_2fa(request):
	# Get the 2FA code from request
	try:
		if request.content_type == 'application/json':
			data = json.loads(request.body)
		else:
			data = request.POST
	except json.JSONDecodeError:
		return JsonResponse({'success': False, 'message': 'Invalid JSON format'}, status=400)

	code = data.get('code')
	user = request.user

	if not code:
		return JsonResponse({'success': False, 'message': '2FA code is required'}, status=400)

	if not user.two_factor_secret:
		return JsonResponse({'success': False, 'message': '2FA not initialized'}, status=400)

	# Verify TOTP code
	totp = pyotp.TOTP(user.two_factor_secret)
	if not totp.verify(code):
		return JsonResponse({'success': False, 'message': 'Invalid 2FA code'}, status=400)

	# Enable 2FA for the user
	user.two_factor_enabled = True
	user.save()

	return JsonResponse({'success': True, 'message': '2FA successfully enabled!'})


@login_required_redirect
def disable_2fa(request):
	try:
		data = json.loads(request.body)
		code = data.get('code')
	except json.JSONDecodeError:
		return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)

	user = request.user

	if not user.two_factor_enabled:
		return JsonResponse({'success': False, 'message': '2FA is not enabled'}, status=400)

	if not code or len(code) != 6:
		return JsonResponse(
			{'success': False, 'message': 'Valid 6-digit code required'}, status=400
		)

	# Verify 2FA code
	totp = pyotp.TOTP(user.two_factor_secret)
	if not totp.verify(code):
		return JsonResponse({'success': False, 'message': 'Invalid 2FA code'}, status=400)

	user.two_factor_enabled = False
	user.two_factor_secret = ''
	user.save()

	return JsonResponse({'success': True, 'message': '2FA successfully disabled'})


def verify_2fa(request):
	if request.method != 'POST':
		return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=400)

	try:
		data = json.loads(request.body)
		code = data.get('code')
		pre_auth_token = data.get('pre_auth_token')
	except json.JSONDecodeError:
		return JsonResponse({'success': False, 'message': 'Invalid JSON format'}, status=400)

	if not code or not pre_auth_token:
		return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)

	try:
		# Validate pre-authentication token
		access_token = AccessToken(pre_auth_token)
		try:
			access_token.verify()
		except TokenError:
			return JsonResponse({'success': False, 'message': 'Invalid token'}, status=401)

		username = data.get('username')

		User = get_user_model()
		# Get user from database
		user = User.objects.get(username=username)

		# Verify 2FA code
		totp = pyotp.TOTP(user.two_factor_secret)
		if not totp.verify(code):
			return JsonResponse({'success': False, 'message': 'Invalid 2FA code'}, status=400)

		# Generate final tokens
		login(request, user)
		refresh = RefreshToken.for_user(user)
		access_token = str(refresh.access_token)
		refresh_token = str(refresh)
		new_csrf_token = get_token(request)  # Changed this line

		# Create response
		response = JsonResponse(
			{
				'success': True,
				'message': 'Login successful',
				'access_token': access_token,
				'refresh_token': refresh_token,
				'csrf_token': new_csrf_token,
				'username': user.username,
			}
		)

		# Set secure cookies
		response.set_cookie(
			key='access_token',
			value=access_token,
			httponly=True,
			secure=True,  # Set to True in production
			samesite='Lax',
		)
		response.set_cookie(
			key='refresh_token',
			value=refresh_token,
			httponly=True,
			secure=True,  # Set to True in production
			samesite='Lax',
		)

		return response

	except TokenError:
		return JsonResponse({'success': False, 'message': 'Invalid or expired token'}, status=401)
	except CustomUser.DoesNotExist:
		return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
	except Exception as e:
		return JsonResponse({'success': False, 'message': str(e)}, status=500)
