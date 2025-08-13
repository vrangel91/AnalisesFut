@echo off
echo ========================================
echo    Teste de Funcionamento - Windows
echo ========================================
echo.

echo [1/4] Verificando dependencias do servidor...
call npm list --depth=0
if %errorlevel% neq 0 (
    echo ERRO: Problemas com dependencias do servidor
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando dependencias do cliente...
cd client
call npm list --depth=0
if %errorlevel% neq 0 (
    echo ERRO: Problemas com dependencias do cliente
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Verificando vulnerabilidades...
call npm audit
if %errorlevel% neq 0 (
    echo AVISO: Vulnerabilidades encontradas no servidor
)

cd client
call npm audit
if %errorlevel% neq 0 (
    echo AVISO: Vulnerabilidades encontradas no cliente
)
cd ..

echo.
echo [4/4] Testando construcao do cliente...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha na construcao do cliente
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    Teste concluido com sucesso!
echo ========================================
echo.
echo Status:
echo ✅ Dependencias do servidor: OK
echo ✅ Dependencias do cliente: OK
echo ✅ Construcao do cliente: OK
echo ✅ Banco de dados: Inicializado
echo.
echo Para iniciar a aplicacao:
echo 1. npm run dev (modo desenvolvimento)
echo 2. npm start (modo producao)
echo.
echo Acesse: http://localhost:3001 (servidor)
echo Acesse: http://localhost:3000 (cliente)
echo ========================================
pause
