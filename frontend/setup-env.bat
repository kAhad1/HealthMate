@echo off
echo Creating environment file for HealthMate Frontend...
echo.

echo VITE_API_URL=http://localhost:5000/api > .env.local
echo VITE_APP_NAME=HealthMate >> .env.local
echo VITE_APP_VERSION=1.0.0 >> .env.local

echo.
echo Environment file created successfully!
echo.
echo File contents:
type .env.local
echo.
echo Now you can run: npm run dev
echo.
pause
