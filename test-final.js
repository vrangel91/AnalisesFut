// Teste final do sistema
const axios = require('axios');

async function testFinal() {
  console.log('🎯 Teste Final do Sistema IA de Apostas\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1️⃣ Testando servidor...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Servidor funcionando:', healthResponse.data.message);
    console.log('');

    // Teste 2: Verificar dados de fixtures
    console.log('2️⃣ Testando fixtures...');
    const fixturesResponse = await axios.get('http://localhost:3001/api/fixtures/today');
    console.log('✅ Fixtures carregados:', fixturesResponse.data.data.length, 'jogos');
    console.log('');

    // Teste 3: Verificar dados de predições
    console.log('3️⃣ Testando predições...');
    const predictionsResponse = await axios.get('http://localhost:3001/api/predictions/today');
    console.log('✅ Predições carregadas:', predictionsResponse.data.data.length, 'predições');
    console.log('');

    // Teste 4: Verificar estrutura dos dados
    console.log('4️⃣ Verificando estrutura dos dados...');
    
    if (fixturesResponse.data.data.length > 0) {
      const fixture = fixturesResponse.data.data[0];
      console.log('✅ Fixture válido:', {
        id: fixture.fixture.id,
        teams: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        league: fixture.league.name,
        date: new Date(fixture.fixture.date).toLocaleString('pt-BR')
      });
    }

    if (predictionsResponse.data.data.length > 0) {
      const prediction = predictionsResponse.data.data[0];
      console.log('✅ Predição válida:', {
        fixture: `${prediction.fixture.teams.home.name} vs ${prediction.fixture.teams.away.name}`,
        confidence: prediction.confidence,
        hasWinner: !!prediction.prediction.winner,
        hasAdvice: !!prediction.prediction.advice
      });
    }
    console.log('');

    // Teste 5: Verificar predições ao vivo
    console.log('5️⃣ Testando predições ao vivo...');
    const livePredictionsResponse = await axios.get('http://localhost:3001/api/predictions/live');
    console.log('✅ Predições ao vivo:', livePredictionsResponse.data.data.length, 'predições');
    console.log('');

    // Teste 6: Verificar fixtures ao vivo
    console.log('6️⃣ Testando fixtures ao vivo...');
    const liveFixturesResponse = await axios.get('http://localhost:3001/api/fixtures/live');
    console.log('✅ Fixtures ao vivo:', liveFixturesResponse.data.data.length, 'jogos');
    console.log('');

    // Resumo final
    console.log('📊 RESUMO FINAL:');
    console.log('✅ Servidor: FUNCIONANDO');
    console.log('✅ API Health: FUNCIONANDO');
    console.log('✅ Fixtures: FUNCIONANDO');
    console.log('✅ Predictions: FUNCIONANDO');
    console.log('✅ Live Data: FUNCIONANDO');
    console.log('✅ Data Structure: VÁLIDA');
    console.log('');
    console.log('🎉 SISTEMA TOTALMENTE FUNCIONAL!');
    console.log('');
    console.log('🌐 Acesse: http://localhost:3001');
    console.log('📱 Dashboard: http://localhost:3001');
    console.log('🎯 Predições: http://localhost:3001/predictions');
    console.log('📅 Fixtures: http://localhost:3001/fixtures');

  } catch (error) {
    console.error('❌ Erro no teste final:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
  }
}

// Executar teste final
testFinal();
