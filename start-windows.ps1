# IA de Apostas de Futebol - Script PowerShell para Windows
Write-Host "========================================" -ForegroundColor Green
Write-Host "    IA de Apostas de Futebol - Windows" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: npm não encontrado. Instale o npm primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[1/4] Instalando dependências do servidor..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependências do servidor" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Instalando dependências do cliente..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependências do cliente" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "[3/4] Inicializando banco de dados..." -ForegroundColor Yellow
npm run db:init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao inicializar banco de dados" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "[4/4] Construindo aplicação cliente..." -ForegroundColor Yellow
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao construir aplicação" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuração necessária:" -ForegroundColor Cyan
Write-Host "1. Configure sua chave da API-SPORTS no arquivo config.env" -ForegroundColor White
Write-Host "2. Para desenvolvimento: npm run dev" -ForegroundColor White
Write-Host "3. Para produção: npm start" -ForegroundColor White
Write-Host ""
Write-Host "Acesse: http://localhost:3001 (servidor)" -ForegroundColor White
Write-Host "Acesse: http://localhost:3000 (cliente)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Deseja iniciar o servidor agora? (s/n)"
if ($choice -eq "s" -or $choice -eq "S" -or $choice -eq "sim" -or $choice -eq "SIM") {
    Write-Host "Iniciando servidor em modo desenvolvimento..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host "Para iniciar manualmente, execute: npm run dev" -ForegroundColor Cyan
    Read-Host "Pressione Enter para sair"
}
