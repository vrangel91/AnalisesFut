require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🎯 Teste Final - Análise Avançada...\n');

async function testFinalAdvancedAnalysis() {
  try {
    console.log('📡 Buscando predições de hoje...');
    
    const response = await axios.get('http://localhost:3001/api/predictions/today?refresh=true');
    
    if (response.data.success && response.data.data && response.data.data.length > 0) {
      console.log(`✅ Encontradas ${response.data.data.length} predições`);
      
      const firstPrediction = response.data.data[0];
      const fixtureId = firstPrediction.fixture?.fixture?.id;
      
      console.log('\n🔍 Primeira predição:');
      console.log(`   ID: ${fixtureId} (tipo: ${typeof fixtureId})`);
      console.log(`   Times: ${firstPrediction.fixture?.teams?.home?.name} vs ${firstPrediction.fixture?.teams?.away?.name}`);
      console.log(`   Confiança: ${firstPrediction.confidence}`);
      console.log(`   Nível de Risco: ${firstPrediction.riskLevel}`);
      
      if (typeof fixtureId === 'number') {
        console.log('\n📡 Testando análise avançada...');
        
        const advancedResponse = await axios.get(`http://localhost:3001/api/predictions/advanced/${fixtureId}?refresh=true`);
        
        if (advancedResponse.data.success) {
          console.log('✅ Análise avançada funcionando!');
          console.log('📊 Dados retornados:');
          console.log('   - Análise de Ataque:', !!advancedResponse.data.data.attackAnalysis);
          console.log('   - Análise de Defesa:', !!advancedResponse.data.data.defenseAnalysis);
          console.log('   - Análise de Forma:', !!advancedResponse.data.data.formAnalysis);
          console.log('   - Análise Over/Under:', !!advancedResponse.data.data.overUnderAnalysis);
          console.log('   - Insights de Apostas:', !!advancedResponse.data.data.bettingInsights);
          console.log('   - Avaliação de Risco:', !!advancedResponse.data.data.riskAssessment);
          
          console.log('\n🎉 SUCESSO COMPLETO!');
          console.log('✅ ID da fixture é numérico');
          console.log('✅ Análise avançada funcionando');
          console.log('✅ Sistema pronto para uso no frontend');
          
        } else {
          console.log('❌ Erro na análise avançada:', advancedResponse.data.error);
        }
      } else {
        console.log('❌ ID ainda é string - problema não resolvido');
      }
      
    } else {
      console.log('❌ Nenhuma predição encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar teste
testFinalAdvancedAnalysis();
