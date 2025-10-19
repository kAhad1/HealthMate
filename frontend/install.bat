@echo off
echo Installing HealthMate Frontend Dependencies...
echo.

REM Try to install dependencies
npm install

if %errorlevel% neq 0 (
    echo.
    echo There was an error installing dependencies.
    echo This might be due to PowerShell execution policy.
    echo.
    echo Please try one of these solutions:
    echo.
    echo 1. Run PowerShell as Administrator and execute:
    echo    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo.
    echo 2. Or use Command Prompt instead of PowerShell
    echo.
    echo 3. Or run: npx create-vite@latest healthmate-new --template react
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Now you can run: npm run dev
echo.
pause
