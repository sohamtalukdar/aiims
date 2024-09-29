from django.db import models

# Create your models here.
from django.db import models

class UserDetails(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    phone = models.CharField(max_length=15)

class Recording(models.Model):
    user = models.ForeignKey(UserDetails, on_delete=models.CASCADE)
    audio_file = models.FileField(upload_to='audio/')
    video_file = models.FileField(upload_to='video/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
