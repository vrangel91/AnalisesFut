const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

async function testUpcomingFixtures() {
  console.log('🔍 Testando fixtures upcoming...\n');

  try {
    // Teste 1: Fixtures upcoming
    console.log('📊 Teste 1: Fixtures upcoming');
    const upcomingFixturesResponse = await axios.get(`${API_BASE_URL}/api/fixtures/upcoming?refresh=true`);
    console.log('Status:', upcomingFixturesResponse.status);
    console.log('Dados recebidos:', {
      success: upcomingFixturesResponse.data.success,
      dataLength: upcomingFixturesResponse.data.data ? 'Object' : 'No data',
      fromCache: upcomingFixturesResponse.data.fromCache,
      timestamp: upcomingFixturesResponse.data.timestamp
    });

    if (upcomingFixturesResponse.data.data) {
      console.log('✅ Estrutura dos dados:', Object.keys(upcomingFixturesResponse.data.data));
      
      const todayFixtures = upcomingFixturesResponse.data.data.today?.fixtures || [];
      const tomorrowFixtures = upcomingFixturesResponse.data.data.tomorrow?.fixtures || [];
      
      console.log('📊 Fixtures encontradas:', {
        today: todayFixtures.length,
        tomorrow: tomorrowFixtures.length,
        total: todayFixtures.length + tomorrowFixtures.length
      });

      if (todayFixtures.length > 0) {
        console.log('\n📊 Primeiros 3 jogos de hoje:');
        todayFixtures.slice(0, 3).forEach((fixture, index) => {
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

      if (tomorrowFixtures.length > 0) {
        console.log('\n📊 Primeiros 3 jogos de amanhã:');
        tomorrowFixtures.slice(0, 3).forEach((fixture, index) => {
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
      console.log('❌ Nenhuma fixture upcoming encontrada');
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
testUpcomingFixtures();
