const cachedApiService = require('./src/services/cachedApiService');

async function testCachedApiService() {
  console.log('🧪 Iniciando testes do CachedApiService...\n');

  try {
    // Teste 1: Fazer primeira requisição (deve ir para API)
    console.log('📡 Teste 1: Primeira requisição (deve ir para API)...');
    const firstResponse = await cachedApiService.getFixtures();
    
    console.log('   - FromCache:', firstResponse._fromCache);
    console.log('   - ResponseTime:', firstResponse._responseTime + 'ms');
    console.log('   - LastUpdate:', firstResponse._lastUpdate);
    console.log('   - Data length:', firstResponse.response ? firstResponse.response.length : 0);
    console.log('');

    // Teste 2: Fazer segunda requisição (deve retornar do cache)
    console.log('📡 Teste 2: Segunda requisição (deve retornar do cache)...');
    const secondResponse = await cachedApiService.getFixtures();
    
    console.log('   - FromCache:', secondResponse._fromCache);
    console.log('   - ResponseTime:', secondResponse._responseTime + 'ms');
    console.log('   - LastUpdate:', secondResponse._lastUpdate);
    console.log('   - Data length:', secondResponse.response ? secondResponse.response.length : 0);
    console.log('');

    // Teste 3: Testar diferentes endpoints
    console.log('📡 Teste 3: Testando diferentes endpoints...');
    
    const liveResponse = await cachedApiService.getLiveFixtures();
    console.log('   - Live fixtures - FromCache:', liveResponse._fromCache);
    console.log('   - Live fixtures - ResponseTime:', liveResponse._responseTime + 'ms');
    
    const leaguesResponse = await cachedApiService.getLeagues();
    console.log('   - Leagues - FromCache:', leaguesResponse._fromCache);
    console.log('   - Leagues - ResponseTime:', leaguesResponse._responseTime + 'ms');
    console.log('');

    // Teste 4: Verificar se o cache está funcionando corretamente
    console.log('📡 Teste 4: Verificando cache funcionando...');
    const thirdResponse = await cachedApiService.getFixtures();
    
    console.log('   - FromCache:', thirdResponse._fromCache);
    console.log('   - ResponseTime:', thirdResponse._responseTime + 'ms');
    console.log('   - Deve ser mais rápido que a primeira requisição');
    console.log('');

    // Teste 5: Testar com parâmetros diferentes
    console.log('📡 Teste 5: Testando com parâmetros diferentes...');
    const todayResponse = await cachedApiService.getFixtures();
    const liveResponse2 = await cachedApiService.getLiveFixtures();
    
    console.log('   - Today fixtures - FromCache:', todayResponse._fromCache);
    console.log('   - Live fixtures - FromCache:', liveResponse2._fromCache);
    console.log('   - São caches diferentes, então podem ter resultados diferentes');
    console.log('');

    console.log('🎉 Todos os testes do CachedApiService concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar os testes
testCachedApiService();
