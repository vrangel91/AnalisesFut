const cacheService = require('./src/services/cacheService');
const moment = require('moment');

async function testCacheTTL() {
  console.log('⏰ Teste TTL do Cache...\n');

  try {
    // Teste 1: Verificar TTL para diferentes endpoints
    console.log('🔍 Teste 1: Verificando TTL para diferentes endpoints...');
    const endpoints = ['simple-test', 'predictions', 'fixtures', 'leagues', 'unknown'];
    
    endpoints.forEach(endpoint => {
      const ttl = cacheService.getTTL(endpoint);
      const ttlMinutes = ttl / (60 * 1000);
      console.log(`   - ${endpoint}: ${ttlMinutes} minutos (${ttl} ms)`);
    });
    console.log('');

    // Teste 2: Criar um novo registro com TTL longo
    console.log('📝 Teste 2: Criando novo registro com TTL longo...');
    const testData = { message: 'TTL Test', timestamp: new Date().toISOString() };
    const savedKey = await cacheService.setCache('ttl-test', {}, testData);
    console.log('   - Chave salva:', savedKey);
    console.log('');

    // Teste 3: Recuperar imediatamente
    console.log('📖 Teste 3: Recuperando imediatamente...');
    const retrievedData = await cacheService.getCache('ttl-test', {});
    console.log('   - Dados recuperados:', retrievedData ? 'sim' : 'não');
    console.log('');

    // Teste 4: Verificar no banco
    console.log('🗄️ Teste 4: Verificando no banco...');
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, 'data', 'cache.db');
    const db = new sqlite3.Database(dbPath);

    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE endpoint = 'ttl-test'", (err, row) => {
        if (err) {
          console.error('❌ Erro:', err);
          reject(err);
        } else if (row) {
          console.log('   - Registro no banco:');
          console.log('     * ID:', row.id);
          console.log('     * Expira em:', row.expires_at);
          console.log('     * Agora é:', moment().format('YYYY-MM-DD HH:mm:ss'));
          
          const expiresAt = moment(row.expires_at);
          const now = moment();
          const diffMinutes = expiresAt.diff(now, 'minutes');
          console.log('     * Diferença:', diffMinutes, 'minutos');
        } else {
          console.log('   - Nenhum registro encontrado');
        }
        resolve();
      });
    });

    db.close();
    console.log('');

    // Teste 5: Testar com endpoint que tem TTL específico
    console.log('📝 Teste 5: Testando com endpoint predictions...');
    const predictionData = { message: 'Prediction Test', timestamp: new Date().toISOString() };
    await cacheService.setCache('predictions', { type: 'test' }, predictionData);
    
    const predictionRetrieved = await cacheService.getCache('predictions', { type: 'test' });
    console.log('   - Predictions recuperado:', predictionRetrieved ? 'sim' : 'não');
    console.log('');

    console.log('🎉 Teste TTL concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testCacheTTL();
