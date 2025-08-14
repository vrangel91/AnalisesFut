require('dotenv').config({ path: './config.env' });
const predictionsService = require('./src/services/predictionsService');

console.log('🔍 Debug do formatPredictionsForFrontend...\n');

async function debugFormatPredictions() {
  try {
    console.log('📡 Buscando uma fixture para testar...');
    
    // Buscar uma fixture específica
    const fixtureId = 1377445; // Fixture que sabemos que existe
    const result = await predictionsService.getFixturePredictions(fixtureId, true);
    
    if (result.success && result.data) {
      console.log('✅ Dados do predictionsService:');
      console.log(`   Fixture ID: ${result.data.fixture?.fixture?.id} (tipo: ${typeof result.data.fixture?.fixture?.id})`);
      console.log(`   É numérico: ${!isNaN(result.data.fixture?.fixture?.id)}`);
      
      // Simular o que o getMultipleFixturePredictions retorna
      const mockPredictions = {
        [fixtureId]: result
      };
      
      console.log('\n📋 Mock predictions (simulando getMultipleFixturePredictions):');
      console.log('Keys:', Object.keys(mockPredictions));
      console.log('Primeira chave:', Object.keys(mockPredictions)[0]);
      console.log('Tipo da primeira chave:', typeof Object.keys(mockPredictions)[0]);
      
      // Simular o formatPredictionsForFrontend
      console.log('\n🔍 Simulando formatPredictionsForFrontend...');
      
      const formatted = Object.entries(mockPredictions)
        .filter(([fixtureId, prediction]) => prediction.success && prediction.data)
        .map(([fixtureId, prediction]) => {
          const { data } = prediction;
          
          console.log(`🔍 Processando fixture ${fixtureId}:`);
          console.log(`   Tipo do fixtureId: ${typeof fixtureId}`);
          console.log(`   É numérico: ${!isNaN(fixtureId)}`);
          
          // O fixtureId já é um número (vem do getMultipleFixturePredictions)
          const numericFixtureId = Number(fixtureId);
          
          console.log(`   numericFixtureId: ${numericFixtureId} (tipo: ${typeof numericFixtureId})`);
          
          // Se não há fixture ID válido, pular esta predição
          if (!numericFixtureId || isNaN(numericFixtureId)) {
            console.warn('⚠️ Predição sem fixture ID válido:', fixtureId, data);
            return null;
          }
          
          const formattedPrediction = {
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
            analysis: data.analysis || {},
            comparison: data.comparison || {},
            teams: data.teams || {},
            predictions: data.predictions || {}
          };
          
          console.log(`   ID final: ${formattedPrediction.fixture.fixture.id} (tipo: ${typeof formattedPrediction.fixture.fixture.id})`);
          
          return formattedPrediction;
        })
        .filter(prediction => prediction !== null);
      
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

// Executar debug
debugFormatPredictions();
