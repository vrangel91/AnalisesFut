const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testCacheSQL() {
  console.log('🔍 Teste SQL do Cache...\n');

  const dbPath = path.join(__dirname, 'data', 'cache.db');
  const db = new sqlite3.Database(dbPath);

  try {
    // Teste 1: Verificar todos os registros
    console.log('📋 Teste 1: Verificando todos os registros...');
    await new Promise((resolve, reject) => {
      db.all("SELECT id, endpoint, params FROM cache LIMIT 5", (err, rows) => {
        if (err) {
          console.error('❌ Erro:', err);
          reject(err);
        } else {
          console.log('   - Registros encontrados:');
          rows.forEach((row, index) => {
            console.log(`     ${index + 1}. ID: "${row.id}" | Endpoint: "${row.endpoint}" | Params: "${row.params}"`);
          });
        }
        resolve();
      });
    });
    console.log('');

    // Teste 2: Testar consulta específica
    console.log('🔍 Teste 2: Testando consulta específica...');
    const testKey = 'simple-test:';
    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE id = ?", [testKey], (err, row) => {
        if (err) {
          console.error('❌ Erro na consulta:', err);
          reject(err);
        } else if (row) {
          console.log('   - Registro encontrado:');
          console.log('     * ID:', `"${row.id}"`);
          console.log('     * Endpoint:', `"${row.endpoint}"`);
          console.log('     * Params:', `"${row.params}"`);
          console.log('     * Expires:', row.expires_at);
        } else {
          console.log('   - Nenhum registro encontrado para a chave:', `"${testKey}"`);
        }
        resolve();
      });
    });
    console.log('');

    // Teste 3: Testar consulta com LIKE
    console.log('🔍 Teste 3: Testando consulta com LIKE...');
    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE id LIKE ?", ['simple-test%'], (err, row) => {
        if (err) {
          console.error('❌ Erro na consulta LIKE:', err);
          reject(err);
        } else if (row) {
          console.log('   - Registro encontrado com LIKE:');
          console.log('     * ID:', `"${row.id}"`);
          console.log('     * Endpoint:', `"${row.endpoint}"`);
        } else {
          console.log('   - Nenhum registro encontrado com LIKE');
        }
        resolve();
      });
    });
    console.log('');

    // Teste 4: Verificar expiração
    console.log('⏰ Teste 4: Verificando expiração...');
    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))", [testKey], (err, row) => {
        if (err) {
          console.error('❌ Erro na consulta de expiração:', err);
          reject(err);
        } else if (row) {
          console.log('   - Registro válido encontrado:');
          console.log('     * Expira em:', row.expires_at);
          console.log('     * Agora é:', new Date().toISOString());
        } else {
          console.log('   - Registro não encontrado ou expirado');
        }
        resolve();
      });
    });
    console.log('');

    console.log('🎉 Teste SQL concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    db.close();
  }
}

// Executar o teste
testCacheSQL();
