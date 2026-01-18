// Copy to: backend/migrations/init_db.py

export const MIGRATION_SCRIPT = `
"""
Database migration script for TradeSense AI
Run: python migrations/init_db.py
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def run_migration():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Read and execute schema
    with open('schema.sql', 'r') as f:
        schema = f.read()
        cur.execute(schema)
    
    # Read and execute seed data
    with open('seed.sql', 'r') as f:
        seed = f.read()
        cur.execute(seed)
    
    conn.commit()
    cur.close()
    conn.close()
    
    print("✅ Database migration completed!")

if __name__ == '__main__':
    run_migration()
`;

export const ALEMBIC_CONFIG = \`
# Copy to: backend/alembic.ini

[alembic]
script_location = alembic
sqlalchemy.url = postgresql://localhost/tradesense

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
\`;

export const DOCKER_COMPOSE = \`
# Copy to: docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: tradesense
      POSTGRES_PASSWORD: password
      POSTGRES_DB: tradesense
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://tradesense:password@postgres:5432/tradesense
      JWT_SECRET_KEY: your-secret-key-here
      FLASK_ENV: development
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
\`;

export const BACKEND_DOCKERFILE = \`
# Copy to: backend/Dockerfile

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]
\`;

export const FRONTEND_DOCKERFILE = \`
# Copy to: frontend/Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
\`;
`;