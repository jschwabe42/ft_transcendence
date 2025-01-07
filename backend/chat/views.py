# chat/views.py
import logging
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Group
from .forms import ChatForm
from django.http import HttpResponse

@login_required
def show_all_chats(request):
    user = request.user

    if request.method == "POST":
        chat_name = request.POST.get('chat_name', '').strip()
        if chat_name:
            group = Group.objects.create(groupName=chat_name)
            group.members.add(user)
            return redirect('chat')
        else:
            logging.error("No Chat name")
    chat_rooms = user.chat_groups.all().order_by('date_created')
    return render(request, 'chat/allChats.html', {'rooms':chat_rooms})

@login_required
def room_detail(request, room_id):
    user = request.user
    group = Group.objects.get(id=room_id)
    messages = group.messages.all().order_by('date_posted')
    members = group.members.all()

    # checks if the user is in the Group he trys to access
    is_in_group = False
    for member in members:
        if member == user:
            is_in_group = True
    if is_in_group == False:
        return redirect('chat')

    # print(test.group.groupName)
    return render(request, 'chat/ChatRoom.html',
                   {'messages': messages, 'group': group, 'room_id': room_id , 'members': members})
