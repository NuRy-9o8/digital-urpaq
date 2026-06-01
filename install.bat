@echo off
REM Script to install and run Digital Urpaq

echo.
echo ========================================
echo  🎓 Digital Urpaq - Quick Start
echo ========================================
echo.

REM Install Backend
echo Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Error installing backend dependencies
    exit /b 1
)

cd ..

REM Install Frontend
echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo Error installing frontend dependencies
    exit /b 1
)

cd ..

echo.
echo ========================================
echo ✅ Installation Complete!
echo ========================================
echo.
echo 🚀 To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo ========================================
