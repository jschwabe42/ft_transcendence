from django.urls import path
from . import views

urlpatterns = [
    path('', views.serve_image, name='serve_image'),
]
