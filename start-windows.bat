@echo off
echo ========================================
echo    IA de Apostas de Futebol - Windows
echo ========================================
echo.

echo [1/4] Instalando dependencias do servidor...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do servidor
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias do cliente...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do cliente
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Construindo aplicacao cliente...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir aplicacao
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo    Configuracao necessaria:
echo ========================================
echo 1. Configure sua chave da API-SPORTS no arquivo config.env
echo 2. Para desenvolvimento: npm run dev
echo 3. Para producao: npm start
echo.
echo Acesse: http://localhost:3001 (servidor)
echo Acesse: http://localhost:3000 (cliente)
echo ========================================
echo.
echo Iniciando servidor em modo desenvolvimento...
call npm run dev
