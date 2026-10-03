from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.views import CsrfView, FileViewSet, LoginView, LogoutView, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"files", FileViewSet, basename="file")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("api/", include(router.urls)),
    path("test/", lambda request: HttpResponse("OK")),
    path("api/csrf/", CsrfView.as_view(), name="csrf"),
    # path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),
]
