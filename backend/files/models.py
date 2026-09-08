import os
import uuid
from django.db import models
from django.conf import settings
from users.models import User

def user_file_path(instance, filename):
    # Генерируем уникальное имя файла с помощью UUID
    ext = filename.split('.')[-1] if '.' in filename else ''
    unique_name = uuid.uuid4().hex
    new_filename = f"{unique_name}.{ext}" if ext else unique_name
    return f"user_{instance.owner.id}/{new_filename}"

class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    size = models.BigIntegerField()  # в байтах
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_download_at = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    file = models.FileField(upload_to=user_file_path)
    special_link = models.CharField(max_length=64, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.special_link:
            self.special_link = uuid.uuid4().hex[:16]  # генерируем токен
        if not self.size:
            self.size = self.file.size
        super().save(*args, **kwargs)