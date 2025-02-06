# users/middleware.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip if already authenticated via session
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            try:
                auth = JWTAuthentication()
                access_token = request.COOKIES.get('access_token')
                
                if access_token:
                    validated_token = auth.get_validated_token(access_token)
                    request.user = auth.get_user(validated_token)
            except (InvalidToken, KeyError):
                pass  # Stay as anonymous user
        
        return self.get_response(request)