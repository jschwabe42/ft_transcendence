from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import CustomUser


@receiver(post_save, sender=CustomUser)
def initialize(sender, instance, created, **kwargs):
	"""initialize the display_name"""
	if created and not instance.display_name:
		CustomUser.objects.filter(id=instance.id).update(display_name=instance.username)
