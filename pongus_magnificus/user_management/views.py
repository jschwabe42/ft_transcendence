import json
import re
import uuid
from datetime import timedelta

from django.contrib.auth import (
	authenticate,
	get_user_model,
	login,
	logout,
	update_session_auth_hash,
)
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils.translation import gettext as _
from pyotp import TOTP
from rest_framework_simplejwt.tokens import RefreshToken
from transcendence.decorators import login_required_redirect

from .friends_blocked_users import Block_Manager, BlockedUsers

User = get_user_model()


@login_required_redirect
def block_user(request, username):
	"""
	Block a user. This will return an error if the user is already blocked.
	API Endpoint: /users/api/block/
	"""

	try:
		Block_Manager.block_user(blocker=request.user, target_username=username)
		return JsonResponse({'success': True, 'message': _('User blocked successfully.')})
	except ValidationError:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def unblock_user(request, username):
	"""
	Unblock a user. This is successful even if the user was not blocked.
	API Endpoint: /users/api/unblock/
	"""

	try:
		Block_Manager.unblock_user(origin=request.user, target_username=username)
		return JsonResponse({'success': True, 'message': _('User unblocked successfully.')})
	except ValidationError:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def blocked_users(request):
	"""
	Shows for the request user, their blocked users.
	API Endpoint: /users/api/blocked/
	"""
	blocked_by_request_user = BlockedUsers.objects.filter(blocker=request.user)
	if blocked_by_request_user.count() == 0:
		return JsonResponse({'success': True, 'blocked_users': []})
	return JsonResponse(
		{
			'success': True,
			'blocked_users': [blocked.blockee.username for blocked in blocked_by_request_user],
		}
	)


def register(request):
	"""
	Registers a new user.
	API Endpoint: /users/api/register/
	"""
	if request.method == 'POST':
		username = request.POST.get('username')
		email = request.POST.get('email')
		password1 = request.POST.get('password1')
		password2 = request.POST.get('password2')

		if password1 != password2:
			return JsonResponse(
				{'success': False, 'type': 'password', 'message': _('Passwords do not match.')}
			)
		validation_response = validate_data(username, email)
		if validation_response:
			return validation_response
		# If not done automatically, ensure passwords are checked for lenght etc
		user = User.objects.create_user(username=username, email=email, password=password1)
		user.save()
		return JsonResponse({'success': True, 'message': _('Account created successfully.')})
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


def login_view(request):
	"""
	Login a user with 2FA support.
	API Endpoint: /users/api/login/
	"""
	if request.method == 'POST':
		username = request.POST.get('username')
		password = request.POST.get('password')

		# Authenticate the user
		user = authenticate(request, username=username, password=password)
		if user is not None:
			# Check if 2FA is enabled
			if user.two_factor_enabled:
				refresh = RefreshToken.for_user(user)
				refresh.set_exp(lifetime=timedelta(minutes=5))
				new_csrf_token = get_token(request)

				return JsonResponse(
					{
						'success': True,
						'requires_2fa': True,
						'pre_auth_token': str(refresh.access_token),
						'username': username,
						'message': _('2FA required. Please enter your code.'),
					}
				)
			else:
				# No 2FA required
				login(request, user)
				new_csrf_token = get_token(request)
				refresh = RefreshToken.for_user(user)
				response = JsonResponse(
					{
						'success': True,
						'message': _('Login successful.'),
						'access_token': str(refresh.access_token),
						'refresh_token': str(refresh),
						'csrf_token': new_csrf_token,
						'username': username,
					}
				)

				response.set_cookie(
					key='access_token',
					value=str(refresh.access_token),
					httponly=True,
					secure=True,  # Set to True in production
					samesite='Lax',
				)
				response.set_cookie(
					key='refresh_token',
					value=str(refresh),
					httponly=True,
					secure=True,  # Set to True in production
					samesite='Lax',
				)
				return response
		else:
			return JsonResponse({'success': False, 'message': _('Invalid username or password!')})
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


def logout_view(request):
	"""
	Logout a user.
	API Endpoint: /users/api/logout/
	"""
	if request.method == 'POST':
		logout(request)
		new_csrf_token = get_token(request)

		response = JsonResponse(
			{'success': True, 'message': _('Logout successful.'), 'csrf_token': new_csrf_token}
		)

		# Clear cookies
		response.delete_cookie('access_token')
		response.delete_cookie('refresh_token')

		return response
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def get_account_details(request):
	"""
	Get the account details of the logged in user.
	API Endpoint: /users/api/get_account_details/
	"""
	if request.method == 'GET':
		user = request.user
		is_oauth = False
		if user.oauth_id:
			is_oauth = True
		return JsonResponse(
			{
				'success': True,
				'username': user.username,
				'email': user.email,
				'image_url': user.image.url,
				'is_oauth': is_oauth,
			}
		)
	else:
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})


@login_required_redirect
def update_profile(request):
	"""
	Inputs new profile data.
	API Endpoint: /users/api/update_profile/
	"""
	if request.method == 'POST':
		user = request.user
		username = request.POST.get('username')
		email = request.POST.get('email')
		if not user.oauth_id:
			password = request.POST.get('password')
		image = request.FILES.get('image')

		validation_response = validate_data(username, email, user)
		if validation_response:
			return validation_response

		if not user.oauth_id:
			if not authenticate(username=user.username, password=password):
				return JsonResponse({'success': False, 'message': _('Invalid password.')})
		if username:
			user.username = username
		if email:
			user.email = email
		if image:
			user.image = image
		user.save()
		return JsonResponse({'success': True, 'message': _('Profile updated successfully.')})
	return JsonResponse({'success': False, 'message': _('Invalid request method.')})


def validate_data(username, email, current_user=None):
	if email:
		try:
			validate_email(email)
		except ValidationError:
			return JsonResponse(
				{'success': False, 'type': 'mail', 'message': _('Invalid email address.')}
			)
		if current_user:
			if User.objects.filter(email=email).exclude(id=current_user.id).exists():
				return JsonResponse(
					{
						'success': False,
						'type': 'mail',
						'message': _('An Account with this email already exists.'),
					}
				)
		else:
			if User.objects.filter(email=email).exists():
				return JsonResponse(
					{
						'success': False,
						'type': 'mail',
						'message': _('An Account with this email already exists.'),
					}
				)
	if username:
		if len(username.strip()) == 0 or not re.match(r'^\w+$', username):
			return JsonResponse(
				{
					'success': False,
					'type': 'username',
					'message': _(
						'Invalid username. Username must contain only letters, numbers, and underscores, and cannot be empty or contain only whitespace.'
					),
				}
			)
		if current_user:
			if User.objects.filter(username=username).exclude(id=current_user.id).exists():
				return JsonResponse(
					{'success': False, 'type': 'username', 'message': _('Username already taken.')}
				)
		else:
			if User.objects.filter(username=username).exists():
				return JsonResponse(
					{'success': False, 'type': 'username', 'message': _('Username already taken.')}
				)
	return None


@login_required_redirect
def change_password(request):
	"""Change password with 2FA verification if enabled"""
	if request.method != 'POST':
		return JsonResponse({'success': False, 'message': _('Invalid request method.')})

	data = json.loads(request.body)
	user = request.user
	current_password = data.get('current_password')
	new_password = data.get('new_password')
	two_fa_code = data.get('two_fa_code')
	change_id = data.get('change_id')

	# Verify current password
	if not two_fa_code and not user.check_password(current_password):
		return JsonResponse({'success': False, 'message': _('Invalid current password.')})

	# Handle 2FA if enabled
	if user.two_factor_enabled:
		cache_key = f'pwd_change_{user.id}_{change_id}' if change_id else None

		# Initial request - store pending change and require 2FA
		if not two_fa_code:
			change_id = str(uuid.uuid4())
			cache.set(f'pwd_change_{user.id}_{change_id}', new_password, timeout=300)
			return JsonResponse(
				{
					'requires_2fa': True,
					'change_id': change_id,
					'message': _('2FA verification required'),
				}
			)

		# 2FA verification step
		pending_pwd = cache.get(cache_key)
		if not pending_pwd:
			return JsonResponse({'success': False, 'message': _('Invalid or expired request')})

		# Verify 2FA code
		totp = TOTP(user.two_factor_secret)
		if not totp.verify(two_fa_code):
			return JsonResponse({'success': False, 'message': _('Invalid 2FA code')})

		# Use the cached password from the initial request
		new_password = pending_pwd
		cache.delete(cache_key)

	# Change password and maintain session
	user.set_password(new_password)
	user.save()
	update_session_auth_hash(request, user)
	return JsonResponse({'success': True, 'message': _('Password changed successfully.')})


def check_authentication(request):
	"""
	Check if the user is authenticated.
	API Endpoint: /users/api/check_authentication/
	"""
	return JsonResponse({'is_authenticated': request.user.is_authenticated})
