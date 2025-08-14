require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🔍 Debug dos IDs das Fixtures...\n');

async function debugFixtureIds() {
  try {
    console.log('📡 Buscando fixtures de hoje...');
    
    // Buscar fixtures de hoje diretamente da API
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
      console.log(`✅ Encontradas ${fixturesResponse.data.response.length} fixtures`);
      
      // Mostrar os primeiros 3 fixtures
      fixturesResponse.data.response.slice(0, 3).forEach((fixture, index) => {
        console.log(`\n📋 Fixture ${index + 1}:`);
        console.log(`   ID: ${fixture.fixture.id} (tipo: ${typeof fixture.fixture.id})`);
        console.log(`   Times: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
        console.log(`   Liga: ${fixture.league.name}`);
        console.log(`   Data: ${fixture.fixture.date}`);
        console.log(`   Status: ${fixture.fixture.status.short}`);
      });
      
      // Testar se o ID é numérico
      const firstFixture = fixturesResponse.data.response[0];
      const fixtureId = firstFixture.fixture.id;
      
      console.log(`\n🔍 Testando ID da primeira fixture: ${fixtureId}`);
      console.log(`   Tipo: ${typeof fixtureId}`);
      console.log(`   É número: ${!isNaN(fixtureId)}`);
      console.log(`   É inteiro: ${Number.isInteger(Number(fixtureId))}`);
      
      if (!isNaN(fixtureId) && Number.isInteger(Number(fixtureId))) {
        console.log('✅ ID é numérico - pode ser usado na análise avançada');
        
        // Testar análise avançada
        console.log(`\n🔍 Testando análise avançada para ID ${fixtureId}...`);
        const advancedResponse = await axios.get(`http://localhost:3001/api/predictions/advanced/${fixtureId}?refresh=true`);
        
        if (advancedResponse.data.success) {
          console.log('✅ Análise avançada funcionando com ID numérico!');
        } else {
          console.log('❌ Erro na análise avançada:', advancedResponse.data.error);
        }
      } else {
        console.log('❌ ID não é numérico - problema na API');
      }
      
    } else {
      console.log('⚠️ Nenhuma fixture encontrada para hoje');
    }
    
  } catch (error) {
    console.error('❌ Erro ao debug:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar debug
debugFixtureIds();
