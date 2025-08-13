@echo off
echo ========================================
echo    IA de Apostas de Futebol
echo ========================================
echo.

echo Instalando dependencias do backend...
npm install

echo.
echo Instalando dependencias do frontend...
cd client
npm install
cd ..

echo.
echo ========================================
echo    Configuracao necessaria:
echo ========================================
echo 1. Configure sua chave da API-SPORTS no arquivo config.env
echo 2. Execute: npm run dev
echo 3. Em outro terminal: cd client
echo    npm start
echo.
echo Acesse: http://localhost:3000
echo ========================================
pause
