from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from functools import wraps

def login_required_redirect(view_func):
	@wraps(view_func)
	def _wrapped_view(request, *args, **kwargs):
		if not request.user.is_authenticated:
			return redirect('/login/')
		return view_func(request, *args, **kwargs)
	return _wrapped_view