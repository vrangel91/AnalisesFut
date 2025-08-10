const cacheService = require('./src/services/cacheService');

async function testCachedApiSimple() {
  console.log('🧪 Iniciando testes simples do CachedApiService...\n');

  try {
    // Teste 1: Simular primeira requisição (deve ir para API)
    console.log('📡 Teste 1: Simulando primeira requisição...');
    const startTime = Date.now();
    
    // Simular dados da API
    const mockApiData = {
      response: [
        { id: 1, name: 'Test Fixture 1' },
        { id: 2, name: 'Test Fixture 2' }
      ],
      results: 2
    };
    
    // Salvar no cache
    await cacheService.setCache('/fixtures', {}, mockApiData);
    
    const firstResponse = {
      ...mockApiData,
      _cached: false,
      _fromCache: false,
      _lastUpdate: new Date().toISOString(),
      _responseTime: Date.now() - startTime
    };
    
    console.log('   - FromCache:', firstResponse._fromCache);
    console.log('   - ResponseTime:', firstResponse._responseTime + 'ms');
    console.log('   - LastUpdate:', firstResponse._lastUpdate);
    console.log('   - Data length:', firstResponse.response.length);
    console.log('');

    // Teste 2: Simular segunda requisição (deve retornar do cache)
    console.log('📡 Teste 2: Simulando segunda requisição (cache)...');
    const startTime2 = Date.now();
    
    const cachedData = await cacheService.getCache('/fixtures', {});
    const secondResponse = {
      ...cachedData,
      _cached: true,
      _fromCache: true,
      _lastUpdate: cachedData._lastUpdate || new Date().toISOString(),
      _responseTime: Date.now() - startTime2
    };
    
    console.log('   - FromCache:', secondResponse._fromCache);
    console.log('   - ResponseTime:', secondResponse._responseTime + 'ms');
    console.log('   - LastUpdate:', secondResponse._lastUpdate);
    console.log('   - Data length:', secondResponse.response.length);
    console.log('');

    // Teste 3: Verificar se o cache está funcionando
    console.log('📡 Teste 3: Verificando funcionamento do cache...');
    console.log('   - Primeira requisição (API):', firstResponse._responseTime + 'ms');
    console.log('   - Segunda requisição (Cache):', secondResponse._responseTime + 'ms');
    console.log('   - Melhoria:', Math.round((firstResponse._responseTime - secondResponse._responseTime) / firstResponse._responseTime * 100) + '%');
    console.log('');

    // Teste 4: Testar diferentes endpoints
    console.log('📡 Teste 4: Testando diferentes endpoints...');
    
    // Simular dados de live fixtures
    const liveData = {
      response: [
        { id: 3, name: 'Live Fixture 1', status: 'live' },
        { id: 4, name: 'Live Fixture 2', status: 'live' }
      ],
      results: 2
    };
    
    await cacheService.setCache('/fixtures', { live: 'all' }, liveData);
    const liveCached = await cacheService.getCache('/fixtures', { live: 'all' });
    
    console.log('   - Live fixtures - FromCache:', liveCached ? 'sim' : 'não');
    console.log('   - Live fixtures - Data length:', liveCached ? liveCached.response.length : 0);
    
    // Simular dados de leagues
    const leaguesData = {
      response: [
        { id: 1, name: 'Premier League' },
        { id: 2, name: 'La Liga' }
      ],
      results: 2
    };
    
    await cacheService.setCache('/leagues', {}, leaguesData);
    const leaguesCached = await cacheService.getCache('/leagues', {});
    
    console.log('   - Leagues - FromCache:', leaguesCached ? 'sim' : 'não');
    console.log('   - Leagues - Data length:', leaguesCached ? leaguesCached.response.length : 0);
    console.log('');

    // Teste 5: Verificar estatísticas do cache
    console.log('📊 Teste 5: Verificando estatísticas do cache...');
    const stats = await cacheService.getCacheStats();
    const size = await cacheService.getCacheSize();
    
    console.log('   - Total de entradas:', size);
    console.log('   - Entradas por endpoint:', stats.length);
    stats.forEach(stat => {
      if (stat.endpoint.includes('/fixtures') || stat.endpoint.includes('/leagues')) {
        console.log(`     * ${stat.endpoint}: ${stat.total_entries} entradas`);
      }
    });
    console.log('');

    console.log('🎉 Testes simples do CachedApiService concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar os testes
testCachedApiSimple();
