const axios = require('axios');
const cacheService = require('./cacheService');

class FixtureStatisticsService {
  constructor() {
    this.baseURL = 'https://v3.football.api-sports.io';
    this.apiKey = process.env.API_SPORTS_KEY;
  }

  /**
   * Busca estatísticas de uma fixture específica
   * @param {number} fixtureId - ID da fixture
   * @param {number} teamId - ID do time (opcional)
   * @param {boolean} half - Incluir dados de primeiro e segundo tempo
   * @returns {Promise<Object>} Estatísticas da fixture
   */
  async getFixtureStatistics(fixtureId, teamId = null, half = false) {
    try {
      const endpoint = 'fixtures/statistics';
      const params = {
        fixture: fixtureId,
        team: teamId || 'all',
        half: half ? 'true' : 'false'
      };
      
      // Verificar cache primeiro
      const cachedData = await cacheService.getCache(endpoint, params);
      if (cachedData) {
        console.log(`📊 Cache hit: fixture-statistics para fixture ${fixtureId}`);
        return cachedData;
      }

      console.log(`📊 Buscando estatísticas da API para fixture ${fixtureId}${teamId ? ` (team ${teamId})` : ''}`);

      const apiParams = {
        fixture: fixtureId
      };

      if (teamId) {
        apiParams.team = teamId;
      }

      if (half) {
        apiParams.half = 'true';
      }

      const response = await axios.get(`${this.baseURL}/fixtures/statistics`, {
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': this.apiKey
        },
        params: apiParams
      });

      if (response.data && response.data.response) {
        const statistics = response.data.response;
        
        // Salvar no cache
        await cacheService.setCache(endpoint, params, statistics);
        
        console.log(`✅ Estatísticas obtidas para fixture ${fixtureId}: ${statistics.length} times`);
        return statistics;
      } else {
        console.log(`⚠️ Nenhuma estatística encontrada para fixture ${fixtureId}`);
        return [];
      }

    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas da fixture ${fixtureId}:`, error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', error.response.data);
      }
      
      return [];
    }
  }

  /**
   * Busca estatísticas de ambos os times de uma fixture
   * @param {number} fixtureId - ID da fixture
   * @param {number} homeTeamId - ID do time da casa
   * @param {number} awayTeamId - ID do time visitante
   * @returns {Promise<Object>} Estatísticas de ambos os times
   */
  async getBothTeamsStatistics(fixtureId, homeTeamId, awayTeamId) {
    try {
      console.log(`📊 Buscando estatísticas de ambos os times para fixture ${fixtureId}`);
      
      const [homeStats, awayStats] = await Promise.all([
        this.getFixtureStatistics(fixtureId, homeTeamId),
        this.getFixtureStatistics(fixtureId, awayTeamId)
      ]);

      return {
        home: homeStats.length > 0 ? homeStats[0] : null,
        away: awayStats.length > 0 ? awayStats[0] : null
      };

    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas de ambos os times para fixture ${fixtureId}:`, error.message);
      return { home: null, away: null };
    }
  }

  /**
   * Extrai estatísticas específicas de um time
   * @param {Object} teamStats - Estatísticas do time
   * @returns {Object} Estatísticas processadas
   */
  extractTeamStatistics(teamStats) {
    if (!teamStats || !teamStats.statistics) {
      return {
        shotsOnGoal: 0,
        shotsOffGoal: 0,
        totalShots: 0,
        blockedShots: 0,
        shotsInsideBox: 0,
        shotsOutsideBox: 0,
        fouls: 0,
        cornerKicks: 0,
        offsides: 0,
        ballPossession: '0%',
        yellowCards: 0,
        redCards: 0,
        goalkeeperSaves: 0,
        totalPasses: 0,
        passesAccurate: 0,
        passesPercentage: '0%'
      };
    }

    const stats = {};
    teamStats.statistics.forEach(stat => {
      stats[stat.type] = stat.value;
    });

    return {
      shotsOnGoal: stats['Shots on Goal'] || 0,
      shotsOffGoal: stats['Shots off Goal'] || 0,
      totalShots: stats['Total Shots'] || 0,
      blockedShots: stats['Blocked Shots'] || 0,
      shotsInsideBox: stats['Shots insidebox'] || 0,
      shotsOutsideBox: stats['Shots outsidebox'] || 0,
      fouls: stats['Fouls'] || 0,
      cornerKicks: stats['Corner Kicks'] || 0,
      offsides: stats['Offsides'] || 0,
      ballPossession: stats['Ball Possession'] || '0%',
      yellowCards: stats['Yellow Cards'] || 0,
      redCards: stats['Red Cards'] || 0,
      goalkeeperSaves: stats['Goalkeeper Saves'] || 0,
      totalPasses: stats['Total passes'] || 0,
      passesAccurate: stats['Passes accurate'] || 0,
      passesPercentage: stats['Passes %'] || '0%'
    };
  }

  /**
   * Calcula métricas de ataque baseadas nas estatísticas
   * @param {Object} stats - Estatísticas do time
   * @returns {Object} Métricas de ataque
   */
  calculateAttackMetrics(stats) {
    const totalShots = stats.totalShots || 0;
    const shotsOnGoal = stats.shotsOnGoal || 0;
    const shotsOffGoal = stats.shotsOffGoal || 0;
    
    return {
      totalShots,
      shotsOnGoal,
      shotsOffGoal,
      shotAccuracy: totalShots > 0 ? ((shotsOnGoal / totalShots) * 100).toFixed(1) : 0,
      shotsInsideBox: stats.shotsInsideBox || 0,
      shotsOutsideBox: stats.shotsOutsideBox || 0
    };
  }

  /**
   * Calcula métricas de defesa baseadas nas estatísticas
   * @param {Object} stats - Estatísticas do time
   * @returns {Object} Métricas de defesa
   */
  calculateDefenseMetrics(stats) {
    return {
      goalkeeperSaves: stats.goalkeeperSaves || 0,
      fouls: stats.fouls || 0,
      yellowCards: stats.yellowCards || 0,
      redCards: stats.redCards || 0,
      cornerKicksConceded: stats.cornerKicks || 0
    };
  }

  /**
   * Calcula métricas de posse de bola
   * @param {Object} stats - Estatísticas do time
   * @returns {Object} Métricas de posse
   */
  calculatePossessionMetrics(stats) {
    return {
      ballPossession: stats.ballPossession || '0%',
      totalPasses: stats.totalPasses || 0,
      passesAccurate: stats.passesAccurate || 0,
      passesPercentage: stats.passesPercentage || '0%'
    };
  }
}

module.exports = new FixtureStatisticsService();
