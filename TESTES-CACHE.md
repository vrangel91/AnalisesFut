# 🧪 Testes do Sistema de Cache

Este documento descreve os testes criados para verificar o funcionamento do sistema de cache.

## 📋 Arquivos de Teste

### 1. `test-database-cache.js`
**Objetivo**: Testar o banco de dados SQLite do cache
- Verifica se a tabela `cache` existe
- Testa a estrutura da tabela
- Verifica dados existentes
- Testa inserção e recuperação de dados
- Verifica dados expirados
- Limpa dados de teste

### 2. `test-cache.js`
**Objetivo**: Testar o CacheService
- Testa salvamento de dados no cache
- Testa recuperação de dados do cache
- Testa cache com diferentes parâmetros
- Verifica estatísticas do cache
- Testa TTL (Time To Live)

### 3. `test-cached-api.js`
**Objetivo**: Testar o CachedApiService
- Testa primeira requisição (deve ir para API)
- Testa segunda requisição (deve retornar do cache)
- Testa diferentes endpoints
- Verifica se o cache está funcionando
- Testa com parâmetros diferentes

### 4. `test-predictions-cache.js`
**Objetivo**: Testar o cache específico das predictions
- Verifica cache inicial
- Testa primeira requisição (gera dados)
- Verifica se dados foram salvos no cache
- Testa segunda requisição (retorna do cache)
- Testa forçar refresh
- Testa cache de predictions ao vivo
- Verifica estatísticas finais

### 5. `run-all-tests.js`
**Objetivo**: Executar todos os testes em sequência
- Executa todos os testes automaticamente
- Gera relatório de resultados
- Mostra taxa de sucesso
- Fornece recomendações em caso de falha

## 🚀 Como Executar os Testes

### Executar todos os testes:
```bash
npm run test:all
```

### Executar testes individuais:
```bash
# Teste do banco de dados
npm run test:database

# Teste do CacheService
npm run test:cache

# Teste do CachedApiService
npm run test:api

# Teste do cache de predictions
npm run test:predictions
```

### Executar diretamente:
```bash
node test-database-cache.js
node test-cache.js
node test-cached-api.js
node test-predictions-cache.js
node run-all-tests.js
```

## 🔍 O que os Testes Verificam

### ✅ Funcionalidades Testadas:
1. **Banco de Dados**:
   - Existência e estrutura da tabela cache
   - Inserção e recuperação de dados
   - Expiração de dados (TTL)
   - Limpeza de dados

2. **CacheService**:
   - Salvamento de dados
   - Recuperação de dados
   - Diferentes tipos de cache
   - Estatísticas do cache
   - Time To Live (TTL)

3. **CachedApiService**:
   - Primeira requisição (API)
   - Segunda requisição (Cache)
   - Diferentes endpoints
   - Performance do cache

4. **Cache de Predictions**:
   - Cache inicial vazio
   - Geração de dados na primeira requisição
   - Retorno do cache na segunda requisição
   - Forçar refresh
   - Cache de predictions ao vivo

## 📊 Interpretando os Resultados

### ✅ Teste Passou:
- Todos os testes retornam código 0
- Mensagens de sucesso são exibidas
- Dados são salvos e recuperados corretamente
- Cache está funcionando como esperado

### ❌ Teste Falhou:
- Verifique os logs para identificar o problema específico
- Certifique-se de que o servidor está rodando
- Verifique se o banco de dados foi inicializado
- Confirme se todas as dependências estão instaladas

## 🐛 Problemas Comuns e Soluções

### 1. Erro de Conexão com Banco de Dados
```
❌ Erro ao verificar tabelas: SQLITE_CANTOPEN
```
**Solução**: Execute `npm run db:init` para inicializar o banco

### 2. Erro de Módulo não Encontrado
```
❌ Cannot find module './src/services/cacheService'
```
**Solução**: Verifique se o arquivo existe e o caminho está correto

### 3. Erro de API não Respondendo
```
❌ Erro durante os testes: ECONNREFUSED
```
**Solução**: Certifique-se de que o servidor está rodando (`npm start`)

### 4. Cache não Funcionando
```
❌ FromCache: false (deveria ser true)
```
**Solução**: Verifique se o cacheService está configurado corretamente

## 📈 Métricas de Performance

Os testes também verificam:
- **Tempo de resposta**: Compara tempo da primeira vs segunda requisição
- **Taxa de cache hit**: Verifica se o cache está sendo utilizado
- **Tamanho do cache**: Monitora o crescimento do cache
- **Expiração**: Verifica se dados expirados são removidos

## 🔧 Configuração dos Testes

### Variáveis de Ambiente:
- `NODE_ENV=test` (opcional, para ambiente de teste)
- `CACHE_DB_PATH` (caminho do banco de dados do cache)

### Dependências:
- `sqlite3`: Para testes do banco de dados
- `supertest`: Para testes das rotas HTTP
- `express`: Para simular o servidor

## 📝 Logs dos Testes

Os testes geram logs detalhados que incluem:
- Status de cada operação
- Dados salvos/recuperados
- Tempos de resposta
- Erros encontrados
- Estatísticas do cache

## 🎯 Próximos Passos

Após executar os testes:
1. Analise os resultados
2. Identifique problemas específicos
3. Corrija falhas encontradas
4. Re-execute os testes para verificar correções
5. Monitore o cache em produção
