from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import permissions

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
	def validate(self, attrs):
		data = super().validate(attrs)
		data.update({'username': self.user.username})
		return data

class CustomTokenObtainPairView(TokenObtainPairView):
	serializer_class = CustomTokenObtainPairSerializer
	permission_classes = [permissions.AllowAny]

class CustomTokenRefreshView(TokenRefreshView):
	permission_classes = [permissions.AllowAny]
