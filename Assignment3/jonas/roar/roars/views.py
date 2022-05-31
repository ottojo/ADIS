import datetime

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, HttpResponseNotFound, HttpResponseForbidden
from django.shortcuts import render
from django.urls import reverse
from django.utils.http import urlencode
from django.views import generic

from .models import Roar


def index(request):
    params = {}
    if "error_message" in request.GET:
        params["error_message"] = request.GET["error_message"]
    return render(request, 'roars/index.html', params)


@login_required
def post(request):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden("Not authenticated")

    if len(request.POST["text"]) > 128:
        return HttpResponseRedirect(reverse('roars:index') + '?' + urlencode({
            "error_message": "Roar is too long! 128 characters max."
        }))

    r = Roar(author=user, text=request.POST["text"], timestamp=datetime.datetime.now())
    r.save()

    return HttpResponseRedirect(reverse('roars:index'))


@login_required
def like(request, roar_id):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden("Not authenticated")

    try:
        roar = Roar.objects.get(pk=roar_id)
    except Roar.DoesNotExist:
        return HttpResponseNotFound("Roar not found")

    roar.likes.add(user)

    return HttpResponseRedirect(reverse('roars:index'))


@login_required
def unlike(request, roar_id):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden("Not authenticated")

    try:
        roar = Roar.objects.get(pk=roar_id)
    except Roar.DoesNotExist:
        return HttpResponseNotFound("Roar not found")

    roar.likes.remove(user)
    return HttpResponseRedirect(reverse('roars:index'))


def user_likes_view(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound("User not found")
    roars = user.liked_by.order_by('-timestamp')
    return render(request, 'roars/user_likes.html', {
        'liked_roars_list': roars,
        'user': user,
    })


class RoarsHtml(generic.ListView):
    template_name = 'roars/roarlist.html'
    context_object_name = 'latest_roars_list'

    def get_queryset(self):
        return Roar.objects.order_by('-timestamp')
