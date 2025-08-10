const axios = require('axios');

// Teste das APIs
async function testAPIs() {
  console.log('🧪 Iniciando testes da API...\n');

  try {
    // Teste 1: Fixtures de hoje
    console.log('📅 Testando /api/fixtures/today');
    const fixturesResponse = await axios.get('http://localhost:3001/api/fixtures/today');
    console.log('✅ Status:', fixturesResponse.status);
    console.log('📊 Data structure:', {
      success: fixturesResponse.data.success,
      dataLength: fixturesResponse.data.data?.length || 0,
      hasData: !!fixturesResponse.data.data,
      dataType: Array.isArray(fixturesResponse.data.data) ? 'Array' : typeof fixturesResponse.data.data
    });
    
    if (fixturesResponse.data.data && fixturesResponse.data.data.length > 0) {
      console.log('🔍 Primeiro fixture:', {
        id: fixturesResponse.data.data[0]?.fixture?.id,
        hasTeams: !!fixturesResponse.data.data[0]?.teams,
        hasLeague: !!fixturesResponse.data.data[0]?.league,
        hasFixture: !!fixturesResponse.data.data[0]?.fixture
      });
    }
    console.log('');

    // Teste 2: Fixtures ao vivo
    console.log('🔥 Testando /api/fixtures/live');
    const liveResponse = await axios.get('http://localhost:3001/api/fixtures/live');
    console.log('✅ Status:', liveResponse.status);
    console.log('📊 Data structure:', {
      success: liveResponse.data.success,
      dataLength: liveResponse.data.data?.length || 0,
      hasData: !!liveResponse.data.data,
      dataType: Array.isArray(liveResponse.data.data) ? 'Array' : typeof liveResponse.data.data
    });
    console.log('');

    // Teste 3: Predições de hoje
    console.log('🎯 Testando /api/predictions/today');
    const predictionsResponse = await axios.get('http://localhost:3001/api/predictions/today');
    console.log('✅ Status:', predictionsResponse.status);
    console.log('📊 Data structure:', {
      success: predictionsResponse.data.success,
      dataLength: predictionsResponse.data.data?.length || 0,
      hasData: !!predictionsResponse.data.data,
      dataType: Array.isArray(predictionsResponse.data.data) ? 'Array' : typeof predictionsResponse.data.data
    });
    
    if (predictionsResponse.data.data && predictionsResponse.data.data.length > 0) {
      console.log('🔍 Primeira predição:', {
        hasFixture: !!predictionsResponse.data.data[0]?.fixture,
        hasPrediction: !!predictionsResponse.data.data[0]?.prediction,
        hasConfidence: !!predictionsResponse.data.data[0]?.confidence,
        hasRecommendation: !!predictionsResponse.data.data[0]?.recommendation
      });
    }
    console.log('');

    // Teste 4: Predições ao vivo
    console.log('⚡ Testando /api/predictions/live');
    const livePredictionsResponse = await axios.get('http://localhost:3001/api/predictions/live');
    console.log('✅ Status:', livePredictionsResponse.status);
    console.log('📊 Data structure:', {
      success: livePredictionsResponse.data.success,
      dataLength: livePredictionsResponse.data.data?.length || 0,
      hasData: !!livePredictionsResponse.data.data,
      dataType: Array.isArray(livePredictionsResponse.data.data) ? 'Array' : typeof livePredictionsResponse.data.data
    });
    console.log('');

    // Teste 5: Health check
    console.log('🏥 Testando /api/health');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Status:', healthResponse.status);
    console.log('📊 Response:', healthResponse.data);
    console.log('');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    if (error.response) {
      console.error('📊 Response data:', error.response.data);
      console.error('📊 Response status:', error.response.status);
    }
  }
}

// Executar testes
testAPIs();
