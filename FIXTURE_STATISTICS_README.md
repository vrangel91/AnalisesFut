# 📊 Estatísticas Completas da Fixture

Esta funcionalidade permite obter estatísticas detalhadas de uma partida específica, incluindo **Total de Chutes**, **Total de Faltas**, **Total de Passes** e muito mais.

## 🎯 Funcionalidades

### Estatísticas Disponíveis

- **Total de Chutes** (home/away/total)
- **Total de Faltas** (home/away/total)
- **Total de Passes** (home/away/total)
- **Escanteios** (home/away/total)
- **Chutes no Gol** (home/away/total)
- **Chutes Fora do Gol** (home/away/total)
- **Chutes Dentro da Área** (home/away/total)
- **Chutes Fora da Área** (home/away/total)
- **Chutes Bloqueados** (home/away/total)
- **Impedimentos** (home/away/total)
- **Posse de Bola** (home/away)
- **Cartões Amarelos** (home/away/total)
- **Cartões Vermelhos** (home/away/total)
- **Defesas do Goleiro** (home/away/total)
- **Passes Precisos** (home/away/total)
- **Precisão dos Passes** (home/away)

## 🚀 Como Usar

### 1. Via API REST

```bash
# Buscar estatísticas de uma fixture específica
GET /api/fixtures/statistics/{fixtureId}

# Exemplo
GET /api/fixtures/statistics/215662
```

**Parâmetros opcionais:**
- `half=true` - Incluir estatísticas do primeiro e segundo tempo
- `team={teamId}` - Filtrar por time específico
- `type={statType}` - Filtrar por tipo de estatística

### 2. Via Interface Web

1. Acesse a página de **Fixtures**
2. Clique em uma partida para abrir o modal
3. Clique no botão **📊** (ícone de gráfico) no cabeçalho
4. Visualize as estatísticas completas organizadas em cards

### 3. Via Código (Backend)

```javascript
const h2hCornerAnalysisService = require('./src/services/h2hCornerAnalysisService');

// Buscar estatísticas completas
const stats = await h2hCornerAnalysisService.getFixtureStats(fixtureId, {
  half: true, // opcional
  team: teamId, // opcional
  type: 'Total Shots' // opcional
});

if (stats.success) {
  console.log('Total de Chutes:', stats.data.totalShots.total);
  console.log('Total de Faltas:', stats.data.totalFouls.total);
  console.log('Total de Passes:', stats.data.totalPasses.total);
}
```

## 💾 Sistema de Cache

### TTL (Time To Live)
- **24 horas** para estatísticas de fixtures
- Respeita a recomendação da API (1x ao dia)

### Estrutura do Cache
```javascript
{
  endpoint: 'fixtures/statistics',
  params: { fixture: fixtureId },
  data: [...], // Dados da API
  expires_at: '2024-01-01 12:00:00'
}
```

### Verificar Cache
```javascript
const cacheService = require('./src/services/cacheService');

// Verificar se existe no cache
const cachedData = await cacheService.getCache('fixtures/statistics', { fixture: fixtureId });

if (cachedData) {
  console.log('✅ Dados encontrados no cache');
} else {
  console.log('❌ Dados não encontrados no cache');
}
```

## 🧪 Testes

### Executar Teste Manual
```bash
node test-fixture-statistics.js
```

### Teste via API
```bash
# Testar endpoint
curl -X GET "http://localhost:3000/api/fixtures/statistics/215662"

# Testar com parâmetros
curl -X GET "http://localhost:3000/api/fixtures/statistics/215662?half=true"
```

## 📋 Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "available": true,
    "homeTeam": {
      "id": 33,
      "name": "Manchester United",
      "logo": "https://media.api-sports.io/football/teams/33.png"
    },
    "awayTeam": {
      "id": 34,
      "name": "Liverpool",
      "logo": "https://media.api-sports.io/football/teams/34.png"
    },
    "totalShots": {
      "home": 12,
      "away": 15,
      "total": 27
    },
    "totalFouls": {
      "home": 18,
      "away": 22,
      "total": 40
    },
    "totalPasses": {
      "home": 450,
      "away": 520,
      "total": 970
    },
    "corners": {
      "home": 6,
      "away": 8,
      "total": 14
    },
    "ballPossession": {
      "home": "45%",
      "away": "55%"
    },
    "passesPercentage": {
      "home": "85.2%",
      "away": "88.1%"
    }
  },
  "source": "api",
  "fromCache": false,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎨 Interface Visual

### Cards Organizados
1. **Estatísticas Principais** (verde)
   - Total de Chutes, Faltas, Passes, Escanteios

2. **Detalhes dos Chutes** (azul)
   - Chutes no Gol, Fora do Gol, Dentro/Fora da Área, Bloqueados

3. **Posse e Passes** (roxo)
   - Posse de Bola, Passes Precisos, Precisão

4. **Cartões e Outros** (laranja)
   - Cartões Amarelos/Vermelhos, Impedimentos, Defesas

### Indicadores Visuais
- **🟢 Verde**: Time da casa domina
- **🔴 Vermelho**: Time visitante domina
- **🟡 Amarelo**: Empate/Equilibrado
- **📦 Cache**: Dados vindos do cache
- **🌐 API**: Dados vindos da API

## ⚠️ Limitações

1. **Frequência de Chamadas**: Máximo 1x ao dia por fixture (recomendação da API)
2. **Disponibilidade**: Estatísticas só disponíveis após o fim da partida
3. **Cache**: Dados ficam em cache por 24 horas
4. **IDs Válidos**: Necessário usar fixture IDs válidos da API

## 🔧 Configuração

### Variáveis de Ambiente
```env
API_SPORTS_BASE_URL=https://v3.football.api-sports.io
API_SPORTS_KEY=sua_chave_aqui
API_SPORTS_HOST=v3.football.api-sports.io
```

### Banco de Dados
- SQLite para cache (`data/cache.db`)
- Tabela `cache` com campos: `id`, `endpoint`, `params`, `data`, `expires_at`

## 🚨 Troubleshooting

### Erro: "Estatísticas não disponíveis"
- Verificar se a partida já terminou
- Verificar se o fixture ID é válido
- Aguardar alguns minutos após o fim da partida

### Erro: "Erro de conexão"
- Verificar conectividade com a API
- Verificar chave da API
- Verificar limites de rate limiting

### Cache não funcionando
- Verificar permissões do banco SQLite
- Verificar se o cache não expirou
- Limpar cache manualmente se necessário

## 📈 Melhorias Futuras

- [ ] Estatísticas em tempo real (live)
- [ ] Comparação entre partidas
- [ ] Gráficos e visualizações
- [ ] Exportação de dados
- [ ] Notificações de atualizações
- [ ] Integração com análise H2H

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Executar testes manuais
3. Verificar documentação da API
4. Consultar issues do projeto
