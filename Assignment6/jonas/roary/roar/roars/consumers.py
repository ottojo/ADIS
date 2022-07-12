import json

from asgiref.sync import async_to_sync

from channels.generic.websocket import WebsocketConsumer
from django.contrib.humanize.templatetags.humanize import naturaltime

from roars.models import Roar


class FirehoseConsumer(WebsocketConsumer):
    def connect(self):
        async_to_sync(self.channel_layer.group_add)("firehose", self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)("firehose", self.channel_name)

    def receive(self, text_data=None, bytes_data=None):
        # Do not accept roars via WS
        pass

    def roar(self, event):
        r = Roar.objects.filter(pk=event["roar_id"]).first()
        roar = {
            "author_name": str(r.author.username),
            "text": str(r.text),
            "likes": int(r.likes.count()),
            "time": str(naturaltime(r.timestamp)),
            "id": str(r.pk),
        }
        self.send(text_data=json.dumps(roar))
