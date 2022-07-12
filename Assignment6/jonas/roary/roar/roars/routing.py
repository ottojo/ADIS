# chat/routing.py
from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path(r'api/ws/firehose/', consumers.FirehoseConsumer.as_asgi()),
]
