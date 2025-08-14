require('dotenv').config({ path: './config.env' });
const predictionsService = require('./src/services/predictionsService');

// Importar a função formatPredictionsForFrontend diretamente
const formatPredictionsForFrontend = (predictions) => {
  console.log('🔍 Debug formatPredictionsForFrontend:');
  console.log('   Tipo de predictions:', typeof predictions);
  console.log('   É array:', Array.isArray(predictions));
  console.log('   É objeto:', typeof predictions === 'object' && predictions !== null);
  console.log('   Keys:', Object.keys(predictions));
  
  if (Object.keys(predictions).length > 0) {
    const firstKey = Object.keys(predictions)[0];
    const firstPrediction = predictions[firstKey];
    console.log('   Primeira chave:', firstKey);
    console.log('   Tipo da primeira chave:', typeof firstKey);
    console.log('   Primeira predição success:', firstPrediction?.success);
    console.log('   Primeira predição data keys:', Object.keys(firstPrediction?.data || {}));
    console.log('   Fixture ID no data:', firstPrediction?.data?.fixture?.fixture?.id);
    console.log('   Tipo do Fixture ID no data:', typeof firstPrediction?.data?.fixture?.fixture?.id);
  }
  
  return Object.entries(predictions)
    .filter(([fixtureId, prediction]) => prediction.success && prediction.data)
    .map(([fixtureId, prediction]) => {
      const { data } = prediction;
      
      console.log(`🔍 Processando fixture ${fixtureId}:`);
      console.log('   Data keys:', Object.keys(data));
      console.log('   Data fixture:', data.fixture);
      
      // O fixtureId já é um número (vem do getMultipleFixturePredictions)
      const numericFixtureId = Number(fixtureId);
      
      // Se não há fixture ID válido, pular esta predição
      if (!numericFixtureId || isNaN(numericFixtureId)) {
        console.warn('⚠️ Predição sem fixture ID válido:', fixtureId, data);
        return null;
      }
      
      return {
        fixture: {
          fixture: {
            id: numericFixtureId, // Usar o ID numérico real da API
            date: data.fixture?.fixture?.date || new Date().toISOString(),
            status: data.fixture?.fixture?.status || 'NS'
          },
          teams: data.teams || {
            home: { name: 'Time Casa', id: 1 },
            away: { name: 'Time Visitante', id: 2 }
          },
          league: data.league || {
            name: 'Liga',
            id: 1,
            country: 'País'
          }
        },
        prediction: data.predictions || {},
        confidence: data.analysis?.confidence || 'Média',
        riskLevel: data.analysis?.riskLevel || 'Médio',
        recommendation: data.analysis?.recommendedBets?.[0] || null,
        analysis: data.analysis || {}, // 🚀 ADICIONADO: Incluir análise completa
        // 🚀 ADICIONADO: Incluir dados necessários para análise avançada
        comparison: data.comparison || {},
        teams: data.teams || {},
        predictions: data.predictions || {}
      };
    })
    .filter(prediction => prediction !== null); // Remover predições inválidas
};

console.log('🔍 Teste Direto do formatPredictionsForFrontend...\n');

async function testDirectFormat() {
  try {
    console.log('📡 Buscando uma fixture para testar...');
    
    // Buscar uma fixture específica
    const fixtureId = 1377445; // Fixture que sabemos que existe
    const result = await predictionsService.getFixturePredictions(fixtureId, true);
    
    if (result.success && result.data) {
      console.log('✅ Dados do predictionsService:');
      console.log(`   Fixture ID: ${result.data.fixture?.fixture?.id} (tipo: ${typeof result.data.fixture?.fixture?.id})`);
      
      // Simular o que o getMultipleFixturePredictions retorna
      const mockPredictions = {
        [fixtureId]: result
      };
      
      console.log('\n📋 Mock predictions:');
      console.log('Keys:', Object.keys(mockPredictions));
      console.log('Primeira chave:', Object.keys(mockPredictions)[0]);
      console.log('Tipo da primeira chave:', typeof Object.keys(mockPredictions)[0]);
      
      // Chamar formatPredictionsForFrontend diretamente
      console.log('\n🔍 Chamando formatPredictionsForFrontend...');
      const formatted = formatPredictionsForFrontend(mockPredictions);
      
      console.log('\n✅ Resultado final:');
      if (formatted.length > 0) {
        console.log(`   ID: ${formatted[0].fixture.fixture.id} (tipo: ${typeof formatted[0].fixture.fixture.id})`);
        console.log(`   Times: ${formatted[0].fixture.teams.home.name} vs ${formatted[0].fixture.teams.away.name}`);
      }
      
    } else {
      console.log('❌ Erro no predictionsService:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar teste
testDirectFormat();
