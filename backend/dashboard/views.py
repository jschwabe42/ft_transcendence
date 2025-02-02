from django.shortcuts import render
from users.models import Profile
import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

def profile_list(request):
	"""
	Api call that returns all profiles.
	dashboard/api/profile_list is API endpoint.
	"""
	profiles = Profile.objects.all()
	profile_data = [
		{
			'username': profile.user.username,
			'image_url': profile.image.url,
		}
		for profile in profiles
	]
	return JsonResponse({
		'success': True,
		'profiles': profile_data,
	})
