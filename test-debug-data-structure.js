require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🔍 Debug detalhado da estrutura de dados...\n');

async function debugDataStructure() {
  try {
    console.log('📡 Fazendo requisição para /api/predictions/today...');
    
    const response = await axios.get('http://localhost:3001/api/predictions/today?refresh=true');
    
    if (response.data.success && response.data.data && response.data.data.length > 0) {
      console.log(`✅ Encontradas ${response.data.data.length} predições`);
      
      const firstPrediction = response.data.data[0];
      
      console.log('\n🔍 Estrutura completa da primeira predição:');
      console.log('Keys da predição:', Object.keys(firstPrediction));
      
      console.log('\n📋 Dados detalhados:');
      console.log('fixture:', JSON.stringify(firstPrediction.fixture, null, 2));
      console.log('prediction:', JSON.stringify(firstPrediction.prediction, null, 2));
      console.log('confidence:', firstPrediction.confidence);
      console.log('riskLevel:', firstPrediction.riskLevel);
      console.log('recommendation:', firstPrediction.recommendation);
      console.log('analysis:', JSON.stringify(firstPrediction.analysis, null, 2));
      console.log('comparison:', JSON.stringify(firstPrediction.comparison, null, 2));
      console.log('teams:', JSON.stringify(firstPrediction.teams, null, 2));
      console.log('predictions:', JSON.stringify(firstPrediction.predictions, null, 2));
      
      // Verificar se há dados aninhados
      console.log('\n🔍 Verificação de dados aninhados:');
      console.log('analysis.advancedScore:', firstPrediction.analysis?.advancedScore);
      console.log('analysis.keyInsights:', firstPrediction.analysis?.keyInsights);
      console.log('comparison.form:', firstPrediction.comparison?.form);
      console.log('teams.home:', firstPrediction.teams?.home);
      console.log('predictions.percent:', firstPrediction.predictions?.percent);
      
    } else {
      console.log('❌ Nenhuma predição encontrada');
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
debugDataStructure();
