from django.urls import path, include
from rest_framework.routers import DefaultRouter
from recordings.views import UserDetailsViewSet, RecordingViewSet, home  # Import the home view

router = DefaultRouter()
router.register(r'users', UserDetailsViewSet)
router.register(r'recordings', RecordingViewSet)

urlpatterns = [
    path('', home, name='home'),  # Add this line to handle the root URL
    path('api/', include(router.urls)),  # Keep the existing API routes
]
