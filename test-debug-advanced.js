require('dotenv').config({ path: './config.env' });
const axios = require('axios');

console.log('🔍 Debug da Análise Avançada...\n');

async function debugAdvancedAnalysis() {
  try {
    const fixtureId = 1411897;
    
    console.log(`📡 Testando rota: /api/predictions/advanced/${fixtureId}`);
    
    const response = await axios.get(`http://localhost:3001/api/predictions/advanced/${fixtureId}?refresh=true`, {
      timeout: 30000 // 30 segundos de timeout
    });
    
    console.log('📋 Status da resposta:', response.status);
    console.log('📋 Headers:', response.headers);
    
    if (response.data) {
      console.log('📋 Dados recebidos:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Nenhum dado recebido');
    }
    
  } catch (error) {
    console.error('❌ Erro detalhado:');
    console.error('Mensagem:', error.message);
    console.error('Código:', error.code);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      console.error('Dados:', error.response.data);
    } else if (error.request) {
      console.error('Request feito mas sem resposta');
      console.error('Request:', error.request);
    } else {
      console.error('Erro na configuração:', error.message);
    }
    
    console.error('Stack:', error.stack);
  }
}

// Executar debug
debugAdvancedAnalysis();
