from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()

class UserUpdateForm(forms.ModelForm):
	email = forms.EmailField()

	class Meta:
		model = User
		fields = ['username', 'display_name', 'email']


class ProfileUpdateForm(forms.ModelForm):
	class Meta:
		model = User
		fields = ['image']
