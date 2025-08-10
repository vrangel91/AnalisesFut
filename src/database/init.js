const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Criar diretório data se não existir
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cache.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️ Inicializando banco de dados SQLite...');

// Criar tabelas
db.serialize(() => {
  // Tabela de cache geral
  db.run(`
    CREATE TABLE IF NOT EXISTS cache (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      params TEXT,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
      access_count INTEGER DEFAULT 0
    )
  `);

  // Tabela de fixtures
  db.run(`
    CREATE TABLE IF NOT EXISTS fixtures (
      id INTEGER PRIMARY KEY,
      fixture_data TEXT NOT NULL,
      league_id INTEGER,
      season INTEGER,
      date TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de odds
  db.run(`
    CREATE TABLE IF NOT EXISTS odds (
      id INTEGER PRIMARY KEY,
      fixture_id INTEGER,
      odds_data TEXT NOT NULL,
      bookmaker TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fixture_id) REFERENCES fixtures (id)
    )
  `);

  // Tabela de leagues
  db.run(`
    CREATE TABLE IF NOT EXISTS leagues (
      id INTEGER PRIMARY KEY,
      league_data TEXT NOT NULL,
      country TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de teams
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY,
      team_data TEXT NOT NULL,
      country TEXT,
      league_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (league_id) REFERENCES leagues (id)
    )
  `);

  // Tabela de predictions
  db.run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY,
      fixture_id INTEGER,
      prediction_data TEXT NOT NULL,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fixture_id) REFERENCES fixtures (id)
    )
  `);

  // Tabela de head_to_head
  db.run(`
    CREATE TABLE IF NOT EXISTS head_to_head (
      id INTEGER PRIMARY KEY,
      team1_id INTEGER,
      team2_id INTEGER,
      h2h_data TEXT NOT NULL,
      last_matches INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team1_id) REFERENCES teams (id),
      FOREIGN KEY (team2_id) REFERENCES teams (id)
    )
  `);

  // Tabela de estatísticas de cache
  db.run(`
    CREATE TABLE IF NOT EXISTS cache_stats (
      id INTEGER PRIMARY KEY,
      endpoint TEXT NOT NULL,
      total_requests INTEGER DEFAULT 0,
      cache_hits INTEGER DEFAULT 0,
      cache_misses INTEGER DEFAULT 0,
      avg_response_time REAL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de apostas do usuário
  db.run(`
    CREATE TABLE IF NOT EXISTS user_bets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fixture_id INTEGER NOT NULL,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      league_name TEXT NOT NULL,
      market_type TEXT NOT NULL,
      prediction TEXT NOT NULL,
      confidence TEXT NOT NULL,
      stake REAL DEFAULT 0,
      odds REAL DEFAULT 0,
      potential_profit REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      result TEXT DEFAULT NULL,
      actual_result TEXT DEFAULT NULL,
      profit_loss REAL DEFAULT 0,
      analysis_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      match_date TEXT,
      match_time TEXT
    )
  `);

  // Tabela de estatísticas de apostas
  db.run(`
    CREATE TABLE IF NOT EXISTS betting_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_bets INTEGER DEFAULT 0,
      green_bets INTEGER DEFAULT 0,
      loss_bets INTEGER DEFAULT 0,
      pending_bets INTEGER DEFAULT 0,
      total_stake REAL DEFAULT 0,
      total_profit REAL DEFAULT 0,
      total_profit_loss REAL DEFAULT 0,
      win_rate REAL DEFAULT 0,
      roi REAL DEFAULT 0,
      best_market TEXT DEFAULT NULL,
      worst_market TEXT DEFAULT NULL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de histórico de resultados
  db.run(`
    CREATE TABLE IF NOT EXISTS match_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fixture_id INTEGER NOT NULL,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_score INTEGER DEFAULT 0,
      away_score INTEGER DEFAULT 0,
      total_goals INTEGER DEFAULT 0,
      match_status TEXT DEFAULT 'finished',
      match_date TEXT,
      league_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Índices para melhor performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_cache_endpoint ON cache(endpoint)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_fixtures_date ON fixtures(date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_fixtures_league ON fixtures(league_id, season)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_odds_fixture ON odds(fixture_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_predictions_fixture ON predictions(fixture_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_h2h_teams ON head_to_head(team1_id, team2_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_bets_fixture ON user_bets(fixture_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_bets_status ON user_bets(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_bets_date ON user_bets(match_date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_match_results_fixture ON match_results(fixture_id)`);

  console.log('✅ Tabelas criadas com sucesso!');
});

db.close((err) => {
  if (err) {
    console.error('❌ Erro ao fechar banco:', err.message);
  } else {
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log(`📁 Localização: ${dbPath}`);
  }
});
