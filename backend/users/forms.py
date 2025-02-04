from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


class UserRegisterForm(UserCreationForm):
	email = forms.EmailField()

	# make sure that the email is unique
	def clean(self):
		cleaned_data = super(UserRegisterForm, self).clean()
		email = cleaned_data.get('email')
		if User.objects.filter(email=email).exists():
			self.add_error('email', 'A user with that email already exists.')
		return cleaned_data

	class Meta:
		model = User
		fields = ['username', 'email', 'password1', 'password2']


class UserUpdateForm(forms.ModelForm):
	email = forms.EmailField()

	class Meta:
		model = User
		fields = ['username', 'email']


class ProfileUpdateForm(forms.ModelForm):
	class Meta:
		model = User
		fields = ['image']
