import datetime

from asgiref.sync import async_to_sync
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, HttpResponseNotFound, HttpResponseForbidden, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.urls import reverse
from channels.layers import get_channel_layer

from .models import Roar


def index(request):
    params = {'latest_roars_list': Roar.objects.order_by('-timestamp')[:5]}
    if "error_message" in request.GET:
        params["error_message"] = request.GET["error_message"]
    return render(request, 'roars/index.html', params)


@login_required
def post(request):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden("Not authenticated")
    roar_text = request.body.decode('utf-8')
    if len(roar_text) > 128:
        return HttpResponseBadRequest("Roar is too long! 128 characters max.")

    r = Roar(author=user, text=roar_text, timestamp=datetime.datetime.now())
    r.save()

    # Forward roar to all active sessions via channel
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)("firehose", {"type": "roar", "roar_id": r.pk})

    return HttpResponse('')


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
