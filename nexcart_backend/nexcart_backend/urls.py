"""
URL configuration for nexcart_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from users.views_auth import CustomTokenObtainPairView

def api_root(request):
    """Simple API root view"""
    return JsonResponse({
        'message': 'NexCart Backend API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'auth': '/api/token/',
            'health': '/health/',
        }
    })

def health_check(request):
    """Health check endpoint"""
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return JsonResponse({
        'status': 'ok',
        'database': db_status,
        'debug': settings.DEBUG,
        'static_url': settings.STATIC_URL,
        'static_root': settings.STATIC_ROOT,
    })

urlpatterns = [
    path('', api_root, name='api_root'),  # Root URL
    path('health/', health_check, name='health_check'),  # Health check
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
