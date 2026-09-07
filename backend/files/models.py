import os
from django.db import models
from django.conf import settings
from users.models import User

def user_file_path(instance, filename):
    # сохраняем файл в папке пользователя: media/user_<id>/<uuid>_<filename>
    ext = filename.split('.')[-1]
    new_filename = f"{instance.uuid}.{ext}" if '.' in filename else filename
    return f"user_{instance.owner.id}/{new_filename}"

class File(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    size = models.BigIntegerField()  # в байтах
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_download_at = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    file = models.FileField(upload_to=user_file_path)
    special_link = models.CharField(max_length=64, unique=True, blank=True)  # токен для внешнего доступа

    def save(self, *args, **kwargs):
        if not self.special_link:
            import uuid
            self.special_link = uuid.uuid4().hex[:16]  # генерируем короткий токен
        if not self.size:
            self.size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return self.original_name