
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
# Create your models here.

class Chat(models.Model):
    message = models.CharField(max_length=255)
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.author.username}: {self.message}"
    
class Group(models.Model):
    groupName = models.CharField(max_length=255)
    date_created = models.DateTimeField(default=timezone.now)
    members = models.ManyToManyField(
        User,
        related_name="chat_groups"  # Use a unique related_name
    )

    def __str__(self):
        return self.groupName


class Message(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="messages")  # Link to Group
    author = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User model
    content = models.TextField()  # Content of the message
    date_posted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.author.username}: {self.content[:20]}..."  # Preview of the message



# # Shell testing for the access and input of the group messages and Authors
# from chat.models import Group, Message
# from django.contrib.auth.models import User

# # Get some users
# user1 = User.objects.get(id=1)
# user2 = User.objects.get(id=2)

# # Create a group
# group = Group.objects.create(groupName="Chat Group 1")

# # Add users to the group
# group.members.add(user1, user2)

# # Add a message from Alice
# message1 = Message.objects.create(group=group, author=user1, content="Hello, everyone!")
# message2 = Message.objects.create(group=group, author=user2, content="Hi, Alice!")


# # Get all members of the group
# members = group.members.all()
# for member in members:
#     print(f"Member: {member.username}")

# # Get all messages in the group
# messages = group.messages.all()
# for message in messages:
#     print(f"{message.author.username} at {message.date_posted}: {message.content}")

# get all Groups of a Member
# user_groups = user1.chat_groups.all()
# for group in user_groups:
#     print(group.groupName)

