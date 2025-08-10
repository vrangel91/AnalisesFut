const cacheService = require('./src/services/cacheService');

async function testCacheService() {
  console.log('🧪 Iniciando testes do CacheService...\n');

  try {
    // Teste 1: Salvar dados no cache
    console.log('📝 Teste 1: Salvando dados no cache...');
    const testData = {
      data: ['test1', 'test2', 'test3'],
      count: 3,
      timestamp: new Date().toISOString()
    };
    
    await cacheService.setCache('test', { type: 'test' }, testData);
    console.log('✅ Dados salvos no cache\n');

    // Teste 2: Recuperar dados do cache
    console.log('📖 Teste 2: Recuperando dados do cache...');
    const retrievedData = await cacheService.getCache('test', { type: 'test' });
    
    if (retrievedData) {
      console.log('✅ Dados recuperados do cache:');
      console.log('   - Data:', retrievedData.data);
      console.log('   - Count:', retrievedData.count);
      console.log('   - Timestamp:', retrievedData.timestamp);
    } else {
      console.log('❌ Falha ao recuperar dados do cache');
    }
    console.log('');

    // Teste 3: Testar cache com diferentes parâmetros
    console.log('🔍 Teste 3: Testando cache com diferentes parâmetros...');
    await cacheService.setCache('predictions', { type: 'today' }, {
      data: ['prediction1', 'prediction2'],
      count: 2,
      timestamp: new Date().toISOString()
    });

    const todayPredictions = await cacheService.getCache('predictions', { type: 'today' });
    const livePredictions = await cacheService.getCache('predictions', { type: 'live' });
    
    console.log('   - Today predictions:', todayPredictions ? 'encontrado' : 'não encontrado');
    console.log('   - Live predictions:', livePredictions ? 'encontrado' : 'não encontrado');
    console.log('');

    // Teste 4: Verificar estatísticas do cache
    console.log('📊 Teste 4: Verificando estatísticas do cache...');
    const stats = await cacheService.getCacheStats();
    const size = await cacheService.getCacheSize();
    console.log('   - Total de entradas:', size);
    console.log('   - Estatísticas por endpoint:', stats.length);
    stats.forEach(stat => {
      console.log(`     * ${stat.endpoint}: ${stat.total_entries} entradas, ${stat.total_accesses} acessos`);
    });
    console.log('');

    // Teste 5: Testar TTL (Time To Live)
    console.log('⏰ Teste 5: Testando TTL...');
    await cacheService.setCache('short-lived', { type: 'test' }, {
      data: 'expire soon',
      timestamp: new Date().toISOString()
    }, 1000); // 1 segundo

    console.log('   - Aguardando 2 segundos para TTL expirar...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const expiredData = await cacheService.getCache('short-lived', { type: 'test' });
    console.log('   - Dados expirados:', expiredData ? 'ainda existe' : 'expirado corretamente');
    console.log('');

    console.log('🎉 Todos os testes do CacheService concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar os testes
testCacheService();
