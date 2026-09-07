from rest_framework import serializers
from users.models import User
from files.models import File

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'is_admin', 'storage_path']
        read_only_fields = ['id', 'storage_path']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'password']

    def validate_username(self, value):
        if not value[0].isalpha() or not value.isalnum():
            raise serializers.ValidationError("Логин должен начинаться с буквы и содержать только латинские буквы и цифры.")
        if len(value) < 4 or len(value) > 20:
            raise serializers.ValidationError("Логин должен быть от 4 до 20 символов.")
        return value

    def validate_email(self, value):
        import re
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Неверный формат email.")
        return value

    def validate_password(self, value):
        import re
        if (len(value) < 6 or
            not re.search(r'[A-Z]', value) or
            not re.search(r'\d', value) or
            not re.search(r'[!@#$%^&*(),.?":{}|<>]', value)):
            raise serializers.ValidationError(
                "Пароль должен содержать минимум 6 символов, одну заглавную букву, одну цифру и один спецсимвол."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.storage_path = f"user_{user.username}"  # можно задать позже
        user.save()
        return user

class FileSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    size_human = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'original_name', 'size', 'size_human', 'uploaded_at', 'last_download_at',
                  'comment', 'file', 'special_link']
        read_only_fields = ['id', 'size', 'uploaded_at', 'last_download_at', 'special_link']

    def get_size_human(self, obj):
        if obj.size < 1024:
            return f"{obj.size} B"
        elif obj.size < 1048576:
            return f"{obj.size//1024} KB"
        else:
            return f"{obj.size//1048576} MB"