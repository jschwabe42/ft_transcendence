from django.shortcuts import render
from users.models import Profile, Friends_Manager
import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from game.models import Game
from django.db.models import F

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

@login_required
def get_profile(request, username):
	"""
	Api call that returns a specific profile.
	dashboard/api/get_profile/profilename is API endpoint.
	"""
	profile = get_object_or_404(Profile, user__username=username)


	profile_data = {
		'username': profile.user.username,
		'image_url': profile.image.url,
		'quiz_games_played': profile.quiz_games_played,
		'quiz_games_won': profile.quiz_games_won,
		'quiz_total_score': profile.quiz_total_score,
		'quiz_high_score': profile.quiz_high_score,
		'quiz_questions_asked': profile.quiz_questions_asked,
		'quiz_correct_answers': profile.quiz_correct_answers,
	}
	return JsonResponse({
		'success': True,
		'profile': profile_data,
	})
