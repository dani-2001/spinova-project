from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'dev-only-change-me'
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
]

ROOT_URLCONF = 'lsd_backend.urls'
WSGI_APPLICATION = 'lsd_backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# React dev server (Vite) origin
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']

# DRF defaults to SessionAuthentication, which reads request.session --
# that attribute only exists if django.contrib.sessions' SessionMiddleware
# is installed, which it isn't here (no real auth built yet -- see README).
# Without this, every API call raises AttributeError -> 500. Explicitly
# disable auth/permission checks until a real auth endpoint exists.
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    # See api/exceptions.py — turns unhandled 500s into JSON with the real
    # error instead of an HTML page the frontend can't parse.
    'EXCEPTION_HANDLER': 'api.exceptions.api_exception_handler',
}

# So tracebacks land somewhere visible even if the terminal running
# runserver gets scrolled past — logged at ERROR with full traceback via
# logger.exception() in api/exceptions.py.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'   # uploaded studies + generated XAI overlays land here

STATIC_URL = '/static/'

# Path to the artifacts exported from the training notebook (Phase 11H/11I):
# student_model.onnx + model_config.json. Point this at wherever you copy
# those two files on this machine.
MODEL_DIR = BASE_DIR / 'ml_artifacts'
