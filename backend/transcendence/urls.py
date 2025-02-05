"""
URL configuration for transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
	https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
	1. Add an import:  from my_app import views
	2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
	1. Add an import:  from other_app.views import Home
	2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
	1. Import the include() function: from django.urls import include, path
	2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from debug_toolbar.toolbar import debug_toolbar_urls
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('quiz/', views.index, name='quiz'),
	path('users/', include('user_management.urls')),
	path('game/', include('pong_game.urls')),
	path('admin/', admin.site.urls),
	path('blog/', include('blog.urls')),
	path('chat/', include('chat.urls')),
	path('quiz/', include('quiz.urls')),
	path('dashboard/', include('dashboard.urls')),
]


if not settings.TESTING:
	urlpatterns = [
		*urlpatterns,
	] + debug_toolbar_urls()


# we do not know how this has to be implemented for release
if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
	re_path(r'^.*$', views.index, name='index'),
]
