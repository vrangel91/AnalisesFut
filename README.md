# 🚀 IA de Apostas de Futebol

Sistema inteligente de análise e predições para apostas de futebol utilizando a API-SPORTS com sistema de cache otimizado.

## ✨ Novas Funcionalidades

### 🗄️ Sistema de Cache Inteligente
- **Cache com SQLite**: Armazenamento local de dados para reduzir chamadas à API
- **TTL Configurável**: Diferentes tempos de expiração por tipo de dado
- **Monitor de Cache**: Interface para acompanhar performance e estatísticas
- **Limpeza Automática**: Cache expirado é removido automaticamente

### 🔄 Otimizações de Performance
- **Pré-carregamento**: Dados importantes são carregados automaticamente
- **Fallback Inteligente**: Sistema continua funcionando mesmo com falhas na API
- **Compressão**: Respostas comprimidas para melhor performance
- **Rate Limiting**: Proteção contra sobrecarga de requisições

### 🛡️ Segurança e Estabilidade
- **Helmet**: Headers de segurança configurados
- **Graceful Shutdown**: Fechamento seguro do servidor
- **Error Handling**: Tratamento robusto de erros
- **Logs Detalhados**: Monitoramento completo do sistema

## 🏗️ Arquitetura

```
📁 boasvindasbotbet/
├── 📁 src/
│   ├── 📁 services/
│   │   ├── apiService.js          # Serviço original da API
│   │   ├── cacheService.js        # Gerenciamento de cache SQLite
│   │   └── cachedApiService.js    # API com cache integrado
│   ├── 📁 routes/
│   │   ├── fixtures.js            # Rotas de jogos (com cache)
│   │   ├── cache.js               # Rotas de gerenciamento de cache
│   │   └── ...                    # Outras rotas
│   └── 📁 database/
│       └── init.js                # Inicialização do banco
├── 📁 client/
│   ├── 📁 src/
│   │   ├── 📁 pages/
│   │   │   └── CacheMonitor.js    # Interface de monitoramento
│   │   └── components/
│   │       └── Navbar.js          # Navegação atualizada
│   └── ...
├── 📁 data/
│   └── cache.db                   # Banco SQLite (criado automaticamente)
├── server.js                      # Servidor principal
├── package.json                   # Dependências atualizadas
└── setup.bat                      # Script de instalação
```

## 🚀 Instalação

### Opção 1: Setup Automático (Recomendado)

**Windows (CMD):**
```cmd
setup.bat
```

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

### Opção 2: Instalação Manual

**Windows (CMD):**
```cmd
# 1. Instalar dependências do servidor
npm install

# 2. Instalar dependências do cliente
cd client
npm install
cd ..

# 3. Inicializar banco de dados
npm run db:init

# 4. Construir aplicação
cd client
npm run build
cd ..
```

**Linux/Mac:**
```bash
# 1. Instalar dependências do servidor
npm install

# 2. Instalar dependências do cliente
cd client && npm install && cd ..

# 3. Inicializar banco de dados
npm run db:init

# 4. Construir aplicação
cd client && npm run build && cd ..
```

## 🎯 Como Usar

### Iniciar o Servidor
```bash
# Produção
npm start

# Desenvolvimento
npm run dev
```

### Acessar a Aplicação
- **URL Principal**: http://localhost:3001
- **Monitor de Cache**: http://localhost:3001/cache

## 📊 Monitor de Cache

A nova página de monitor de cache oferece:

- **Estatísticas Gerais**: Total de entradas, taxa de acerto, requisições
- **Análise por Endpoint**: Performance detalhada de cada rota
- **Controles de Gerenciamento**: Limpar cache, pré-carregar dados
- **Informações do Sistema**: TTL, tarefas automáticas

## ⚙️ Configuração de Cache

### TTL (Time To Live) por Tipo
```javascript
defaultTTL = {
  fixtures: 30 * 60 * 1000,    // 30 minutos
  odds: 5 * 60 * 1000,         // 5 minutos
  leagues: 24 * 60 * 60 * 1000, // 24 horas
  teams: 24 * 60 * 60 * 1000,   // 24 horas
  predictions: 60 * 60 * 1000,  // 1 hora
  h2h: 12 * 60 * 60 * 1000,     // 12 horas
  statistics: 60 * 60 * 1000,   // 1 hora
  default: 15 * 60 * 1000       // 15 minutos
}
```

### Tarefas Automáticas
- **Limpeza de Cache**: A cada hora
- **Pré-carregamento**: A cada 6 horas
- **Dados Ao Vivo**: A cada 5 minutos

## 🔧 API Endpoints

### Endpoints com Cache
Todos os endpoints existentes agora suportam cache:

```bash
# Forçar refresh dos dados
GET /api/fixtures?refresh=true

# Usar cache (padrão)
GET /api/fixtures
```

### Novos Endpoints de Cache
```bash
# Estatísticas do cache
GET /api/cache/status

# Limpar cache expirado
POST /api/cache/clean

# Pré-carregar dados
POST /api/cache/preload

# Forçar refresh específico
POST /api/cache/refresh/:endpoint
```

## 📈 Benefícios do Cache

### Redução de Chamadas à API
- **Antes**: 100% das requisições iam para a API externa
- **Depois**: Apenas ~20-30% das requisições (dependendo do uso)

### Melhoria na Performance
- **Resposta**: De 2-5 segundos para 50-200ms
- **Disponibilidade**: Sistema funciona mesmo com falhas na API
- **Custo**: Redução significativa no uso da API

### Experiência do Usuário
- **Carregamento**: Páginas carregam instantaneamente
- **Confiabilidade**: Menos falhas e timeouts
- **Responsividade**: Interface mais fluida

## 🛠️ Desenvolvimento

### Estrutura de Cache
```javascript
// Exemplo de uso do cache
const cachedApiService = require('./src/services/cachedApiService');

// Buscar dados (usa cache se disponível)
const fixtures = await cachedApiService.getFixtures();

// Forçar refresh
const freshFixtures = await cachedApiService.getFixtures({}, true);
```

### Adicionando Novos Endpoints
1. Adicione o método no `cachedApiService.js`
2. Atualize a rota correspondente
3. Configure o TTL apropriado no `cacheService.js`

## 🔍 Monitoramento

### Logs do Sistema
```bash
# Cache hit
🎯 Cache hit: /fixtures

# Cache miss
❌ Cache miss: /fixtures

# Dados salvos
💾 Cache salvo: /fixtures

# Limpeza automática
🧹 Cache expirado limpo
```

### Métricas Importantes
- **Taxa de Acerto**: Ideal > 70%
- **Tempo de Resposta**: < 200ms para cache hits
- **Uso de Memória**: Monitorar tamanho do banco SQLite

## 🚨 Troubleshooting

### Problemas Comuns

**Cache não está funcionando**
```bash
# Verificar se o banco foi criado
ls data/cache.db

# Reinicializar banco
npm run db:init
```

**Performance lenta**
```bash
# Verificar estatísticas
GET /api/cache/status

# Limpar cache
POST /api/cache/clean
```

**Erros de API**
- O sistema automaticamente usa cache como fallback
- Verificar logs para detalhes dos erros

## 📝 Changelog

### v2.0.0 - Sistema de Cache
- ✅ Implementação de cache SQLite
- ✅ Monitor de cache em tempo real
- ✅ Otimizações de performance
- ✅ Melhorias de segurança
- ✅ Interface de gerenciamento
- ✅ Tarefas automáticas

### v1.0.0 - Versão Inicial
- ✅ Integração com API-SPORTS
- ✅ Interface básica
- ✅ Predições e análises

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API-SPORTS
- Verifique os logs do sistema

---

**Desenvolvido com ❤️ para otimizar apostas de futebol**
