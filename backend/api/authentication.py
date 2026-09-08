from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Класс сессионной аутентификации, который отключает проверку CSRF.
    """
    def enforce_csrf(self, request):
        # Ничего не делаем – отключаем CSRF-проверку
        return