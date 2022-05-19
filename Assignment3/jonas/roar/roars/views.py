from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404, render

from .models import Roar


def index(request):
    latest_roars_list = Roar.objects.order_by('-timestamp')[:10]
    context = {
        'latest_roars_list': latest_roars_list,
    }
    return render(request, 'roars/index.html', context)


def detail(request, roar_id):
    roar = get_object_or_404(Roar, pk=roar_id)
    return render(request, 'roars/detail.html', {'roar': roar})
