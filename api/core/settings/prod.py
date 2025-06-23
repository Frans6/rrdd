from .base import *

import dj_database_url


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    ".run.app",
    "rrdd-519104831129.us-central1.run.app",
]


# django-cors-headers
# https://github.com/adamchainz/django-cors-headers

CORS_ALLOWED_ORIGINS = [
    "https://rrdd-front-519104831129.us-central1.run.app",
]
# CORS_ALLOW_ALL_ORIGINS = True  # Desabilitado - usando lista específica
CORS_ALLOW_CREDENTIALS = True

# Configurações CORS adicionais para resolver problemas de preflight
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Configurações para preflight requests
CORS_PREFLIGHT_MAX_AGE = 86400

# Configurações adicionais para resolver problemas de CORS
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://rrdd-front-.*\.run\.app$",
]

# Permitir cookies em requisições cross-origin
CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']


# SSL Redirect
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True


# Application definition

INSTALLED_APPS.insert(0, "whitenoise.runserver_nostatic")

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True,
    ),
}

STORAGES = {
    # Enable WhiteNoise's GZip and Brotli compression of static assets:
    # https://whitenoise.readthedocs.io/en/latest/django.html#add-compression-and-caching-support
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Don't store the original (un-hashed filename) version of static files, to reduce slug size:
# https://whitenoise.readthedocs.io/en/latest/django.html#WHITENOISE_KEEP_ONLY_HASHED_FILES
WHITENOISE_KEEP_ONLY_HASHED_FILES = True

# Configurações de logging para debug
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'corsheaders': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'users': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
