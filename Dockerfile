FROM python:3.11.6-alpine3.18

WORKDIR /usr/src/api

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SECRET_KEY=django-insecure-change-me-in-production
ENV DJANGO_SETTINGS_MODULE=core.settings.prod

COPY api/requirements.txt /usr/src/api/requirements.txt

# dependências do postres
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev netcat-openbsd

RUN pip install --upgrade pip
RUN pip install -r /usr/src/api/requirements.txt

COPY api /usr/src/api/

# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
# código para rodar o entrypoint
ENTRYPOINT [ "/usr/src/api/config/entrypoint.sh" ]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
