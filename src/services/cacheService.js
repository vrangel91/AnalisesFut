const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class CacheService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/cache.db');
    this.db = new sqlite3.Database(this.dbPath);
    this.defaultTTL = {
      fixtures: 30 * 60 * 1000, // 30 minutos
      odds: 5 * 60 * 1000, // 5 minutos
      leagues: 24 * 60 * 60 * 1000, // 24 horas
      teams: 24 * 60 * 60 * 1000, // 24 horas
      predictions: 60 * 60 * 1000, // 1 hora
      h2h: 12 * 60 * 60 * 1000, // 12 horas
      statistics: 24 * 60 * 60 * 1000, // 24 horas (1x ao dia conforme recomendação da API)
      'fixtures/statistics': 24 * 60 * 60 * 1000, // 24 horas para estatísticas de fixtures
      default: 15 * 60 * 1000 // 15 minutos
    };
  }

  // Gerar chave única para cache
  generateCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${endpoint}:${sortedParams}`;
  }

  // Obter TTL baseado no endpoint
  getTTL(endpoint) {
    for (const [key, ttl] of Object.entries(this.defaultTTL)) {
      if (endpoint.includes(key)) {
        return ttl;
      }
    }
    return this.defaultTTL.default;
  }

  // Salvar dados no cache
  async setCache(endpoint, params, data) {
    return new Promise((resolve, reject) => {
      const cacheKey = this.generateCacheKey(endpoint, params);
      const ttl = this.getTTL(endpoint);
      const expiresAt = moment().add(ttl, 'milliseconds').format('YYYY-MM-DD HH:mm:ss');
      
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO cache (id, endpoint, params, data, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        cacheKey,
        endpoint,
        JSON.stringify(params),
        JSON.stringify(data),
        expiresAt,
        (err) => {
          if (err) {
            console.error('Erro ao salvar cache:', err);
            reject(err);
          } else {
            console.log(`💾 Cache salvo: ${endpoint}`);
            resolve(cacheKey);
          }
        }
      );
      
      stmt.finalize();
    });
  }

  // Recuperar dados do cache
  async getCache(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      const cacheKey = this.generateCacheKey(endpoint, params);
      
      const stmt = this.db.prepare(`
        SELECT data, expires_at FROM cache 
        WHERE id = ? AND (expires_at IS NULL OR expires_at > datetime('now', 'localtime'))
      `);
      
      stmt.get(cacheKey, (err, row) => {
        if (err) {
          console.error('Erro ao recuperar cache:', err);
          reject(err);
        } else if (row) {
          // Atualizar estatísticas de acesso
          this.updateAccessStats(cacheKey);
          console.log(`🎯 Cache hit: ${endpoint}`);
          resolve(JSON.parse(row.data));
        } else {
          console.log(`❌ Cache miss: ${endpoint}`);
          resolve(null);
        }
      });
      
      stmt.finalize();
    });
  }

  // Atualizar estatísticas de acesso
  async updateAccessStats(cacheKey) {
    return new Promise((resolve) => {
      this.db.run(`
        UPDATE cache 
        SET access_count = access_count + 1, 
            last_accessed = datetime('now')
        WHERE id = ?
      `, cacheKey, (err) => {
        if (err) console.error('Erro ao atualizar stats:', err);
        resolve();
      });
    });
  }

  // Limpar cache expirado
  async cleanExpiredCache() {
    return new Promise((resolve) => {
      this.db.run(`
        DELETE FROM cache 
        WHERE expires_at IS NOT NULL AND expires_at < datetime('now', 'localtime')
      `, (err) => {
        if (err) {
          console.error('Erro ao limpar cache expirado:', err);
        } else {
          console.log('🧹 Cache expirado limpo');
        }
        resolve();
      });
    });
  }

  // Obter estatísticas do cache
  async getCacheStats() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          endpoint,
          COUNT(*) as total_entries,
          SUM(access_count) as total_accesses,
          AVG(access_count) as avg_accesses,
          MAX(last_accessed) as last_accessed
        FROM cache 
        GROUP BY endpoint
        ORDER BY total_accesses DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obter tamanho do cache
  async getCacheSize() {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT COUNT(*) as count FROM cache
      `, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  // Salvar dados específicos (fixtures, odds, etc.)
  async saveSpecificData(table, data, conditions = {}) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ${table} (${columns})
        VALUES (${placeholders})
      `);
      
      stmt.run(values, (err) => {
        if (err) {
          console.error(`Erro ao salvar em ${table}:`, err);
          reject(err);
        } else {
          console.log(`💾 Dados salvos em ${table}`);
          resolve();
        }
      });
      
      stmt.finalize();
    });
  }

  // Recuperar dados específicos
  async getSpecificData(table, conditions = {}) {
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM ${table}`;
      const values = [];
      
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        values.push(...Object.values(conditions));
      }
      
      this.db.all(query, values, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Verificar se dados existem e não estão expirados
  async hasValidData(table, conditions = {}) {
    return new Promise((resolve) => {
      let query = `SELECT COUNT(*) as count FROM ${table}`;
      const values = [];
      
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        values.push(...Object.values(conditions));
      }
      
      this.db.get(query, values, (err, row) => {
        if (err) {
          resolve(false);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }

  // Fechar conexão com banco
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco:', err);
      } else {
        console.log('🔒 Conexão com banco fechada');
      }
    });
  }
}

module.exports = new CacheService();
