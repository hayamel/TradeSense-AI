// GitHub Upload & Deployment Instructions

export const COMPLETE_GUIDE = `
# 📦 TradeSense AI - Complete GitHub Upload Guide

## 📁 Final Folder Structure

\`\`\`
tradesense-ai/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   ├── schema.sql
│   ├── seed.sql
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/         (copy from Base44)
│   │   ├── components/    (copy from Base44)
│   │   ├── api/
│   │   │   └── apiClient.js
│   │   ├── Layout.js      (copy from Base44)
│   │   └── globals.css    (copy from Base44)
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml
├── .gitignore
└── README.md
\`\`\`

## 🚀 Step-by-Step Setup

### 1️⃣ Create GitHub Repository

\`\`\`bash
# On GitHub.com
# Click "New Repository"
# Name: tradesense-ai
# Make it public or private
# DO NOT initialize with README
\`\`\`

### 2️⃣ Create Local Project

\`\`\`bash
mkdir tradesense-ai
cd tradesense-ai
git init
\`\`\`

### 3️⃣ Setup Backend

\`\`\`bash
mkdir backend
cd backend

# Create all backend files (copy from the code I provided):
# - app.py
# - models.py
# - requirements.txt
# - schema.sql (from DATABASE_SCHEMA.js)
# - seed.sql (from DATABASE_SCHEMA.js)
# - .env.example
# - Dockerfile
# - README.md

cd ..
\`\`\`

### 4️⃣ Setup Frontend

\`\`\`bash
mkdir -p frontend/src/api
cd frontend

# Copy from Base44:
# - All pages/ folder → src/pages/
# - All components/ folder → src/components/
# - Layout.js → src/Layout.js
# - globals.css → src/globals.css

# Create package.json
cat > package.json << 'EOF'
{
  "name": "tradesense-frontend",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.84.1",
    "lucide-react": "^0.475.0",
    "framer-motion": "^11.16.4",
    "recharts": "^2.15.4",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "class-variance-authority": "^0.7.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
EOF

# Create API client
cat > src/api/apiClient.js << 'EOF'
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default apiClient;
EOF

cd ..
\`\`\`

### 5️⃣ Create Root Files

\`\`\`bash
# .gitignore
cat > .gitignore << 'EOF'
# Backend
backend/venv/
backend/.env
backend/__pycache__/
backend/*.pyc

# Frontend
frontend/node_modules/
frontend/build/
frontend/.env

# OS
.DS_Store
*.log
EOF

# docker-compose.yml (copy from MIGRATION_GUIDE.js)

# README.md
cat > README.md << 'EOF'
# TradeSense AI

Trading challenge platform with AI-powered signals and community features.

## Quick Start with Docker

\\\`\\\`\\\`bash
docker-compose up
\\\`\\\`\\\`

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432

## Manual Setup

### Backend
\\\`\\\`\\\`bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask init-db
flask seed-db
flask run
\\\`\\\`\\\`

### Frontend
\\\`\\\`\\\`bash
cd frontend
npm install
npm start
\\\`\\\`\\\`

## Default Admin
- Email: admin@tradesense.com
- Password: admin123

## Tech Stack
- Backend: Flask, PostgreSQL
- Frontend: React, Tailwind CSS
- Auth: JWT
EOF
\`\`\`

### 6️⃣ Upload to GitHub

\`\`\`bash
git add .
git commit -m "Initial commit: TradeSense AI platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tradesense-ai.git
git push -u origin main
\`\`\`

## ☁️ Deployment Options

### Option 1: Railway (Recommended)

**Backend:**
1. Go to railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo, choose \`backend\` folder
4. Add PostgreSQL database
5. Set environment variables:
   - \`DATABASE_URL\` (auto-set by Railway)
   - \`JWT_SECRET_KEY\` = random-secret-key

**Frontend:**
1. New service from same repo
2. Choose \`frontend\` folder
3. Set \`REACT_APP_API_URL\` = your backend URL

### Option 2: Render

**Database:**
1. Create PostgreSQL database on render.com
2. Copy connection string

**Backend:**
1. New Web Service
2. Connect GitHub repo
3. Root directory: \`backend\`
4. Build: \`pip install -r requirements.txt\`
5. Start: \`flask run --host=0.0.0.0\`
6. Environment: Add \`DATABASE_URL\` and \`JWT_SECRET_KEY\`

**Frontend:**
1. New Static Site
2. Root: \`frontend\`
3. Build: \`npm install && npm run build\`
4. Publish: \`build\`

### Option 3: Heroku

\`\`\`bash
# Backend
cd backend
heroku create tradesense-api
heroku addons:create heroku-postgresql:mini
git push heroku main

# Frontend
cd frontend
heroku create tradesense-app
heroku buildpacks:set heroku/nodejs
git push heroku main
\`\`\`

### Option 4: DigitalOcean App Platform

1. Create App
2. Add PostgreSQL database
3. Add backend component (Flask)
4. Add frontend component (React)
5. Deploy

## 🔧 Environment Variables

### Backend (.env)
\`\`\`
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET_KEY=your-super-secret-key
FLASK_ENV=production
\`\`\`

### Frontend (.env)
\`\`\`
REACT_APP_API_URL=https://your-backend-url.com/api
\`\`\`

## 📝 Post-Deployment Checklist

- [ ] Database schema applied
- [ ] Admin user created
- [ ] Environment variables set
- [ ] Frontend points to backend URL
- [ ] CORS configured for frontend domain
- [ ] JWT secret changed from default
- [ ] Database backups enabled
- [ ] SSL/HTTPS enabled

## 🐛 Common Issues

**CORS Error:**
- Add frontend URL to Flask-CORS config in app.py

**Database Connection:**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials

**JWT Errors:**
- Check token in localStorage
- Verify JWT_SECRET_KEY matches

## 📞 Support

Open an issue on GitHub for bugs or questions.
`;
`;