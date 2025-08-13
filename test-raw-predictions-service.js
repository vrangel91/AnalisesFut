require('dotenv').config({ path: './config.env' });
const predictionsService = require('./src/services/predictionsService');

console.log('🔍 Debug do serviço de predições...\n');

async function debugPredictionsService() {
  try {
    console.log('📡 Testando getFixturePredictions diretamente...');
    
    // Testar com um fixture ID válido
    const fixtureId = 1035037;
    const result = await predictionsService.getFixturePredictions(fixtureId, true);
    
    console.log('📋 Resultado do serviço:');
    console.log('success:', result.success);
    console.log('fromCache:', result.fromCache);
    
    if (result.success && result.data) {
      console.log('\n🔍 Estrutura dos dados:');
      console.log('Keys dos dados:', Object.keys(result.data));
      
      console.log('\n📊 Dados detalhados:');
      console.log('predictions:', JSON.stringify(result.data.predictions, null, 2));
      console.log('league:', JSON.stringify(result.data.league, null, 2));
      console.log('teams:', JSON.stringify(result.data.teams, null, 2));
      console.log('comparison:', JSON.stringify(result.data.comparison, null, 2));
      console.log('h2h:', result.data.h2h ? `${result.data.h2h.length} jogos` : 'N/A');
      console.log('analysis:', JSON.stringify(result.data.analysis, null, 2));
      
      // Verificar se comparison existe e tem dados
      if (result.data.comparison) {
        console.log('\n🔍 Dados de comparação:');
        console.log('comparison keys:', Object.keys(result.data.comparison));
        console.log('form:', result.data.comparison.form);
        console.log('attack:', result.data.comparison.attack);
        console.log('defense:', result.data.comparison.defense);
        console.log('poisson_distribution:', result.data.comparison.poisson_distribution);
      } else {
        console.log('\n❌ Campo comparison não encontrado');
      }
      
    } else {
      console.log('❌ Erro no serviço:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar serviço:', error.message);
  }
}

// Executar teste
debugPredictionsService();
