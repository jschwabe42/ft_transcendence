from django.urls import path

from . import views

urlpatterns = [
    # ex: /polls/
    path("", views.index, name="index"),
    # the 'name' value as called by the {% url %} template tag
    path("<int:question_id>/", views.detail, name="detail"),
    # changing url of polls detail view to something else:
    # perhaps to something like polls/specifics/1/
    # instead of doing it in the template (or templates)
    # you would change it here: @note
    path("specifics/<int:question_id>/", views.detail, name="detail"),
    # ex: /polls/5/results
    path("<int:question_id>/results/", views.results, name="results"),
    # ex: /polls/5/results
    path("<int:question_id>/vote/", views.vote, name="vote"),
]