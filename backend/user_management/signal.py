from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CustomUser, Player


@receiver(post_save, sender=CustomUser)
def initialize(sender, instance, created, **kwargs):
	"""initialize the player object and display_name"""
	if created and not instance.display_name:
		CustomUser.objects.filter(id=instance.id).update(display_name=instance.username)
		player = Player.objects.create(user=CustomUser.objects.filter(id=instance.id).first())
		player.save()
		# make sure that initializations are correct
		user_instance = CustomUser.objects.filter(id=instance.id).first()
		assert user_instance is not None
		assert player.user is not None
		assert player.user == user_instance
		assert player.user.username == user_instance.display_name
