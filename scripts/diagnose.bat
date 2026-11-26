@echo off
REM Color output for Windows
setlocal enabledelayedexpansion

echo.
echo ===============================================================
echo Garden Grains - Backend Diagnostic Tool (Windows)
echo ===============================================================
echo.

REM Check if backend directory exists
if not exist "backend\" (
    echo [ERROR] Backend directory not found
    echo Please run this script from the root directory (MP1)
    pause
    exit /b 1
)

echo [INFO] 1. Checking .env file...
if exist "backend\.env" (
    echo [OK] .env file exists
    
    findstr /C:"MONGODB_URI" "backend\.env" >nul
    if !errorlevel! equ 0 (
        echo [OK] MONGODB_URI found
    ) else (
        echo [ERROR] MONGODB_URI not found in .env
    )
    
    findstr /C:"JWT_SECRET" "backend\.env" >nul
    if !errorlevel! equ 0 (
        echo [OK] JWT_SECRET found
    ) else (
        echo [ERROR] JWT_SECRET not found in .env
    )
) else (
    echo [ERROR] .env file not found
    echo Create it by copying env.example:
    echo   copy backend\env.example backend\.env
    pause
    exit /b 1
)

echo.
echo [INFO] 2. Checking Node.js installation...
node --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js installed: !NODE_VERSION!
) else (
    echo [ERROR] Node.js not found. Please install Node.js
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [INFO] 3. Checking npm packages...
if exist "backend\node_modules" (
    echo [OK] Dependencies installed
) else (
    echo [ERROR] Dependencies not installed
    echo Run: cd backend ^&^& npm install
    pause
    exit /b 1
)

echo.
echo [INFO] 4. Checking MongoDB...
where mongosh >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] MongoDB CLI found
    echo Note: Make sure MongoDB service is running
    echo   - Check Services (services.msc) and start "MongoDB"
    echo   - Or run 'mongod' in a terminal
) else (
    where mongo >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] MongoDB CLI found
    ) else (
        echo [WARNING] MongoDB CLI not found
        echo   - Check if MongoDB is running on your system
        echo   - Or install MongoDB from: https://www.mongodb.com/try/download/community
    )
)

echo.
echo [INFO] 5. Summary
echo.
echo Your backend should be ready to start!
echo.

echo ===============================================================
echo Next Steps:
echo ===============================================================
echo.
echo 1. Make sure MongoDB is running
echo    - Open Services (Win+R, services.msc)
echo    - Find "MongoDB" and ensure it's running
echo    - OR run: mongod
echo.
echo 2. Start Backend Server (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 3. Start Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Verify Backend is working:
echo    Open browser: http://localhost:5000/api/health
echo    Should show: {"status":"OK","message":"Garden Grains API is running"}
echo.
echo ===============================================================
echo.
pause
