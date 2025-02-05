from custom_user.models import Player
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

User = get_user_model()
def profile_list(request):
	"""
	Api call that returns all profiles.
	dashboard/api/profile_list is API endpoint.
	"""
	users = User.objects.all()
	profile_data = [
		{
			'username': user.username,
			'image_url': user.image.url,
		}
		for user in users
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
	user = get_object_or_404(User, username=username)
	player = get_object_or_404(Player, user=user)

	profile_data = {
		'username': user.username,
		'image_url': user.image.url,
		'quiz_games_played': player.quiz_games_played,
		'quiz_games_won': player.quiz_games_won,
		'quiz_total_score': player.quiz_total_score,
		'quiz_high_score': player.quiz_high_score,
		'quiz_questions_asked': player.quiz_questions_asked,
		'quiz_correct_answers': player.quiz_correct_answers,
	}
	return JsonResponse({
		'success': True,
		'profile': profile_data,
	})
