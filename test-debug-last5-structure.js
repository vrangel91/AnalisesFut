require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🔍 Debug da estrutura last5 - Múltiplas fixtures...\n');

async function debugLast5Structure() {
  try {
    // Testar múltiplas fixtures para encontrar uma com dados de last5
    const fixtureIds = [1035037, 1035038, 1035039, 1035040, 1035041];
    
    for (const fixtureId of fixtureIds) {
      console.log(`\n📡 Testando fixture ${fixtureId}...`);
      
      try {
        const response = await axios.get('https://v3.football.api-sports.io/predictions', {
          params: { fixture: fixtureId },
          headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_SPORTS_KEY
          }
        });

        if (response.data && response.data.response && response.data.response.length > 0) {
          const predictionData = response.data.response[0];
          
          console.log(`✅ Fixture ${fixtureId} encontrada`);
          console.log(`Times: ${predictionData.teams?.home?.name} vs ${predictionData.teams?.away?.name}`);
          
          // Verificar estrutura do last5
          const homeLast5 = predictionData.teams?.home?.last_5;
          const awayLast5 = predictionData.teams?.away?.last_5;
          
          console.log(`Home last_5 tipo: ${typeof homeLast5}`);
          console.log(`Away last_5 tipo: ${typeof awayLast5}`);
          
          if (homeLast5) {
            console.log(`Home last_5 keys: ${Object.keys(homeLast5).join(', ')}`);
            console.log(`Home last_5 played: ${homeLast5.played}`);
            console.log(`Home last_5 form: ${homeLast5.form}`);
          }
          
          if (awayLast5) {
            console.log(`Away last_5 keys: ${Object.keys(awayLast5).join(', ')}`);
            console.log(`Away last_5 played: ${awayLast5.played}`);
            console.log(`Away last_5 form: ${awayLast5.form}`);
          }
          
          // Verificar se há outros campos que possam conter os resultados
          console.log(`Home team keys: ${Object.keys(predictionData.teams?.home || {}).join(', ')}`);
          console.log(`Away team keys: ${Object.keys(predictionData.teams?.away || {}).join(', ')}`);
          
          // Se encontrou dados válidos, parar
          if (homeLast5?.played > 0 || awayLast5?.played > 0) {
            console.log(`\n🎯 Encontrada fixture com dados válidos: ${fixtureId}`);
            break;
          }
          
        } else {
          console.log(`❌ Fixture ${fixtureId} não encontrada`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao buscar fixture ${fixtureId}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
debugLast5Structure();
