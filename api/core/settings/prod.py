from .base import *

import dj_database_url


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    ".herokuapp.com",
    ".run.app",
    "rrdd-519104831129.us-central1.run.app",
]


# django-cors-headers
# https://github.com/adamchainz/django-cors-headers

CORS_ALLOWED_ORIGINS = [
    "https://rei-da-derivada.vercel.app",
    "https://rrdd-front-519104831129.us-central1.run.app",  # Adicionar esta linha
]

# Adicionar CSRF_TRUSTED_ORIGINS para permitir requisições POST
CSRF_TRUSTED_ORIGINS = [
    "https://rei-da-derivada.vercel.app",
    "https://rrdd-front-519104831129.us-central1.run.app",
]

# Adicionar também estas configurações CORS:
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_HEADERS = [
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
# CORS_ALLOW_ALL_ORIGINS = True


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
