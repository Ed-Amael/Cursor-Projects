# AuraSAT Website Deployment Guide

This guide provides multiple options for hosting your AuraSAT website.

## 🚀 Quick Start Options

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Frontend Deployment (Vercel)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project" and import your repository
4. Set the following:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy

#### Backend Deployment (Railway)
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the following environment variables:
   - `PORT`: 4000
   - `JWT_SECRET`: your-secret-key-here
   - `FRONTEND_ORIGIN`: your-vercel-frontend-url
5. Deploy

### Option 2: Netlify (Frontend) + Heroku (Backend)

#### Frontend Deployment (Netlify)
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up
3. Click "New site from Git"
4. Connect your GitHub repository
5. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy

#### Backend Deployment (Heroku)
1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your-secret-key-here
   heroku config:set FRONTEND_ORIGIN=https://your-netlify-url.netlify.app
   ```
5. Deploy: `git push heroku main`

### Option 3: Docker Deployment

#### Local Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

#### Cloud Docker (DigitalOcean, AWS, etc.)
1. Build images:
   ```bash
   docker build -t aurasat-backend ./backend
   docker build -t aurasat-frontend ./frontend
   ```
2. Push to registry and deploy to your preferred cloud provider

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=4000
JWT_SECRET=your-secret-key-here
FRONTEND_ORIGIN=https://your-frontend-url.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
```

## 📁 Project Structure
```
aurasat/
├── frontend/          # React + Vite app
│   ├── dist/         # Built files
│   ├── src/          # Source code
│   └── package.json  # Frontend dependencies
├── backend/          # Express.js API
│   ├── dist/         # Built files
│   ├── src/          # Source code
│   └── package.json  # Backend dependencies
└── package.json      # Root workspace
```

## 🛠️ Build Commands

```bash
# Install dependencies
npm install

# Build both frontend and backend
npm run build

# Development mode
npm run dev

# Start production backend
npm run start
```

## 🔍 Troubleshooting

### Common Issues
1. **CORS errors**: Ensure `FRONTEND_ORIGIN` is set correctly
2. **Build failures**: Check Node.js version (>=18.0.0)
3. **Port conflicts**: Change ports in environment variables

### Health Check
- Frontend: `https://your-domain.com`
- Backend: `https://your-domain.com/api/health`

## 📞 Support

For deployment issues, check:
1. Build logs in your hosting platform
2. Environment variables are set correctly
3. Port configurations match your hosting provider

## 🔒 Security Notes

1. Change `JWT_SECRET` in production
2. Use HTTPS in production
3. Set up proper CORS origins
4. Consider rate limiting for production
