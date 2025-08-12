const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function clearCache() {
  try {
    console.log('🧹 Limpando cache...');
    
    const dbPath = path.join(__dirname, 'data/cache.db');
    const db = new sqlite3.Database(dbPath);
    
    // Limpar cache específico do H2H
    db.run("DELETE FROM cache WHERE endpoint LIKE '%h2h%'", (err) => {
      if (err) {
        console.error('❌ Erro ao limpar cache H2H:', err);
      } else {
        console.log('✅ Cache H2H limpo com sucesso!');
      }
    });
    
    // Limpar cache específico de fixtures
    db.run("DELETE FROM cache WHERE endpoint LIKE '%fixture%'", (err) => {
      if (err) {
        console.error('❌ Erro ao limpar cache de fixtures:', err);
      } else {
        console.log('✅ Cache de fixtures limpo com sucesso!');
      }
    });
    
    // Fechar conexão
    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err);
      } else {
        console.log('🔒 Conexão com banco fechada');
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error.message);
  }
}

clearCache();
