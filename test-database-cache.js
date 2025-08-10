const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function testDatabaseCache() {
  console.log('🧪 Iniciando testes do banco de dados do cache...\n');

  const dbPath = path.join(__dirname, 'data', 'cache.db');
  const db = new sqlite3.Database(dbPath);

  try {
    // Teste 1: Verificar se a tabela existe
    console.log('🔍 Teste 1: Verificando estrutura da tabela...');
    await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='cache'", (err, rows) => {
        if (err) {
          console.error('❌ Erro ao verificar tabelas:', err);
          reject(err);
        } else {
          console.log('   - Tabelas encontradas:', rows.map(row => row.name));
          resolve();
        }
      });
    });
    console.log('');

    // Teste 2: Verificar estrutura da tabela cache
    console.log('📋 Teste 2: Verificando estrutura da tabela cache...');
    await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(cache)", (err, rows) => {
        if (err) {
          console.error('❌ Erro ao verificar estrutura:', err);
          reject(err);
        } else {
          console.log('   - Colunas da tabela cache:');
          rows.forEach(row => {
            console.log(`     * ${row.name} (${row.type})`);
          });
          resolve();
        }
      });
    });
    console.log('');

    // Teste 3: Verificar dados existentes
    console.log('📊 Teste 3: Verificando dados existentes...');
    await new Promise((resolve, reject) => {
      db.all("SELECT endpoint, params, created_at, expires_at FROM cache LIMIT 5", (err, rows) => {
        if (err) {
          console.error('❌ Erro ao verificar dados:', err);
          reject(err);
        } else {
          console.log(`   - Total de registros encontrados: ${rows.length}`);
          rows.forEach((row, index) => {
            console.log(`   - Registro ${index + 1}:`);
            console.log(`     * Endpoint: ${row.endpoint}`);
            console.log(`     * Params: ${row.params}`);
            console.log(`     * Criado em: ${row.created_at}`);
            console.log(`     * Expira em: ${row.expires_at}`);
          });
          resolve();
        }
      });
    });
    console.log('');

    // Teste 4: Testar inserção de dados
    console.log('📝 Teste 4: Testando inserção de dados...');
    const testData = {
      endpoint: 'test_endpoint',
      params: JSON.stringify({ type: 'test' }),
      data: JSON.stringify({ test: 'data' }),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hora
    };

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO cache (endpoint, params, data, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
        [testData.endpoint, testData.params, testData.data, testData.created_at, testData.expires_at],
        function(err) {
          if (err) {
            console.error('❌ Erro ao inserir dados:', err);
            reject(err);
          } else {
            console.log(`   - Dados inseridos com ID: ${this.lastID}`);
            resolve();
          }
        }
      );
    });
    console.log('');

    // Teste 5: Testar recuperação de dados
    console.log('📖 Teste 5: Testando recuperação de dados...');
    await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM cache WHERE endpoint = ? AND params = ?",
        [testData.endpoint, testData.params],
        (err, row) => {
          if (err) {
            console.error('❌ Erro ao recuperar dados:', err);
            reject(err);
          } else if (row) {
            console.log('   - Dados recuperados:');
            console.log(`     * ID: ${row.id}`);
            console.log(`     * Endpoint: ${row.endpoint}`);
            console.log(`     * Data: ${row.data}`);
            console.log(`     * Expira em: ${row.expires_at}`);
          } else {
            console.log('   - Nenhum dado encontrado');
          }
          resolve();
        }
      );
    });
    console.log('');

    // Teste 6: Verificar dados expirados
    console.log('⏰ Teste 6: Verificando dados expirados...');
    await new Promise((resolve, reject) => {
      db.all(
        "SELECT COUNT(*) as count FROM cache WHERE expires_at < datetime('now')",
        (err, rows) => {
          if (err) {
            console.error('❌ Erro ao verificar dados expirados:', err);
            reject(err);
          } else {
            console.log(`   - Dados expirados: ${rows[0].count}`);
            resolve();
          }
        }
      );
    });
    console.log('');

    // Teste 7: Limpar dados de teste
    console.log('🧹 Teste 7: Limpando dados de teste...');
    await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM cache WHERE endpoint = ?",
        [testData.endpoint],
        function(err) {
          if (err) {
            console.error('❌ Erro ao limpar dados:', err);
            reject(err);
          } else {
            console.log(`   - Registros removidos: ${this.changes}`);
            resolve();
          }
        }
      );
    });
    console.log('');

    console.log('🎉 Todos os testes do banco de dados do cache concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    db.close();
  }
}

// Executar os testes
testDatabaseCache();
