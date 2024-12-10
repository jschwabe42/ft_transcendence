# Generated by Django 5.1.2 on 2024-12-10 23:04

from django.db import migrations

def update_foreign_keys(apps, schema_editor):
    Profile = apps.get_model('users', 'Profile')
    CustomUser = apps.get_model('users', 'CustomUser')
    User = apps.get_model('auth', 'User')

    for profile in Profile.objects.all():
        try:
            user = User.objects.get(id=profile.user_id)
            custom_user = CustomUser.objects.create(
                id=user.id,
                username=user.username,
                email=user.email,
                password=user.password,
                first_name=user.first_name,
                last_name=user.last_name,
                is_staff=user.is_staff,
                is_active=user.is_active,
                date_joined=user.date_joined,
            )
            profile.user = custom_user
            profile.save()
        except User.DoesNotExist:
            profile.delete()

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_customuser_alter_profile_user'),
    ]

    operations = [
        migrations.RunPython(update_foreign_keys)
    ]
