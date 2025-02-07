from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from user_management.models import CustomUser


def profile_list(request):
	"""
	Api call that returns all profiles.
	dashboard/api/profile_list is API endpoint.
	"""
	users = CustomUser.objects.all()
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

def get_profile(request, username):
	"""
	Api call that returns a specific profile.
	dashboard/api/get_profile/profilename is API endpoint.
	"""
	print(f"Username: {username}", flush=True)
	user = get_object_or_404(CustomUser, username=username)
	print(f"User: {user}", flush=True)
	profile_data = {
		'username': user.username,
		'image_url': user.image.url,
		'quiz_games_played': user.quiz_games_played,
		'quiz_games_won': user.quiz_games_won,
		'quiz_total_score': user.quiz_total_score,
		'quiz_high_score': user.quiz_high_score,
		'quiz_questions_asked': user.quiz_questions_asked,
		'quiz_correct_answers': user.quiz_correct_answers,
	}
	return JsonResponse({
		'success': True,
		'profile': profile_data,
	})
