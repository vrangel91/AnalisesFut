require('dotenv').config({ path: './config.env' });
const cacheService = require('./src/services/cacheService');

console.log('🧹 Limpando cache da análise avançada...\n');

async function clearAdvancedAnalysisCache() {
  try {
    // Limpar cache da análise avançada
    await cacheService.clearCacheByEndpoint('advanced-analysis');
    console.log('✅ Cache da análise avançada limpo!');
    
    // Limpar cache de estatísticas de fixtures também
    await cacheService.clearCacheByEndpoint('fixtures/statistics');
    console.log('✅ Cache de estatísticas de fixtures limpo!');
    
    console.log('\n🎉 Cache limpo com sucesso!');
    console.log('Agora execute o teste novamente para ver os dados reais.');
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error.message);
  }
}

// Executar limpeza
clearAdvancedAnalysisCache();
