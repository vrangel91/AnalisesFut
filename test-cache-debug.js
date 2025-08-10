const cacheService = require('./src/services/cacheService');

async function testCacheDebug() {
  console.log('🔍 Teste de Debug do Cache...\n');

  try {
    // Teste 1: Verificar geração de chaves
    console.log('🔑 Teste 1: Verificando geração de chaves...');
    const key1 = cacheService.generateCacheKey('test', { type: 'test' });
    const key2 = cacheService.generateCacheKey('test', { type: 'test' });
    console.log('   - Chave 1:', key1);
    console.log('   - Chave 2:', key2);
    console.log('   - Chaves iguais:', key1 === key2);
    console.log('');

    // Teste 2: Salvar e recuperar dados simples
    console.log('📝 Teste 2: Salvando dados simples...');
    const testData = { message: 'Hello World', timestamp: new Date().toISOString() };
    const savedKey = await cacheService.setCache('simple-test', {}, testData);
    console.log('   - Chave salva:', savedKey);
    console.log('');

    // Teste 3: Recuperar dados imediatamente
    console.log('📖 Teste 3: Recuperando dados imediatamente...');
    const retrievedData = await cacheService.getCache('simple-test', {});
    console.log('   - Dados recuperados:', retrievedData);
    console.log('   - Dados iguais:', JSON.stringify(testData) === JSON.stringify(retrievedData));
    console.log('');

    // Teste 4: Verificar no banco diretamente
    console.log('🗄️ Teste 4: Verificando no banco diretamente...');
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, 'data', 'cache.db');
    const db = new sqlite3.Database(dbPath);

    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE endpoint = 'simple-test'", (err, row) => {
        if (err) {
          console.error('❌ Erro ao consultar banco:', err);
          reject(err);
        } else if (row) {
          console.log('   - Registro encontrado no banco:');
          console.log('     * ID:', row.id);
          console.log('     * Endpoint:', row.endpoint);
          console.log('     * Params:', row.params);
          console.log('     * Data:', row.data.substring(0, 50) + '...');
          console.log('     * Expires:', row.expires_at);
        } else {
          console.log('   - Nenhum registro encontrado no banco');
        }
        resolve();
      });
    });

    db.close();
    console.log('');

    // Teste 5: Testar com parâmetros
    console.log('🔧 Teste 5: Testando com parâmetros...');
    const paramData = { message: 'With params', timestamp: new Date().toISOString() };
    await cacheService.setCache('param-test', { type: 'test', id: 123 }, paramData);
    
    const paramRetrieved = await cacheService.getCache('param-test', { type: 'test', id: 123 });
    console.log('   - Dados com parâmetros recuperados:', paramRetrieved ? 'sim' : 'não');
    console.log('');

    console.log('🎉 Teste de debug concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testCacheDebug();
