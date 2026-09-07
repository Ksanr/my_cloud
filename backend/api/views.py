import logging
import os
from django.http import FileResponse, Http404
from django.utils import timezone
from rest_framework import viewsets, generics, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from users.models import User
from files.models import File
from .serializers import UserSerializer, UserCreateSerializer, FileSerializer
from .permissions import IsAdminOrReadOnly, IsOwnerOrAdmin

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
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

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            # администратор может просматривать файлы любого пользователя
            target_user_id = self.request.query_params.get('user_id')
            if target_user_id:
                return File.objects.filter(owner_id=target_user_id)
            return File.objects.all()
        return File.objects.filter(owner=user)

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        comment = self.request.data.get('comment', '')
        if not file_obj:
            raise serializers.ValidationError("Файл не передан")
        serializer.save(owner=self.request.user, size=file_obj.size, comment=comment)
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
        file = self.get_object()
        file.last_download_at = timezone.now()
        file.save()
        response = FileResponse(file.file, as_attachment=True, filename=file.original_name)
        logger.info(f"File {file.original_name} downloaded by {request.user.username}")
        return response

    @action(detail=False, methods=['get'], url_path='shared/(?P<token>[a-f0-9]+)')
    def shared_download(self, request, token):
        # специальная ссылка для внешних пользователей
        try:
            file = File.objects.get(special_link=token)
        except File.DoesNotExist:
            raise Http404("Файл не найден")
        file.last_download_at = timezone.now()
        file.save()
        response = FileResponse(file.file, as_attachment=True, filename=file.original_name)
        return response

    @action(detail=True, methods=['get'])
    def special_link(self, request, pk=None):
        file = self.get_object()
        return Response({"special_link": file.special_link})