const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

async function testPredictionsLive() {
  console.log('🔍 Testando se Predictions.js agora carrega jogos ao vivo...\n');

  try {
    // Teste 1: Verificar fixtures ao vivo (que o Dashboard usa)
    console.log('📊 Teste 1: Fixtures ao vivo (Dashboard)');
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

    // Teste 2: Verificar predições ao vivo (que o Predictions usava antes)
    console.log('📊 Teste 2: Predições ao vivo (Predictions antigo)');
    const livePredictionsResponse = await axios.get(`${API_BASE_URL}/api/predictions/live?refresh=true`);
    console.log('Status:', livePredictionsResponse.status);
    console.log('Dados recebidos:', {
      success: livePredictionsResponse.data.success,
      dataLength: livePredictionsResponse.data.data?.length || 0,
      fromCache: livePredictionsResponse.data.fromCache,
      timestamp: livePredictionsResponse.data.timestamp
    });

    if (livePredictionsResponse.data.data && livePredictionsResponse.data.data.length > 0) {
      console.log('✅ Predições ao vivo encontradas:', livePredictionsResponse.data.data.length);
      console.log('Primeira predição:', {
        id: livePredictionsResponse.data.data[0]?.fixture?.fixture?.id,
        status: livePredictionsResponse.data.data[0]?.fixture?.fixture?.status?.short,
        home: livePredictionsResponse.data.data[0]?.fixture?.teams?.home?.name,
        away: livePredictionsResponse.data.data[0]?.fixture?.teams?.away?.name,
        league: livePredictionsResponse.data.data[0]?.fixture?.league?.name
      });
    } else {
      console.log('❌ Nenhuma predição ao vivo encontrada');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 3: Simular o que o Predictions.js agora faz
    console.log('📊 Teste 3: Simulando nova lógica do Predictions.js');
    
    const [livePredictionsData, liveFixturesData] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/predictions/live?refresh=true`),
      axios.get(`${API_BASE_URL}/api/fixtures/live?refresh=true`)
    ]);

    const predictions = livePredictionsData.data.data || [];
    const fixtures = liveFixturesData.data.data || [];

    console.log('Dados separados:', {
      predictions: predictions.length,
      fixtures: fixtures.length
    });

    // Combinar dados como o Predictions.js agora faz
    let combinedLiveData = [...predictions];
    
    if (predictions.length === 0 && fixtures.length > 0) {
      console.log('🔄 Convertendo fixtures ao vivo em predições...');
      
      const fixturesAsPredictions = fixtures.map(fixture => {
        return {
          fixture: {
            fixture: fixture.fixture || fixture,
            teams: fixture.teams,
            league: fixture.league,
            goals: fixture.goals
          },
          prediction: {
            winner: {
              id: fixture.teams?.home?.id,
              name: fixture.teams?.home?.name,
              comment: 'Jogo ao vivo'
            },
            percent: {
              home: '50%',
              draw: '30%',
              away: '20%'
            },
            under_over: 'Over 2.5',
            advice: 'Jogo em andamento'
          },
          confidence: 'média',
          riskLevel: 'alto',
          analysis: {
            advancedScore: 0.5,
            homeForm: 'N/A',
            awayForm: 'N/A',
            h2h: {
              total: 0,
              homeWins: 0,
              awayWins: 0,
              draws: 0
            }
          }
        };
      });
      
      combinedLiveData = fixturesAsPredictions;
      console.log('✅ Fixtures convertidas em predições:', fixturesAsPredictions.length);
    }

    console.log('📊 Resultado final:', {
      combined: combinedLiveData.length,
      hasData: combinedLiveData.length > 0
    });

    if (combinedLiveData.length > 0) {
      console.log('✅ Predictions.js agora deve mostrar jogos ao vivo!');
      console.log('Primeiro jogo:', {
        id: combinedLiveData[0]?.fixture?.fixture?.id,
        status: combinedLiveData[0]?.fixture?.fixture?.status?.short,
        home: combinedLiveData[0]?.fixture?.teams?.home?.name,
        away: combinedLiveData[0]?.fixture?.teams?.away?.name,
        league: combinedLiveData[0]?.fixture?.league?.name,
        confidence: combinedLiveData[0]?.confidence,
        riskLevel: combinedLiveData[0]?.riskLevel
      });
    } else {
      console.log('❌ Ainda não há dados para mostrar');
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar teste
testPredictionsLive();
