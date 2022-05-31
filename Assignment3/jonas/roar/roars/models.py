from django.contrib.auth.models import User
from django.db import models


class Roar(models.Model):
    author = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    text = models.CharField(max_length=128)
    timestamp = models.DateTimeField()
    likes = models.ManyToManyField(User, related_name="liked_by")

    def __str__(self):
        return f"{self.author}, {self.timestamp.isoformat()}: \"{self.text}\""
