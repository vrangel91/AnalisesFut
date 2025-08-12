const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');
const cachedApiService = require('./cachedApiService');

class BettingService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/cache.db');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Adicionar nova aposta
  async addBet(betData) {
    return new Promise((resolve, reject) => {
      // Armazenar referência para 'this' para usar no callback
      const self = this;
      
      const {
        fixture_id,
        home_team,
        away_team,
        league_name,
        market_type,
        prediction,
        confidence,
        stake = 0,
        odds = 0,
        match_date,
        match_time,
        analysis_data
      } = betData;

      const potential_profit = stake * (odds - 1);

      const stmt = this.db.prepare(`
        INSERT INTO user_bets (
          fixture_id, home_team, away_team, league_name, market_type,
          prediction, confidence, stake, odds, potential_profit,
          match_date, match_time, analysis_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        fixture_id,
        home_team,
        away_team,
        league_name,
        market_type,
        prediction,
        confidence,
        stake,
        odds,
        potential_profit,
        match_date,
        match_time,
        JSON.stringify(analysis_data),
        (err) => {
          if (err) {
            console.error('Erro ao adicionar aposta:', err);
            reject(err);
          } else {
            console.log(`✅ Aposta adicionada: ${home_team} vs ${away_team}`);
            // Atualizar estatísticas após adicionar aposta
            self.updateBettingStats().catch(console.error);
            resolve(this.lastID);
          }
        }
      );

      stmt.finalize();
    });
  }

  // Obter todas as apostas
  async getAllBets() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM user_bets 
        ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            analysis_data: row.analysis_data ? JSON.parse(row.analysis_data) : null
          })));
        }
      });
    });
  }

  // Obter apostas por status
  async getBetsByStatus(status) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM user_bets 
        WHERE status = ?
        ORDER BY created_at DESC
      `, [status], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            analysis_data: row.analysis_data ? JSON.parse(row.analysis_data) : null
          })));
        }
      });
    });
  }

  // Obter estatísticas de apostas
  async getBettingStats() {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT 
          COUNT(*) as total_bets,
          SUM(CASE WHEN status = 'green' THEN 1 ELSE 0 END) as green_bets,
          SUM(CASE WHEN status = 'loss' THEN 1 ELSE 0 END) as loss_bets,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bets,
          SUM(stake) as total_stake,
          SUM(CASE WHEN status = 'green' THEN profit_loss ELSE 0 END) as total_profit,
          SUM(profit_loss) as total_profit_loss,
          AVG(CASE WHEN status IN ('green', 'loss') THEN 
            CASE WHEN status = 'green' THEN 1 ELSE 0 END 
          END) * 100 as win_rate,
          CASE 
            WHEN SUM(stake) > 0 THEN (SUM(profit_loss) / SUM(stake)) * 100 
            ELSE 0 
          END as roi
        FROM user_bets
      `, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Obter estatísticas por tipo de mercado
  async getMarketStats() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          market_type,
          COUNT(*) as total_bets,
          SUM(CASE WHEN status = 'green' THEN 1 ELSE 0 END) as green_bets,
          SUM(CASE WHEN status = 'loss' THEN 1 ELSE 0 END) as loss_bets,
          AVG(CASE WHEN status IN ('green', 'loss') THEN 
            CASE WHEN status = 'green' THEN 1 ELSE 0 END 
          END) * 100 as win_rate,
          SUM(stake) as total_stake,
          SUM(profit_loss) as total_profit_loss
        FROM user_bets 
        WHERE status IN ('green', 'loss')
        GROUP BY market_type
        ORDER BY win_rate DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Atualizar resultado de uma aposta
  async updateBetResult(betId, result, actualResult, profitLoss) {
    return new Promise((resolve, reject) => {
      // Armazenar referência para 'this' para usar no callback
      const self = this;
      
      this.db.run(`
        UPDATE user_bets 
        SET status = ?, result = ?, actual_result = ?, profit_loss = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [result, result, actualResult, profitLoss, betId], function(err) {
        if (err) {
          console.error('Erro ao atualizar resultado:', err);
          reject(err);
        } else {
          console.log(`✅ Resultado atualizado: ${result}`);
          // Atualizar estatísticas após atualizar resultado
          self.updateBettingStats().catch(console.error);
          resolve(this.changes);
        }
      });
    });
  }

  // Verificar e atualizar resultados de apostas pendentes
  async checkPendingResults() {
    try {
      console.log('🚀 Iniciando verificação de resultados pendentes...');
      
      const pendingBets = await this.getBetsByStatus('pending');
      console.log(`🔍 Verificando ${pendingBets.length} apostas pendentes...`);
      
      if (pendingBets.length === 0) {
        console.log('✅ Nenhuma aposta pendente para verificar');
        return;
      }
      
      let updatedCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      
      for (const bet of pendingBets) {
        try {
          console.log(`\n📋 Verificando aposta ID ${bet.id}: ${bet.home_team} vs ${bet.away_team}`);
          console.log(`   Fixture ID: ${bet.fixture_id}, Mercado: ${bet.market_type}, Predição: ${bet.prediction}`);
          
          // Se não tem fixture_id, tentar buscar por nome dos times
          if (!bet.fixture_id || bet.fixture_id === '') {
            console.log(`   ⚠️  Aposta sem fixture_id, tentando buscar por nome dos times...`);
            
            // Buscar fixture por nome dos times
            const fixtureId = await this.findFixtureByTeamNames(bet.home_team, bet.away_team, bet.league_name);
            
            if (fixtureId) {
              console.log(`   🔍 Fixture encontrada por nome dos times: ${fixtureId}`);
              // Atualizar a aposta com o fixture_id encontrado
              await this.updateBetFixtureId(bet.id, fixtureId);
              bet.fixture_id = fixtureId;
            } else {
              console.log(`   ❌ Não foi possível encontrar fixture para: ${bet.home_team} vs ${bet.away_team}`);
              skippedCount++;
              continue;
            }
          }
          
          // Primeiro tentar buscar do banco local
          let matchResult = await this.getMatchResult(bet.fixture_id);
          
          if (matchResult) {
            console.log(`   📊 Resultado encontrado no banco local: ${matchResult.home_score}-${matchResult.away_score}`);
          } else {
            console.log(`   🌐 Resultado não encontrado no banco local, buscando da API...`);
            
            // Se não encontrou no banco, buscar da API
            matchResult = await this.fetchMatchResultFromAPI(bet.fixture_id);
            
            // Se encontrou na API, salvar no banco
            if (matchResult) {
              console.log(`   💾 Salvando resultado da API no banco local...`);
              await this.saveMatchResult(matchResult);
            }
          }
          
          // Se tem resultado e o jogo terminou, calcular resultado
          if (matchResult && matchResult.match_status === 'finished') {
            console.log(`   ✅ Jogo finalizado, calculando resultado da aposta...`);
            const result = this.calculateBetResult(bet, matchResult);
            await this.updateBetResult(bet.id, result.status, result.actualResult, result.profitLoss);
            updatedCount++;
            console.log(`   🎯 Aposta ${bet.id} atualizada: ${result.status} - ${result.actualResult}`);
          } else if (matchResult) {
            console.log(`   ⏳ Jogo ${bet.fixture_id} ainda não terminou (status: ${matchResult.match_status})`);
          } else {
            console.log(`   ❌ Não foi possível obter resultado para fixture ${bet.fixture_id}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`   💥 Erro ao verificar aposta ${bet.id}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`\n📊 Resumo da verificação:`);
      console.log(`   ✅ Apostas atualizadas: ${updatedCount}`);
      console.log(`   ❌ Erros: ${errorCount}`);
      console.log(`   ⏭️  Puladas (sem fixture): ${skippedCount}`);
      console.log(`   📋 Total verificadas: ${pendingBets.length}`);
      console.log(`✅ Verificação de resultados concluída: ${updatedCount} apostas atualizadas`);
      
    } catch (error) {
      console.error('💥 Erro geral ao verificar resultados:', error);
      throw error; // Re-throw para que a rota possa tratar o erro
    }
  }

  // Calcular resultado de uma aposta
  calculateBetResult(bet, matchResult) {
    const { prediction, market_type, stake, odds } = bet;
    const { home_score, away_score, total_goals } = matchResult;
    
    let isGreen = false;
    let actualResult = '';
    
    console.log(`🔍 Calculando resultado para aposta: ${prediction} (${market_type})`);
    console.log(`📊 Resultado do jogo: ${home_score}-${away_score} (${total_goals} gols)`);
    
    try {
      switch (market_type) {
        case 'Over/Under':
        case 'Goals':
          // Extrair número da predição (ex: "Over 2.5 gols" -> 2.5)
          const numberMatch = prediction.match(/(\d+(?:\.\d+)?)/);
          if (!numberMatch) {
            console.log(`❌ Não foi possível extrair número da predição: ${prediction}`);
            return { status: 'loss', actualResult: 'Erro na predição', profitLoss: -stake };
          }
          
          const target = parseFloat(numberMatch[1]);
          const isOver = prediction.toLowerCase().includes('over');
          
          if (isOver) {
            isGreen = total_goals > target;
            actualResult = `Over ${target} (${total_goals} gols)`;
          } else {
            isGreen = total_goals < target;
            actualResult = `Under ${target} (${total_goals} gols)`;
          }
          break;
          
        case 'Both Teams Score':
          const bothScored = home_score > 0 && away_score > 0;
          const predictionLower = prediction.toLowerCase();
          
          if (predictionLower.includes('sim') || predictionLower.includes('yes') || predictionLower.includes('ambos')) {
            isGreen = bothScored;
            actualResult = bothScored ? 'Ambos marcaram' : 'Não marcaram ambos';
          } else {
            isGreen = !bothScored;
            actualResult = bothScored ? 'Ambos marcaram' : 'Não marcaram ambos';
          }
          break;
          
        case 'Match Winner':
          let winner = '';
          if (home_score > away_score) winner = 'Home';
          else if (away_score > home_score) winner = 'Away';
          else winner = 'Draw';
          
          const predictionWinner = prediction.toLowerCase();
          let predictedWinner = '';
          
          if (predictionWinner.includes('casa') || predictionWinner.includes('home')) {
            predictedWinner = 'Home';
          } else if (predictionWinner.includes('fora') || predictionWinner.includes('away')) {
            predictedWinner = 'Away';
          } else if (predictionWinner.includes('empate') || predictionWinner.includes('draw')) {
            predictedWinner = 'Draw';
          }
          
          isGreen = predictedWinner === winner;
          actualResult = `${winner} (${home_score}-${away_score})`;
          break;
          
        default:
          console.log(`❌ Tipo de mercado não suportado: ${market_type}`);
          isGreen = false;
          actualResult = 'Tipo de mercado não suportado';
      }
      
      const profitLoss = isGreen ? stake * (odds - 1) : -stake;
      
      console.log(`✅ Resultado calculado: ${isGreen ? 'GREEN' : 'LOSS'} - ${actualResult}`);
      
      return {
        status: isGreen ? 'green' : 'loss',
        actualResult,
        profitLoss
      };
    } catch (error) {
      console.error('Erro ao calcular resultado da aposta:', error);
      return {
        status: 'loss',
        actualResult: 'Erro no cálculo',
        profitLoss: -stake
      };
    }
  }

  // Obter resultado de uma partida do banco local
  async getMatchResult(fixtureId) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM match_results 
        WHERE fixture_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `, [fixtureId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Buscar resultado de uma partida da API
  async fetchMatchResultFromAPI(fixtureId) {
    try {
      console.log(`   🌐 Fazendo requisição para API: /fixtures/id/${fixtureId}`);
      
      if (!fixtureId || fixtureId === '') {
        console.log(`   ❌ Fixture ID inválido: "${fixtureId}"`);
        return null;
      }
      
      const fixtureData = await cachedApiService.getFixtureById(fixtureId);
      
      if (!fixtureData) {
        console.log(`   ❌ Resposta vazia da API para fixture ${fixtureId}`);
        return null;
      }
      
      if (!fixtureData.response || fixtureData.response.length === 0) {
        console.log(`   ❌ Fixture ${fixtureId} não encontrada na API (response vazio)`);
        return null;
      }

      const fixture = fixtureData.response[0];
      console.log(`   📊 Dados da fixture recebidos:`, {
        id: fixture.fixture?.id,
        status: fixture.fixture?.status?.short,
        date: fixture.fixture?.date,
        teams: fixture.teams ? `${fixture.teams.home?.name} vs ${fixture.teams.away?.name}` : 'N/A'
      });
      
      const { fixture: fixtureInfo, teams, goals, score } = fixture;
      
      // Verificar se o jogo terminou
      const isFinished = fixtureInfo.status.short === 'FT' || 
                        fixtureInfo.status.short === 'AET' || 
                        fixtureInfo.status.short === 'PEN' ||
                        fixtureInfo.status.short === 'HT';

      if (!isFinished) {
        console.log(`   ⏳ Jogo ${fixtureId} ainda não terminou (status: ${fixtureInfo.status.short})`);
        return null;
      }

      const homeScore = goals?.home || score?.halftime?.home || score?.fulltime?.home || 0;
      const awayScore = goals?.away || score?.halftime?.away || score?.fulltime?.away || 0;
      const totalGoals = homeScore + awayScore;

      const matchResult = {
        fixture_id: fixtureId,
        home_team: teams.home.name,
        away_team: teams.away.name,
        home_score: homeScore,
        away_score: awayScore,
        total_goals: totalGoals,
        match_status: 'finished',
        match_date: fixtureInfo.date,
        league_name: fixture.league?.name || 'Unknown',
        venue: fixture.fixture?.venue?.name || 'Unknown'
      };

      console.log(`   ✅ Resultado obtido da API: ${homeScore}-${awayScore} (${totalGoals} gols)`);
      return matchResult;
      
    } catch (error) {
      console.error(`   💥 Erro ao buscar resultado da API para fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  // Salvar resultado de uma partida
  async saveMatchResult(resultData) {
    return new Promise((resolve, reject) => {
      const {
        fixture_id,
        home_team,
        away_team,
        home_score,
        away_score,
        match_status,
        match_date,
        league_name
      } = resultData;

      const total_goals = home_score + away_score;

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO match_results (
          fixture_id, home_team, away_team, home_score, away_score,
          total_goals, match_status, match_date, league_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        fixture_id,
        home_team,
        away_team,
        home_score,
        away_score,
        total_goals,
        match_status,
        match_date,
        league_name,
        function(err) {
          if (err) {
            console.error('Erro ao salvar resultado:', err);
            reject(err);
          } else {
            console.log(`✅ Resultado salvo: ${home_team} ${home_score}-${away_score} ${away_team}`);
            resolve(this.lastID);
          }
        }
      );

      stmt.finalize();
    });
  }

  // Atualizar estatísticas gerais
  async updateBettingStats() {
    const stats = await this.getBettingStats();
    
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT OR REPLACE INTO betting_stats (
          total_bets, green_bets, loss_bets, pending_bets,
          total_stake, total_profit, total_profit_loss,
          win_rate, roi, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        stats.total_bets || 0,
        stats.green_bets || 0,
        stats.loss_bets || 0,
        stats.pending_bets || 0,
        stats.total_stake || 0,
        stats.total_profit || 0,
        stats.total_profit_loss || 0,
        stats.win_rate || 0,
        stats.roi || 0
      ], function(err) {
        if (err) {
          console.error('Erro ao atualizar estatísticas:', err);
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Obter histórico de apostas
  async getBettingHistory(limit = 50) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM user_bets 
        WHERE status IN ('green', 'loss')
        ORDER BY updated_at DESC
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            analysis_data: row.analysis_data ? JSON.parse(row.analysis_data) : null
          })));
        }
      });
    });
  }

  // Deletar aposta
  async deleteBet(betId) {
    return new Promise((resolve, reject) => {
      // Armazenar referência para 'this' para usar no callback
      const self = this;
      
      this.db.run(`
        DELETE FROM user_bets WHERE id = ?
      `, [betId], (err) => {
        if (err) {
          console.error('Erro ao deletar aposta:', err);
          reject(err);
        } else {
          console.log(`✅ Aposta deletada: ID ${betId}`);
          // Atualizar estatísticas após deletar aposta
          self.updateBettingStats().catch(console.error);
          resolve(this.changes);
        }
      });
    });
  }

  // Fechar conexão
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco:', err);
      } else {
        console.log('🔒 Conexão com banco de apostas fechada');
      }
    });
  }

  // Buscar fixture por nome dos times
  async findFixtureByTeamNames(homeTeam, awayTeam, leagueName) {
    try {
      console.log(`   🔍 Buscando fixture para: ${homeTeam} vs ${awayTeam} (${leagueName})`);
      
      // Buscar fixtures recentes (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
      
      const fixtures = await cachedApiService.getFixtures({ date: dateFrom });
      
      if (!fixtures || !fixtures.response) {
        console.log(`   ❌ Nenhuma fixture encontrada para a data ${dateFrom}`);
        return null;
      }
      
      // Procurar por fixture que corresponda aos times
      for (const fixture of fixtures.response) {
        const fixtureHomeTeam = fixture.teams?.home?.name?.toLowerCase();
        const fixtureAwayTeam = fixture.teams?.away?.name?.toLowerCase();
        const fixtureLeague = fixture.league?.name?.toLowerCase();
        
        const searchHomeTeam = homeTeam.toLowerCase();
        const searchAwayTeam = awayTeam.toLowerCase();
        const searchLeague = leagueName.toLowerCase();
        
        // Verificar se os nomes dos times correspondem (parcial match)
        const homeMatch = fixtureHomeTeam && (
          fixtureHomeTeam.includes(searchHomeTeam) || 
          searchHomeTeam.includes(fixtureHomeTeam)
        );
        
        const awayMatch = fixtureAwayTeam && (
          fixtureAwayTeam.includes(searchAwayTeam) || 
          searchAwayTeam.includes(fixtureAwayTeam)
        );
        
        // Verificar se a liga corresponde (parcial match)
        const leagueMatch = fixtureLeague && (
          fixtureLeague.includes(searchLeague) || 
          searchLeague.includes(fixtureLeague)
        );
        
        if (homeMatch && awayMatch && leagueMatch) {
          console.log(`   ✅ Fixture encontrada: ID ${fixture.fixture.id} - ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
          return fixture.fixture.id;
        }
      }
      
      console.log(`   ❌ Nenhuma fixture correspondente encontrada`);
      return null;
      
    } catch (error) {
      console.error(`   💥 Erro ao buscar fixture por nome dos times:`, error.message);
      return null;
    }
  }
  
  // Atualizar fixture_id de uma aposta
  async updateBetFixtureId(betId, fixtureId) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE user_bets 
        SET fixture_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(fixtureId, betId, (err) => {
        if (err) {
          console.error(`   ❌ Erro ao atualizar fixture_id da aposta ${betId}:`, err);
          reject(err);
        } else {
          console.log(`   ✅ Fixture_id atualizado para aposta ${betId}: ${fixtureId}`);
          resolve();
        }
      });
      
      stmt.finalize();
    });
  }
}

module.exports = new BettingService();
