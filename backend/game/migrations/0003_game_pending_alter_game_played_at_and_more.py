# Generated by Django 5.1.3 on 2024-11-26 23:39

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_alter_game_player1_alter_game_player2_delete_player'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='pending',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='game',
            name='played_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='game',
            name='started_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
