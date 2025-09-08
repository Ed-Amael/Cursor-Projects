@echo off
echo 🚀 AuraSAT Deployment Script
echo ==============================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the project
echo 🔨 Building the project...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Ready for deployment!
echo.
echo Choose your deployment option:
echo 1. Vercel (Frontend) + Railway (Backend) - Recommended
echo 2. Netlify (Frontend) + Heroku (Backend)
echo 3. Docker deployment
echo 4. Local development
echo.
echo See DEPLOYMENT.md for detailed instructions.
pause
