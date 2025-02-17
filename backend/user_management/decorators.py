# users/decorators.py
from functools import wraps
from django.shortcuts import redirect
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.decorators import login_required
from django.urls import reverse

def hybrid_login_required(view_func):
	@wraps(view_func)
	def _wrapper(request, *args, **kwargs):
		# Always check JWT token first if it exists
		try:
			auth = JWTAuthentication()
			access_token = request.COOKIES.get('access_token')
			refresh_token = request.COOKIES.get('refresh_token')
			
			if access_token:
				validated_token = auth.get_validated_token(access_token)
				user = auth.get_user(validated_token)
				
				request.user = user
				return view_func(request, *args, **kwargs)
				
		except (InvalidToken, TokenError) as e:
			if refresh_token:
				try:
					# Use the refresh token to generate a new access token
					refresh = RefreshToken(refresh_token)
					new_access_token = str(refresh.access_token)
					
					response = view_func(request, *args, **kwargs)
					response.set_cookie('access_token', new_access_token, httponly=True, secure=True, samesite='Lax')
					return response
					
				except (InvalidToken, TokenError) as e:
					# Refresh token is also invalid or expired
					response = HttpResponseRedirect(reverse('login/'))
					response.delete_cookie('access_token')
					response.delete_cookie('refresh_token')
					return response
			else:
				response = HttpResponseRedirect(reverse('login/'))
				response.delete_cookie('access_token')
				response.delete_cookie('refresh_token')
				return response
				
		if request.user.is_authenticated:
			return view_func(request, *args, **kwargs)
			
		return redirect('login/')

	return login_required(_wrapper)