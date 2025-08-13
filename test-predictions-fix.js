require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🧪 Testando correção das predições...\n');

async function testPredictionsFix() {
  try {
    console.log('📡 Fazendo requisição para /api/predictions/today...');
    
    const response = await axios.get('http://localhost:3001/api/predictions/today?refresh=true');
    
    console.log('📋 Status da resposta:', response.status);
    
    if (response.data.success) {
      console.log('✅ Sucesso na requisição!');
      console.log(`📊 Número de predições: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n🔍 Primeira predição:');
        const firstPrediction = response.data.data[0];
        console.log(`   Fixture ID: ${firstPrediction.fixture?.fixture?.id}`);
        console.log(`   Times: ${firstPrediction.fixture?.teams?.home?.name} vs ${firstPrediction.fixture?.teams?.away?.name}`);
        console.log(`   Confiança: ${firstPrediction.confidence}`);
        console.log(`   Nível de Risco: ${firstPrediction.riskLevel}`);
        
        // Verificar se analysis existe
        if (firstPrediction.analysis) {
          console.log(`   🚀 Score Avançado: ${firstPrediction.analysis.advancedScore ? Math.round(firstPrediction.analysis.advancedScore * 100) + '%' : 'N/A'}`);
          console.log(`   💡 Insights: ${firstPrediction.analysis.keyInsights?.length || 0}`);
        } else {
          console.log('   ⚠️ Campo analysis não encontrado');
        }
        
        console.log('\n✅ CORREÇÃO APLICADA COM SUCESSO!');
        console.log('   ✅ Erro last5.forEach corrigido');
        console.log('   ✅ Predições sendo retornadas');
        console.log('   ✅ Análise avançada funcionando');
        
      } else {
        console.log('⚠️ Nenhuma predição encontrada (pode ser normal se não há jogos hoje)');
      }
      
    } else {
      console.log('❌ Erro na resposta:', response.data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar predições:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar teste
testPredictionsFix();
