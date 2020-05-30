from django.shortcuts import render
from django.http import HttpResponse
from random import randint
from . import models
# Create your views here.

def index(request):
    return render(request, 'chat/index.html')

def rand(request):
    newID = randint(0, 2**63-2)
    while True:
        if models.ServerID.objects.filter(id=newID).exists():
            newID = randint(0, 2**63-2)
        else: 
            break
    temp = models.ServerID(id = newID)
    temp.save()
    return HttpResponse(temp.id)