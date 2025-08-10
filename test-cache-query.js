const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');

async function testCacheQuery() {
  console.log('🔍 Teste de Consulta do Cache...\n');

  const dbPath = path.join(__dirname, 'data', 'cache.db');
  const db = new sqlite3.Database(dbPath);

  try {
    // Teste 1: Verificar registro específico
    console.log('🔍 Teste 1: Verificando registro ttl-test...');
    const testKey = 'ttl-test:';
    
    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE id = ?", [testKey], (err, row) => {
        if (err) {
          console.error('❌ Erro:', err);
          reject(err);
        } else if (row) {
          console.log('   - Registro encontrado:');
          console.log('     * ID:', `"${row.id}"`);
          console.log('     * Expires:', row.expires_at);
          console.log('     * Agora:', moment().format('YYYY-MM-DD HH:mm:ss'));
        } else {
          console.log('   - Nenhum registro encontrado');
        }
        resolve();
      });
    });
    console.log('');

    // Teste 2: Testar consulta de expiração
    console.log('⏰ Teste 2: Testando consulta de expiração...');
    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE id = ? AND expires_at > datetime('now')", [testKey], (err, row) => {
        if (err) {
          console.error('❌ Erro na consulta de expiração:', err);
          reject(err);
        } else if (row) {
          console.log('   - Registro válido encontrado');
        } else {
          console.log('   - Registro não encontrado ou expirado');
        }
        resolve();
      });
    });
    console.log('');

    // Teste 3: Testar datetime('now') vs momento atual
    console.log('🕐 Teste 3: Comparando datetime SQL vs momento atual...');
    await new Promise((resolve, reject) => {
      db.get("SELECT datetime('now') as sql_now", (err, row) => {
        if (err) {
          console.error('❌ Erro ao obter datetime SQL:', err);
          reject(err);
        } else {
          const sqlNow = row.sql_now;
          const jsNow = moment().format('YYYY-MM-DD HH:mm:ss');
          console.log('   - SQL datetime:', sqlNow);
          console.log('   - JS datetime:', jsNow);
          console.log('   - São iguais:', sqlNow === jsNow);
        }
        resolve();
      });
    });
    console.log('');

    // Teste 4: Testar comparação direta
    console.log('🔍 Teste 4: Testando comparação direta...');
    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE id = ?", [testKey], (err, row) => {
        if (err) {
          console.error('❌ Erro:', err);
          reject(err);
        } else if (row) {
          const expiresAt = moment(row.expires_at);
          const now = moment();
          const isValid = expiresAt.isAfter(now);
          
          console.log('   - Expira em:', row.expires_at);
          console.log('   - Agora é:', now.format('YYYY-MM-DD HH:mm:ss'));
          console.log('   - É válido (JS):', isValid);
          console.log('   - Diferença (minutos):', expiresAt.diff(now, 'minutes'));
        }
        resolve();
      });
    });
    console.log('');

    // Teste 5: Criar um novo registro e testar imediatamente
    console.log('📝 Teste 5: Criando novo registro e testando...');
    const newKey = 'fresh-test:';
    const expiresAt = moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT OR REPLACE INTO cache (id, endpoint, params, data, expires_at) VALUES (?, ?, ?, ?, ?)",
        [newKey, 'fresh-test', '{}', '{"test":"fresh"}', expiresAt],
        function(err) {
          if (err) {
            console.error('❌ Erro ao inserir:', err);
            reject(err);
          } else {
            console.log('   - Novo registro inserido com ID:', this.lastID);
            resolve();
          }
        }
      );
    });

    // Testar recuperação imediata
    await new Promise((resolve, reject) => {
      db.get("SELECT * FROM cache WHERE id = ? AND expires_at > datetime('now')", [newKey], (err, row) => {
        if (err) {
          console.error('❌ Erro ao recuperar:', err);
          reject(err);
        } else if (row) {
          console.log('   - Novo registro recuperado com sucesso');
        } else {
          console.log('   - Novo registro não encontrado');
        }
        resolve();
      });
    });
    console.log('');

    console.log('🎉 Teste de consulta concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    db.close();
  }
}

// Executar o teste
testCacheQuery();
