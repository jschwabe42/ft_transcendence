# users/decorators.py
from functools import wraps
from django.shortcuts import redirect, reverse
from django.contrib import messages
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.decorators import login_required

def hybrid_login_required(view_func):
	@wraps(view_func)
	def _wrapper(request, *args, **kwargs):
		# Always check JWT token first if it exists
		try:
			auth = JWTAuthentication()
			access_token = request.COOKIES.get('access_token')
			
			if access_token:
				# Validate the JWT token
				validated_token = auth.get_validated_token(access_token)
				user = auth.get_user(validated_token)
				
				# Attach the user to the request
				request.user = user
				return view_func(request, *args, **kwargs)
				
		except (InvalidToken, TokenError) as e:
			# Clear JWT cookies and redirect to login
			response = HttpResponseRedirect(reverse('login/'))
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
			
		if request.user.is_authenticated:
			return view_func(request, *args, **kwargs)
			
		return redirect('login/')

	return login_required(_wrapper)