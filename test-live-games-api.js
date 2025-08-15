const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

async function testLiveGamesAPI() {
  console.log('🔍 Testando API de jogos ao vivo...\n');

  try {
    // Teste 1: Predições ao vivo
    console.log('📊 Teste 1: Predições ao vivo');
    const livePredictionsResponse = await axios.get(`${API_BASE_URL}/api/predictions/live?refresh=true`);
    console.log('Status:', livePredictionsResponse.status);
    console.log('Dados recebidos:', {
      success: livePredictionsResponse.data.success,
      dataLength: livePredictionsResponse.data.data?.length || 0,
      fromCache: livePredictionsResponse.data.fromCache,
      timestamp: livePredictionsResponse.data.timestamp
    });

    if (livePredictionsResponse.data.data && livePredictionsResponse.data.data.length > 0) {
      console.log('✅ Jogos ao vivo encontrados:', livePredictionsResponse.data.data.length);
      console.log('Primeiro jogo:', {
        id: livePredictionsResponse.data.data[0]?.fixture?.fixture?.id,
        status: livePredictionsResponse.data.data[0]?.fixture?.fixture?.status?.short,
        home: livePredictionsResponse.data.data[0]?.fixture?.teams?.home?.name,
        away: livePredictionsResponse.data.data[0]?.fixture?.teams?.away?.name,
        league: livePredictionsResponse.data.data[0]?.fixture?.league?.name
      });
    } else {
      console.log('❌ Nenhum jogo ao vivo encontrado');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: Fixtures ao vivo
    console.log('📊 Teste 2: Fixtures ao vivo');
    const liveFixturesResponse = await axios.get(`${API_BASE_URL}/api/fixtures/live?refresh=true`);
    console.log('Status:', liveFixturesResponse.status);
    console.log('Dados recebidos:', {
      success: liveFixturesResponse.data.success,
      dataLength: liveFixturesResponse.data.data?.length || 0,
      fromCache: liveFixturesResponse.data.fromCache,
      timestamp: liveFixturesResponse.data.timestamp
    });

    if (liveFixturesResponse.data.data && liveFixturesResponse.data.data.length > 0) {
      console.log('✅ Fixtures ao vivo encontradas:', liveFixturesResponse.data.data.length);
      console.log('Primeira fixture:', {
        id: liveFixturesResponse.data.data[0]?.fixture?.id,
        status: liveFixturesResponse.data.data[0]?.fixture?.status?.short,
        home: liveFixturesResponse.data.data[0]?.teams?.home?.name,
        away: liveFixturesResponse.data.data[0]?.teams?.away?.name,
        league: liveFixturesResponse.data.data[0]?.league?.name
      });
    } else {
      console.log('❌ Nenhuma fixture ao vivo encontrada');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 3: Todas as predições (hoje)
    console.log('📊 Teste 3: Predições de hoje');
    const todayPredictionsResponse = await axios.get(`${API_BASE_URL}/api/predictions/today?refresh=true`);
    console.log('Status:', todayPredictionsResponse.status);
    console.log('Dados recebidos:', {
      success: todayPredictionsResponse.data.success,
      dataLength: todayPredictionsResponse.data.data?.length || 0,
      fromCache: todayPredictionsResponse.data.fromCache,
      timestamp: todayPredictionsResponse.data.timestamp
    });

    if (todayPredictionsResponse.data.data && todayPredictionsResponse.data.data.length > 0) {
      console.log('✅ Predições de hoje encontradas:', todayPredictionsResponse.data.data.length);
      
      // Filtrar jogos ao vivo
      const liveGames = todayPredictionsResponse.data.data.filter(prediction => {
        const status = prediction?.fixture?.fixture?.status?.short;
        return status === '1H' || status === 'HT' || status === '2H' || status === 'ET' || status === 'P';
      });

      console.log('Jogos ao vivo nas predições de hoje:', liveGames.length);
      
      if (liveGames.length > 0) {
        console.log('Primeiro jogo ao vivo:', {
          id: liveGames[0]?.fixture?.fixture?.id,
          status: liveGames[0]?.fixture?.fixture?.status?.short,
          home: liveGames[0]?.fixture?.teams?.home?.name,
          away: liveGames[0]?.fixture?.teams?.away?.name,
          league: liveGames[0]?.fixture?.league?.name
        });
      }
    } else {
      console.log('❌ Nenhuma predição de hoje encontrada');
    }

  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar teste
testLiveGamesAPI();
