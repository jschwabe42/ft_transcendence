# users/decorators.py
from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

def hybrid_login_required(view_func):
    @wraps(view_func)
    def _wrapper(request, *args, **kwargs):
        # Check session auth first
        if request.user.is_authenticated:
            return view_func(request, *args, **kwargs)
            
        # Fallback to JWT check
        try:
            auth = JWTAuthentication()
            access_token = request.COOKIES.get('access_token')
            
            if access_token:
                validated_token = auth.get_validated_token(access_token)
                request.user = auth.get_user(validated_token)
                return view_func(request, *args, **kwargs)
                
        except (InvalidToken, KeyError):
            pass
            
        return redirect('login')  # Or return JSON error for APIs

    return login_required(_wrapper)  # Preserve @login_required behavior