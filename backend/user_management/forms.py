from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


class UserRegisterForm(UserCreationForm):
	email = forms.EmailField()

	def clean(self):
		cleaned_data = super(UserRegisterForm, self).clean()
		email = cleaned_data.get('email')
		new_username = cleaned_data.get('username')
		if User.objects.filter(email=email).exists():
			self.add_error('email', 'A user with that email already exists.')
		elif (
			User.objects.filter(username=new_username).exists()
			| User.objects.filter(display_name=new_username).exists()
			# @follow-up remote auth reserves for oauth_id
			# | User.objects.filter(oauth_id=new_username).exists()
		):
			self.add_error('username', 'A user with that username already exists.')
		return cleaned_data

	class Meta:
		model = User
		fields = ['username', 'email', 'password1', 'password2']


class UserUpdateForm(forms.ModelForm):
	email = forms.EmailField()

	class Meta:
		model = User
		fields = ['username', 'display_name', 'email']


class ProfileUpdateForm(forms.ModelForm):
	class Meta:
		model = User
		fields = ['image']
