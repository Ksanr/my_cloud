from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import UserViewSet, FileViewSet, login_view, logout_view
from django.http import HttpResponse

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'files', FileViewSet, basename='file')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('api/', include(router.urls)),
    path('test/', lambda request: HttpResponse("OK")),
    # path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),
]