from django.shortcuts import render
from rest_framework import viewsets
from .models import UserDetails, Recording
from .serializers import UserDetailsSerializer, RecordingSerializer

# API ViewSets
class UserDetailsViewSet(viewsets.ModelViewSet):
    queryset = UserDetails.objects.all()
    serializer_class = UserDetailsSerializer

class RecordingViewSet(viewsets.ModelViewSet):
    queryset = Recording.objects.all()
    serializer_class = RecordingSerializer

def home(request):
    return render(request, 'recordings/home.html')  # Specify the correct path

