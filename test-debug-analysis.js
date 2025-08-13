require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🔍 Debug da análise avançada...\n');

async function debugAnalysis() {
  try {
    console.log('📡 Fazendo requisição para /api/predictions/today...');
    
    const response = await axios.get('http://localhost:3001/api/predictions/today?refresh=true');
    
    if (response.data.success && response.data.data && response.data.data.length > 0) {
      console.log(`✅ Encontradas ${response.data.data.length} predições`);
      
      const firstPrediction = response.data.data[0];
      
      console.log('\n🔍 Estrutura da análise:');
      console.log('analysis existe:', !!firstPrediction.analysis);
      console.log('analysis keys:', firstPrediction.analysis ? Object.keys(firstPrediction.analysis) : 'N/A');
      
      if (firstPrediction.analysis) {
        console.log('\n📊 Valores da análise:');
        console.log('advancedScore:', firstPrediction.analysis.advancedScore);
        console.log('confidence:', firstPrediction.analysis.confidence);
        console.log('riskLevel:', firstPrediction.analysis.riskLevel);
        console.log('keyInsights:', firstPrediction.analysis.keyInsights);
        console.log('recommendedBets:', firstPrediction.analysis.recommendedBets);
        
        // Verificar se há dados de comparação
        console.log('\n🔍 Dados de comparação:');
        console.log('comparison existe:', !!firstPrediction.comparison);
        if (firstPrediction.comparison) {
          console.log('comparison keys:', Object.keys(firstPrediction.comparison));
        }
        
        // Verificar dados dos times
        console.log('\n🔍 Dados dos times:');
        console.log('teams existe:', !!firstPrediction.teams);
        if (firstPrediction.teams) {
          console.log('teams keys:', Object.keys(firstPrediction.teams));
          console.log('home last_5:', firstPrediction.teams.home?.last_5);
          console.log('away last_5:', firstPrediction.teams.away?.last_5);
        }
        
        // Verificar predições
        console.log('\n🔍 Dados das predições:');
        console.log('predictions existe:', !!firstPrediction.predictions);
        if (firstPrediction.predictions) {
          console.log('predictions keys:', Object.keys(firstPrediction.predictions));
          console.log('percent:', firstPrediction.predictions.percent);
        }
      }
      
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
debugAnalysis();
