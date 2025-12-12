# backend/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps required for psycopg2, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl gcc && \
    rm -rf /var/lib/apt/lists/*

# copy requirements then install to leverage docker cache
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# copy project
COPY backend/ /app/

# create directory for static files
RUN mkdir -p /vol/static /vol/media

# collectstatic will be run at container start (see docker-compose command)
ENV DJANGO_SETTINGS_MODULE=backend.settings

# Expose port for app
EXPOSE 8000

# default command - run migrations then start gunicorn
CMD ["sh", "-c", "python manage.py migrate --no-input && python manage.py collectstatic --no-input && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3"]
