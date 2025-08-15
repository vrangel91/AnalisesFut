const axios = require('axios');
const { liveGamesTestData } = require('./test-live-games-data');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

async function insertTestDataDirect() {
  console.log('🔧 Inserindo dados de teste diretamente...\n');

  try {
    // Primeiro, vamos verificar os dados atuais
    console.log('📊 Verificando dados atuais...');
    
    const todayResponse = await axios.get(`${API_BASE_URL}/api/predictions/today?refresh=true`);
    console.log('Predições de hoje:', todayResponse.data.data?.length || 0);

    // Vamos modificar alguns jogos existentes para simular jogos ao vivo
    if (todayResponse.data.data && todayResponse.data.data.length > 0) {
      console.log('\n📊 Modificando jogos existentes para simular jogos ao vivo...');
      
      // Pegar os primeiros 3 jogos e modificar para status ao vivo
      const gamesToModify = todayResponse.data.data.slice(0, 3);
      
      gamesToModify.forEach((game, index) => {
        console.log(`Modificando jogo ${index + 1}: ${game.fixture.teams.home.name} vs ${game.fixture.teams.away.name}`);
        
        // Modificar status para ao vivo
        if (game.fixture.fixture) {
          const statuses = ['1H', '2H', 'HT'];
          const elapsed = [25, 67, 45];
          
          game.fixture.fixture.status = {
            short: statuses[index],
            long: statuses[index] === '1H' ? 'First Half' : statuses[index] === '2H' ? 'Second Half' : 'Half Time',
            elapsed: elapsed[index]
          };
          
          // Adicionar gols para alguns jogos
          if (index === 0) {
            game.fixture.goals = { home: 1, away: 0 };
          } else if (index === 1) {
            game.fixture.goals = { home: 2, away: 1 };
          } else {
            game.fixture.goals = { home: 0, away: 0 };
          }
          
          console.log(`✅ Jogo ${index + 1} modificado:`, {
            status: game.fixture.fixture.status.short,
            elapsed: game.fixture.fixture.status.elapsed,
            goals: game.fixture.goals
          });
        }
      });
      
      // Agora vamos criar dados de teste completos baseados nos dados existentes
      console.log('\n📊 Criando dados de teste completos...');
      
      const testLiveGames = liveGamesTestData.map((testGame, index) => {
        // Usar dados reais dos jogos existentes se disponível
        const existingGame = gamesToModify[index];
        
        return {
          fixture: {
            fixture: {
              id: testGame.fixture.fixture.id,
              date: new Date().toISOString(),
              timestamp: Math.floor(Date.now() / 1000),
              status: testGame.fixture.fixture.status,
              venue: testGame.fixture.fixture.venue
            },
            teams: testGame.fixture.teams,
            league: testGame.fixture.league,
            goals: testGame.fixture.goals
          },
          prediction: testGame.prediction,
          confidence: testGame.confidence,
          riskLevel: testGame.riskLevel,
          analysis: testGame.analysis
        };
      });
      
      console.log('✅ Dados de teste criados:', testLiveGames.length);
      
      // Agora vamos simular que esses dados são retornados pela API
      console.log('\n📊 Simulando resposta da API com jogos ao vivo...');
      
      // Criar um arquivo temporário com os dados modificados
      const fs = require('fs');
      const testDataPath = './temp-live-games-data.json';
      
      fs.writeFileSync(testDataPath, JSON.stringify({
        success: true,
        data: testLiveGames,
        fromCache: false,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log(`✅ Dados salvos em: ${testDataPath}`);
      
      // Mostrar os dados criados
      console.log('\n📊 Dados de jogos ao vivo criados:');
      testLiveGames.forEach((game, index) => {
        console.log(`Jogo ${index + 1}:`, {
          id: game.fixture.fixture.id,
          status: game.fixture.fixture.status.short,
          elapsed: game.fixture.fixture.status.elapsed,
          home: game.fixture.teams.home.name,
          away: game.fixture.teams.away.name,
          league: game.fixture.league.name,
          goals: game.fixture.goals,
          confidence: game.confidence,
          riskLevel: game.riskLevel
        });
      });
      
      console.log('\n🎯 Para usar esses dados no frontend:');
      console.log('1. Copie o conteúdo do arquivo temp-live-games-data.json');
      console.log('2. Modifique o estado livePredictions no frontend');
      console.log('3. Ou modifique o cache do backend para incluir esses dados');
      
    } else {
      console.log('❌ Nenhum jogo encontrado para modificar');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar inserção
insertTestDataDirect();
