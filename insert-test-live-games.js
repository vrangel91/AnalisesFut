const axios = require('axios');
const { liveGamesTestData, liveFixturesTestData } = require('./test-live-games-data');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

async function insertTestLiveGames() {
  console.log('🔧 Inserindo dados de teste para jogos ao vivo...\n');

  try {
    // Teste 1: Inserir predições ao vivo
    console.log('📊 Teste 1: Inserindo predições ao vivo');
    
    for (let i = 0; i < liveGamesTestData.length; i++) {
      const gameData = liveGamesTestData[i];
      console.log(`Inserindo jogo ${i + 1}: ${gameData.fixture.teams.home.name} vs ${gameData.fixture.teams.away.name}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/predictions/live`, {
          prediction: gameData
        });
        
        console.log(`✅ Jogo ${i + 1} inserido com sucesso:`, {
          status: response.status,
          success: response.data.success,
          message: response.data.message
        });
      } catch (error) {
        console.log(`❌ Erro ao inserir jogo ${i + 1}:`, error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Dados:', error.response.data);
        }
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: Inserir fixtures ao vivo
    console.log('📊 Teste 2: Inserindo fixtures ao vivo');
    
    for (let i = 0; i < liveFixturesTestData.length; i++) {
      const fixtureData = liveFixturesTestData[i];
      console.log(`Inserindo fixture ${i + 1}: ${fixtureData.teams.home.name} vs ${fixtureData.teams.away.name}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/fixtures/live`, {
          fixture: fixtureData
        });
        
        console.log(`✅ Fixture ${i + 1} inserida com sucesso:`, {
          status: response.status,
          success: response.data.success,
          message: response.data.message
        });
      } catch (error) {
        console.log(`❌ Erro ao inserir fixture ${i + 1}:`, error.message);
        if (error.response) {
          console.log('Status:', error.response.status);
          console.log('Dados:', error.response.data);
        }
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 3: Verificar se os dados foram inseridos
    console.log('📊 Teste 3: Verificando dados inseridos');
    
    try {
      const livePredictionsResponse = await axios.get(`${API_BASE_URL}/api/predictions/live?refresh=true`);
      console.log('Predições ao vivo após inserção:', {
        success: livePredictionsResponse.data.success,
        dataLength: livePredictionsResponse.data.data?.length || 0
      });
      
      if (livePredictionsResponse.data.data && livePredictionsResponse.data.data.length > 0) {
        console.log('✅ Dados de predições ao vivo encontrados:', livePredictionsResponse.data.data.length);
        livePredictionsResponse.data.data.forEach((prediction, index) => {
          console.log(`Jogo ${index + 1}:`, {
            id: prediction?.fixture?.fixture?.id,
            status: prediction?.fixture?.fixture?.status?.short,
            home: prediction?.fixture?.teams?.home?.name,
            away: prediction?.fixture?.teams?.away?.name,
            league: prediction?.fixture?.league?.name
          });
        });
      } else {
        console.log('❌ Nenhuma predição ao vivo encontrada após inserção');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar predições ao vivo:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 4: Verificar fixtures ao vivo
    console.log('📊 Teste 4: Verificando fixtures ao vivo');
    
    try {
      const liveFixturesResponse = await axios.get(`${API_BASE_URL}/api/fixtures/live?refresh=true`);
      console.log('Fixtures ao vivo após inserção:', {
        success: liveFixturesResponse.data.success,
        dataLength: liveFixturesResponse.data.data?.length || 0
      });
      
      if (liveFixturesResponse.data.data && liveFixturesResponse.data.data.length > 0) {
        console.log('✅ Dados de fixtures ao vivo encontrados:', liveFixturesResponse.data.data.length);
        liveFixturesResponse.data.data.forEach((fixture, index) => {
          console.log(`Fixture ${index + 1}:`, {
            id: fixture?.fixture?.id,
            status: fixture?.fixture?.status?.short,
            home: fixture?.teams?.home?.name,
            away: fixture?.teams?.away?.name,
            league: fixture?.league?.name
          });
        });
      } else {
        console.log('❌ Nenhuma fixture ao vivo encontrada após inserção');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar fixtures ao vivo:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar inserção
insertTestLiveGames();
