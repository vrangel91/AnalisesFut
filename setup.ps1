Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   IA de Apostas - Setup do Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Instalando dependencias do servidor..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependencias do servidor" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Instalando dependencias do cliente..." -ForegroundColor Yellow
cd client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependencias do cliente" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
cd ..

Write-Host ""
Write-Host "[3/4] Inicializando banco de dados..." -ForegroundColor Yellow
npm run db:init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao inicializar banco de dados" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[4/4] Construindo aplicacao..." -ForegroundColor Yellow
cd client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao construir aplicacao" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
cd ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Setup concluido com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o servidor, execute:" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "Para desenvolvimento, execute:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Read-Host "Pressione Enter para sair"
