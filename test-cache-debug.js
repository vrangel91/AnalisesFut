require('dotenv').config({ path: './config.env' });
const axios = require('axios');
const cacheService = require('./src/services/cacheService');

console.log('🔍 Debug do Cache...\n');

async function testCacheDebug() {
  try {
    console.log('🗑️ Limpando todo o cache...');
    await cacheService.clearAllCache();
    console.log('✅ Cache limpo!');
    
    console.log('\n📡 Testando rota /api/predictions/today SEM refresh...');
    
    const response1 = await axios.get('http://localhost:3001/api/predictions/today');
    
    if (response1.data.success) {
      console.log(`✅ Primeira requisição: ${response1.data.data.length} predições`);
      console.log(`   From cache: ${response1.data.fromCache}`);
      
      const firstPrediction1 = response1.data.data[0];
      console.log(`   ID: ${firstPrediction1.fixture?.fixture?.id} (tipo: ${typeof firstPrediction1.fixture?.fixture?.id})`);
    }
    
    console.log('\n📡 Testando rota /api/predictions/today COM refresh=true...');
    
    const response2 = await axios.get('http://localhost:3001/api/predictions/today?refresh=true');
    
    if (response2.data.success) {
      console.log(`✅ Segunda requisição: ${response2.data.data.length} predições`);
      console.log(`   From cache: ${response2.data.fromCache}`);
      
      const firstPrediction2 = response2.data.data[0];
      console.log(`   ID: ${firstPrediction2.fixture?.fixture?.id} (tipo: ${typeof firstPrediction2.fixture?.fixture?.id})`);
    }
    
    console.log('\n📡 Testando rota /api/predictions/today SEM refresh novamente...');
    
    const response3 = await axios.get('http://localhost:3001/api/predictions/today');
    
    if (response3.data.success) {
      console.log(`✅ Terceira requisição: ${response3.data.data.length} predições`);
      console.log(`   From cache: ${response3.data.fromCache}`);
      
      const firstPrediction3 = response3.data.data[0];
      console.log(`   ID: ${firstPrediction3.fixture?.fixture?.id} (tipo: ${typeof firstPrediction3.fixture?.fixture?.id})`);
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
testCacheDebug();
