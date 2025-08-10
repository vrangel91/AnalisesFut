const express = require('express');
const request = require('supertest');
const cacheService = require('./src/services/cacheService');

// Criar um app Express simples para testar as rotas
const app = express();
app.use('/api/predictions', require('./src/routes/predictions'));

async function testPredictionsCache() {
  console.log('🧪 Iniciando testes do cache de Predictions...\n');

  try {
    // Teste 1: Verificar se o cache está vazio inicialmente
    console.log('🔍 Teste 1: Verificando cache inicial...');
    const initialCache = await cacheService.getCache('predictions', { type: 'today' });
    console.log('   - Cache inicial:', initialCache ? 'existe' : 'vazio');
    console.log('');

    // Teste 2: Fazer primeira requisição (deve gerar dados e salvar no cache)
    console.log('📡 Teste 2: Primeira requisição (deve gerar dados)...');
    const firstResponse = await request(app)
      .get('/api/predictions/today')
      .expect(200);

    console.log('   - Status:', firstResponse.status);
    console.log('   - FromCache:', firstResponse.body.fromCache);
    console.log('   - Count:', firstResponse.body.count);
    console.log('   - Timestamp:', firstResponse.body.timestamp);
    console.log('');

    // Teste 3: Verificar se os dados foram salvos no cache
    console.log('💾 Teste 3: Verificando se dados foram salvos no cache...');
    const cachedData = await cacheService.getCache('predictions', { type: 'today' });
    console.log('   - Dados no cache:', cachedData ? 'encontrado' : 'não encontrado');
    if (cachedData) {
      console.log('   - Cache count:', cachedData.count);
      console.log('   - Cache timestamp:', cachedData.timestamp);
    }
    console.log('');

    // Teste 4: Fazer segunda requisição (deve retornar do cache)
    console.log('📡 Teste 4: Segunda requisição (deve retornar do cache)...');
    const secondResponse = await request(app)
      .get('/api/predictions/today')
      .expect(200);

    console.log('   - Status:', secondResponse.status);
    console.log('   - FromCache:', secondResponse.body.fromCache);
    console.log('   - Count:', secondResponse.body.count);
    console.log('   - Timestamp:', secondResponse.body.timestamp);
    console.log('');

    // Teste 5: Forçar refresh (deve ignorar cache)
    console.log('🔄 Teste 5: Forçar refresh (deve ignorar cache)...');
    const refreshResponse = await request(app)
      .get('/api/predictions/today?refresh=true')
      .expect(200);

    console.log('   - Status:', refreshResponse.status);
    console.log('   - FromCache:', refreshResponse.body.fromCache);
    console.log('   - Count:', refreshResponse.body.count);
    console.log('');

    // Teste 6: Testar cache de predictions ao vivo
    console.log('📡 Teste 6: Testando cache de predictions ao vivo...');
    const liveResponse = await request(app)
      .get('/api/predictions/live')
      .expect(200);

    console.log('   - Status:', liveResponse.status);
    console.log('   - FromCache:', liveResponse.body.fromCache);
    console.log('   - Count:', liveResponse.body.count);
    console.log('');

    // Teste 7: Verificar estatísticas finais do cache
    console.log('📊 Teste 7: Estatísticas finais do cache...');
    const stats = await cacheService.getCacheStats();
    const size = await cacheService.getCacheSize();
    console.log('   - Total de entradas:', size);
    console.log('   - Estatísticas por endpoint:', stats.length);
    stats.forEach(stat => {
      if (stat.endpoint.includes('predictions')) {
        console.log(`     * ${stat.endpoint}: ${stat.total_entries} entradas`);
      }
    });
    console.log('');

    console.log('🎉 Todos os testes do cache de Predictions concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar os testes
testPredictionsCache();
