# Configuração do Gunicorn para Azure App Service
import os

# Bind
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Workers
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"

# Timeout
timeout = 120
keepalive = 2

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Performance
preload_app = True
max_requests = 1000
max_requests_jitter = 100
