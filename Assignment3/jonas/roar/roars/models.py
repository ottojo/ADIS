from django.db import models


# Create your models here.

class User(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Roar(models.Model):
    author = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    text = models.CharField(max_length=128)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.author}, {self.timestamp.isoformat()}: \"{self.text}\""
