from django.db import models

# Create your models here.



class ServerID(models.Model):
    id = models.BigIntegerField(blank=False, primary_key=True)
    num_connected = models.IntegerField(blank=False, default=0)
