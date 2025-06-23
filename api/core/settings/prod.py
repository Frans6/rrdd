from .base import *

import dj_database_url
from decouple import config


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    ".run.app",
    "rrdd-519104831129.us-central1.run.app",
]


# django-cors-headers
# https://github.com/adamchainz/django-cors-headers

CORS_ALLOWED_ORIGINS = [
    "https://rrdd-front-519104831129.us-central1.run.app",
]

CORS_ALLOW_ALL_ORIGINS = True  # Temporariamente para debug
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


# SSL Redirect

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True


# Application definition

INSTALLED_APPS.insert(0, "whitenoise.runserver_nostatic")

# Inserir WhiteNoise depois do CORS middleware
MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# Configuração de banco de dados para produção
DATABASE_URL = config("DATABASE_URL", default=None)

if DATABASE_URL and '/cloudsql/' in DATABASE_URL:
    print("🔗 Configurando Cloud SQL Proxy")
    # Configuração manual para Cloud SQL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'postgres',
            'USER': 'derivada',
            'PASSWORD': 'derivada',
            'HOST': '/cloudsql/bold-artifact-463813-e9:us-central1:admin',
            'PORT': '',
            'OPTIONS': {
                'sslmode': 'disable',  # SSL não é necessário com Cloud SQL Proxy
            },
            'CONN_MAX_AGE': 600,
            'CONN_HEALTH_CHECKS': True,
        }
    }
elif DATABASE_URL:
    print("🌐 Usando DATABASE_URL padrão")
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        ),
    }
else:
    # Fallback para SQLite se DATABASE_URL não estiver configurada
    print("⚠️ WARNING: DATABASE_URL não configurada, usando SQLite como fallback")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
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

# Logging para debug de CORS
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
