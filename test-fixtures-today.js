const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

async function testFixturesToday() {
  console.log('🔍 Testando fixtures de hoje para encontrar jogos ao vivo...\n');

  try {
    // Teste 1: Fixtures de hoje
    console.log('📊 Teste 1: Fixtures de hoje');
    const todayFixturesResponse = await axios.get(`${API_BASE_URL}/api/fixtures/today?refresh=true`);
    console.log('Status:', todayFixturesResponse.status);
    console.log('Dados recebidos:', {
      success: todayFixturesResponse.data.success,
      dataLength: todayFixturesResponse.data.data?.length || 0,
      fromCache: todayFixturesResponse.data.fromCache,
      timestamp: todayFixturesResponse.data.timestamp
    });

    if (todayFixturesResponse.data.data && todayFixturesResponse.data.data.length > 0) {
      console.log('✅ Fixtures de hoje encontradas:', todayFixturesResponse.data.data.length);
      
      // Filtrar jogos ao vivo
      const liveGames = todayFixturesResponse.data.data.filter(fixture => {
        const status = fixture.status?.short;
        return status === '1H' || status === 'HT' || status === '2H' || status === 'ET' || status === 'P';
      });

      console.log('Jogos ao vivo nas fixtures de hoje:', liveGames.length);
      
      if (liveGames.length > 0) {
        console.log('✅ Jogos ao vivo encontrados nas fixtures de hoje:');
        liveGames.forEach((game, index) => {
          console.log(`Jogo ${index + 1}:`, {
            id: game.id,
            status: game.status?.short,
            elapsed: game.status?.elapsed,
            home: game.teams?.home?.name,
            away: game.teams?.away?.name,
            league: game.league?.name,
            goals: game.goals
          });
        });
      } else {
        console.log('❌ Nenhum jogo ao vivo encontrado nas fixtures de hoje');
        
        // Mostrar alguns jogos para debug
        console.log('\n📊 Primeiros 5 jogos de hoje:');
        todayFixturesResponse.data.data.slice(0, 5).forEach((fixture, index) => {
          console.log(`Jogo ${index + 1}:`, {
            id: fixture.id,
            status: fixture.status?.short,
            home: fixture.teams?.home?.name,
            away: fixture.teams?.away?.name,
            league: fixture.league?.name,
            date: fixture.date
          });
        });
      }
    } else {
      console.log('❌ Nenhuma fixture de hoje encontrada');
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
testFixturesToday();
