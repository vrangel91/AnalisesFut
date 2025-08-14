require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('�� Debug da Estrutura da API-Sports Predictions...\n');

async function debugPredictionsStructure() {
  try {
    console.log('📡 Buscando fixtures de hoje...');
    
    // Buscar fixtures de hoje
    const fixturesResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/fixtures`, {
      params: { 
        date: new Date().toISOString().split('T')[0],
        status: 'NS-LIVE-FT'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_SPORTS_KEY
      }
    });

    if (fixturesResponse.data.response && fixturesResponse.data.response.length > 0) {
      const firstFixture = fixturesResponse.data.response[0];
      const fixtureId = firstFixture.fixture.id;
      
      console.log(`✅ Fixture encontrada: ${fixtureId}`);
      console.log(`Times: ${firstFixture.teams.home.name} vs ${firstFixture.teams.away.name}`);
      
      console.log('\n📡 Buscando predições para esta fixture...');
      
      // Buscar predições
      const predictionsResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/predictions`, {
        params: { fixture: fixtureId },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': process.env.API_SPORTS_KEY
        }
      });

      if (predictionsResponse.data.response && predictionsResponse.data.response.length > 0) {
        const predictionData = predictionsResponse.data.response[0];
        
        console.log('✅ Predição encontrada!');
        console.log('\n📋 Estrutura completa da predição:');
        console.log('Keys da predição:', Object.keys(predictionData));
        
        console.log('\n🔍 Verificando campos específicos:');
        console.log('fixture existe:', !!predictionData.fixture);
        console.log('fixture keys:', predictionData.fixture ? Object.keys(predictionData.fixture) : 'N/A');
        console.log('fixture.id:', predictionData.fixture?.id);
        console.log('fixture.date:', predictionData.fixture?.date);
        
        console.log('\n🔍 Verificando outros campos que podem conter o ID:');
        console.log('league existe:', !!predictionData.league);
        console.log('teams existe:', !!predictionData.teams);
        console.log('predictions existe:', !!predictionData.predictions);
        console.log('comparison existe:', !!predictionData.comparison);
        
        // Mostrar estrutura completa
        console.log('\n📋 Estrutura completa (JSON):');
        console.log(JSON.stringify(predictionData, null, 2));
        
        console.log('\n🎯 CONCLUSÃO:');
        console.log('O fixture ID deve ser obtido do parâmetro da requisição, não da resposta!');
        console.log(`Fixture ID usado na requisição: ${fixtureId}`);
        
      } else {
        console.log('❌ Nenhuma predição encontrada para esta fixture');
      }
    } else {
      console.log('❌ Nenhuma fixture encontrada para hoje');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar debug
debugPredictionsStructure();
