require('dotenv').config({ path: './config.env' });
const axios = require('axios');
const predictionsService = require('./src/services/predictionsService');

console.log('🔍 Debug do Pipeline do Fixture ID...\n');

async function debugFixtureIdPipeline() {
  try {
    console.log('📡 PASSO 1: Buscando dados diretamente da API-Sports...');
    
    // Buscar fixtures de hoje diretamente da API-Sports
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
      const rawFixtureId = firstFixture.fixture.id;
      
      console.log(`✅ Fixture encontrada na API-Sports:`);
      console.log(`   ID: ${rawFixtureId} (tipo: ${typeof rawFixtureId})`);
      console.log(`   Times: ${firstFixture.teams.home.name} vs ${firstFixture.teams.away.name}`);
      console.log(`   É numérico: ${!isNaN(rawFixtureId)}`);
      
      if (!isNaN(rawFixtureId)) {
        console.log('\n📡 PASSO 2: Testando predictions endpoint da API-Sports...');
        
        // Buscar predições para esta fixture
        const predictionsResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/predictions`, {
          params: { fixture: rawFixtureId },
          headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_SPORTS_KEY
          }
        });

        if (predictionsResponse.data.response && predictionsResponse.data.response.length > 0) {
          const predictionData = predictionsResponse.data.response[0];
          console.log(`✅ Predição encontrada na API-Sports:`);
          console.log(`   Fixture ID na predição: ${predictionData.fixture?.id} (tipo: ${typeof predictionData.fixture?.id})`);
          console.log(`   É numérico: ${!isNaN(predictionData.fixture?.id)}`);
          
          console.log('\n📡 PASSO 3: Testando predictionsService diretamente...');
          
          // Testar o serviço diretamente
          const serviceResult = await predictionsService.getFixturePredictions(rawFixtureId, true);
          
          if (serviceResult.success && serviceResult.data) {
            console.log(`✅ Serviço retornou dados:`);
            console.log(`   Fixture ID no serviço: ${serviceResult.data.fixture?.fixture?.id} (tipo: ${typeof serviceResult.data.fixture?.fixture?.id})`);
            console.log(`   É numérico: ${!isNaN(serviceResult.data.fixture?.fixture?.id)}`);
            
            console.log('\n📡 PASSO 4: Testando rota /api/predictions/today...');
            
            // Testar a rota completa
            const apiResponse = await axios.get('http://localhost:3001/api/predictions/today?refresh=true');
            
            if (apiResponse.data.success && apiResponse.data.data && apiResponse.data.data.length > 0) {
              console.log(`✅ API retornou ${apiResponse.data.data.length} predições`);
              
              // Procurar pela fixture específica
              const matchingPrediction = apiResponse.data.data.find(p => 
                p.fixture?.teams?.home?.name === firstFixture.teams.home.name &&
                p.fixture?.teams?.away?.name === firstFixture.teams.away.name
              );
              
              if (matchingPrediction) {
                const frontendFixtureId = matchingPrediction.fixture?.fixture?.id;
                console.log(`✅ Fixture encontrada no frontend:`);
                console.log(`   ID: ${frontendFixtureId} (tipo: ${typeof frontendFixtureId})`);
                console.log(`   É numérico: ${!isNaN(frontendFixtureId)}`);
                console.log(`   Times: ${matchingPrediction.fixture.teams.home.name} vs ${matchingPrediction.fixture.teams.away.name}`);
                
                console.log('\n📡 PASSO 5: Testando análise avançada...');
                
                // Testar análise avançada
                const advancedResponse = await axios.get(`http://localhost:3001/api/predictions/advanced/${frontendFixtureId}?refresh=true`);
                
                if (advancedResponse.data.success) {
                  console.log('✅ Análise avançada funcionando!');
                } else {
                  console.log('❌ Erro na análise avançada:', advancedResponse.data.error);
                }
                
                console.log('\n🎯 RESUMO DO PIPELINE:');
                console.log(`1. API-Sports (fixtures): ${rawFixtureId} (${typeof rawFixtureId})`);
                console.log(`2. API-Sports (predictions): ${predictionData.fixture?.id} (${typeof predictionData.fixture?.id})`);
                console.log(`3. predictionsService: ${serviceResult.data.fixture?.fixture?.id} (${typeof serviceResult.data.fixture?.fixture?.id})`);
                console.log(`4. Frontend API: ${frontendFixtureId} (${typeof frontendFixtureId})`);
                
                if (typeof frontendFixtureId === 'string') {
                  console.log('\n❌ PROBLEMA IDENTIFICADO:');
                  console.log('O ID está sendo convertido para string em algum ponto do pipeline!');
                } else {
                  console.log('\n✅ SUCESSO:');
                  console.log('O ID permanece numérico em todo o pipeline!');
                }
                
              } else {
                console.log('❌ Fixture não encontrada no frontend');
              }
            } else {
              console.log('❌ API não retornou dados');
            }
          } else {
            console.log('❌ Serviço não retornou dados:', serviceResult.error);
          }
        } else {
          console.log('❌ Nenhuma predição encontrada para esta fixture');
        }
      } else {
        console.log('❌ Fixture ID não é numérico na API-Sports');
      }
    } else {
      console.log('❌ Nenhuma fixture encontrada para hoje');
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar debug
debugFixtureIdPipeline();
