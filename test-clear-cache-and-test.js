require('dotenv').config({ path: './config.env' });
const axios = require('axios');
const cacheService = require('./src/services/cacheService');

console.log('🧹 Teste com Limpeza de Cache...\n');

async function testWithCacheClear() {
  try {
    console.log('🗑️ Limpando todo o cache...');
    await cacheService.clearAllCache();
    console.log('✅ Cache limpo!');
    
    console.log('\n📡 Testando rota /api/predictions/today com refresh=true...');
    
    const response = await axios.get('http://localhost:3001/api/predictions/today?refresh=true');
    
    if (response.data.success && response.data.data && response.data.data.length > 0) {
      console.log(`✅ API retornou ${response.data.data.length} predições`);
      
      // Verificar o tipo do ID da primeira predição
      const firstPrediction = response.data.data[0];
      const fixtureId = firstPrediction.fixture?.fixture?.id;
      
      console.log('\n🔍 Primeira predição:');
      console.log(`   ID: ${fixtureId} (tipo: ${typeof fixtureId})`);
      console.log(`   É numérico: ${!isNaN(fixtureId)}`);
      console.log(`   Times: ${firstPrediction.fixture?.teams?.home?.name} vs ${firstPrediction.fixture?.teams?.away?.name}`);
      
      if (typeof fixtureId === 'number') {
        console.log('\n✅ SUCESSO: ID é numérico!');
        
        // Testar análise avançada
        console.log('\n📡 Testando análise avançada...');
        const advancedResponse = await axios.get(`http://localhost:3001/api/predictions/advanced/${fixtureId}?refresh=true`);
        
        if (advancedResponse.data.success) {
          console.log('✅ Análise avançada funcionando!');
          console.log('\n🎉 PROBLEMA RESOLVIDO!');
          console.log('O ID da fixture agora é numérico e a análise avançada funciona.');
        } else {
          console.log('❌ Erro na análise avançada:', advancedResponse.data.error);
        }
      } else {
        console.log('\n❌ PROBLEMA PERSISTE: ID ainda é string!');
        console.log('O problema não é de cache.');
      }
      
    } else {
      console.log('❌ API não retornou dados');
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
testWithCacheClear();
