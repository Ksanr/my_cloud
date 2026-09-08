import logging
import os
from django.http import FileResponse, Http404
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from rest_framework import viewsets, generics, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from users.models import User
from files.models import File
from .serializers import UserSerializer, UserCreateSerializer, FileSerializer
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdmin
from .utils import CsrfExemptMixin

logger = logging.getLogger(__name__)

class UserViewSet(CsrfExemptMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # удаляем файлы пользователя
        for file in user.files.all():
            file.file.delete(save=False)
        user.delete()
        logger.info(f"User {user.username} deleted by admin {request.user.username}")
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

class FileViewSet(CsrfExemptMixin, viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        print("Query params:", self.request.query_params)
        user = self.request.user
        if user.is_admin:
            target_user_id = self.request.query_params.get('user_id')
            if target_user_id:
                return File.objects.filter(owner_id=target_user_id)
            # По умолчанию – свои файлы
            return File.objects.filter(owner=user)
        return File.objects.filter(owner=user)

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        comment = self.request.data.get('comment', '')
        if not file_obj:
            raise serializers.ValidationError("Файл не передан")
        serializer.save(
            owner=self.request.user,
            size=file_obj.size,
            comment=comment,
            original_name=file_obj.name
        )
        logger.info(f"File {file_obj.name} uploaded by {self.request.user.username}")

    @action(detail=True, methods=['post'])
    def rename(self, request, pk=None):
        file = self.get_object()
        new_name = request.data.get('new_name')
        if not new_name:
            return Response({"error": "Не указано новое имя"}, status=status.HTTP_400_BAD_REQUEST)
        file.original_name = new_name
        file.save()
        logger.info(f"File {file.id} renamed to {new_name} by {request.user.username}")
        return Response(FileSerializer(file).data)

    @action(detail=True, methods=['post'])
    def set_comment(self, request, pk=None):
        file = self.get_object()
        comment = request.data.get('comment', '')
        file.comment = comment
        file.save()
        return Response(FileSerializer(file).data)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        file_obj = self.get_object()
        # Обновляем дату последнего скачивания
        file_obj.last_download_at = timezone.now()
        file_obj.save()

        # Открываем файл для чтения
        file_path = file_obj.file.path
        response = FileResponse(open(file_path, 'rb'), as_attachment=True)

        # Устанавливаем заголовок с оригинальным именем, поддерживая русские символы
        filename = file_obj.original_name
        response['Content-Disposition'] = f'attachment; filename="{filename}"; filename*=UTF-8\'\'{filename}'

        logger.info(f"File {filename} downloaded by {request.user.username}")
        return response

    @action(detail=False, methods=['get'], url_path='shared/(?P<token>[a-f0-9]+)', permission_classes=[AllowAny])
    def shared_download(self, request, token):
        # специальная ссылка для внешних пользователей
        try:
            file = File.objects.get(special_link=token)
        except File.DoesNotExist:
            raise Http404("Файл не найден")
        file.last_download_at = timezone.now()
        file.save()
        response = FileResponse(file.file, as_attachment=True)
        filename = file.original_name
        response['Content-Disposition'] = f'attachment; filename="{filename}"; filename*=UTF-8\'\'{filename}'
        return response

    @action(detail=True, methods=['get'])
    def special_link(self, request, pk=None):
        file = self.get_object()
        return Response({"special_link": file.special_link})


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        logger.info("LoginView called with data: %s", request.data)
        print("LoginView CALLED")
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'email': user.email,
                'is_admin': user.is_admin,
            })
        return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'email': user.email,
                'is_admin': user.is_admin,
            })
        return JsonResponse({'error': 'Неверные учетные данные'}, status=401)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"detail": "Successfully logged out."})
    return JsonResponse({"error": "Method not allowed"}, status=405)