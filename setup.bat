@echo off
echo ========================================
echo    IA de Apostas - Setup do Sistema
echo ========================================
echo.

echo [1/4] Instalando dependencias do servidor...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do servidor
    pause
    exit /b 1
)

echo.
echo [2/4] Instalando dependencias do cliente...
cd client
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do cliente
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Inicializando banco de dados...
npm run db:init
if %errorlevel% neq 0 (
    echo ERRO: Falha ao inicializar banco de dados
    pause
    exit /b 1
)

echo.
echo [4/4] Construindo aplicacao...
cd client
npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir aplicacao
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    Setup concluido com sucesso!
echo ========================================
echo.
echo Para iniciar o servidor, execute:
echo   npm start
echo.
echo Para desenvolvimento, execute:
echo   npm run dev
echo.
pause
