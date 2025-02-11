# users/auth_helpers.py
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login as django_login

def jwt_login(request, user):
    """Login with JWT tokens + maintain session compatibility"""
    # 1. Create JWT tokens
    from django.core.cache import cache
    cache_key = f'jwt_refresh_token_{user.id}'
    refresh = cache.get(cache_key)
    if not refresh:
        refresh = RefreshToken.for_user(user)
        cache.set(cache_key, refresh, timeout=3600)  # Cache for 1 hour
    
    # 2. Perform Django session login
    django_login(request, user)
    
    # 3. Return tokens (to be set in cookies by the view)
    return {
        'refresh_token': str(refresh),
        'access_token': str(refresh.access_token),
    }