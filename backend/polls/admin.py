from django.contrib import admin

# Register your models here.

from .models import Choice, Question

class ChoiceInline(admin.TabularInline):
    model = Choice
    # number of extra slots for related model
    extra = 3

# create model admin class, then pass it as second arg to register
# any time we want to customize admin options for a model
class QuestionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {"fields": ["question_text"]}),
        ("Date information", {"fields": ["pub_date"], "classes": ["collapse"]}),
    ]# question text now appears above pub date
    inlines = [ChoiceInline]

admin.site.register(Question, QuestionAdmin)