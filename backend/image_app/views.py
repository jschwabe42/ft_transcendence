from django.http import HttpResponse
from django.shortcuts import render
import os
from django.conf import settings

def serve_image(request):
	return render(request, 'image_app/image.html')
