# Generated by Django 5.1.2 on 2024-11-12 20:27

from django.db import migrations, models


class Migration(migrations.Migration):

    replaces = [('pong', '0001_initial'), ('pong', '0002_rename_pub_date_game_played_at')]

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player1', models.CharField(max_length=200)),
                ('player2', models.CharField(max_length=200)),
                ('score1', models.IntegerField(default=0)),
                ('score2', models.IntegerField(default=0)),
                ('played_at', models.DateTimeField(verbose_name='date finished')),
            ],
        ),
    ]
