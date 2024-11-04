from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views import generic

from .models import Choice, Question


class IndexView(generic.ListView):
    template_name = "polls/index.html"
    # provide the name we want to use instead of default "question_list"
    context_object_name = "latest_question_list"

    def get_queryset(self):
        """Return the last five published questions."""
        return Question.objects.order_by("-pub_date")[:5]


class DetailView(generic.DetailView):
    model = Question
    template_name = "polls/detail.html"


class ResultsView(generic.DetailView):
    model = Question
    template_name = "polls/results.html"

from django.db.models import F


def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    try:
        # request.POST is a dictionary-like object that lets you access submitted data by key name. -> access id (GET would be request.GET)
        selected_choice = question.choice_set.get(pk=request.POST["choice"])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the question voting form.
        return render(
            request,
            "polls/detail.html",
            {
                "question": question,
                "error_message": "You didn't select a choice.",
            },
        )
    else:
        # tell db to increment vote count
        selected_choice.votes = F("votes") + 1
        selected_choice.save()
        # Always return an HttpResponsRedirect (instead of HttpResponse) after successfully dealing
        # with POST data. This prevents data from being posted twice
        # if a user hits the Back button.
        
    return HttpResponseRedirect(reverse("polls:results", args=(question.id,)))