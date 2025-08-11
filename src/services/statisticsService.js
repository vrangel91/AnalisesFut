const axios = require('axios');
require('dotenv').config({ path: './config.env' });

class StatisticsService {
  constructor() {
    this.baseURL = process.env.API_SPORTS_BASE_URL;
    this.apiKey = process.env.API_SPORTS_KEY;
    this.apiHost = process.env.API_SPORTS_HOST;
  }

  /**
   * Busca estatísticas de uma fixture específica
   */
  async getFixtureStatistics(fixtureId, teamId = null, type = null, half = false) {
    try {
      const params = new URLSearchParams();
      params.append('fixture', fixtureId);
      
      if (teamId) params.append('team', teamId);
      if (type) params.append('type', type);
      if (half) params.append('half', 'true');

      const response = await axios.get(`${this.baseURL}/fixtures/statistics?${params.toString()}`, {
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas da fixture ${fixtureId}:`, error.message);
      throw error;
    }
  }

  /**
   * Busca estatísticas de escanteios de uma fixture
   */
  async getCornerKicksStatistics(fixtureId, half = false) {
    try {
      const response = await this.getFixtureStatistics(fixtureId, null, 'Corner Kicks', half);
      
      if (response.response && response.response.length > 0) {
        const cornerStats = response.response.map(teamStats => {
          const cornerData = teamStats.statistics.find(stat => stat.type === 'Corner Kicks');
          return {
            team: teamStats.team,
            cornerKicks: cornerData ? parseInt(cornerData.value) || 0 : 0
          };
        });

        return {
          fixtureId,
          totalCornerKicks: cornerStats.reduce((sum, stat) => sum + stat.cornerKicks, 0),
          teamStats: cornerStats,
          half: half
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas de escanteios da fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  /**
   * Busca estatísticas completas de uma fixture
   */
  async getCompleteFixtureStatistics(fixtureId, half = false) {
    try {
      const response = await this.getFixtureStatistics(fixtureId, null, null, half);
      
      if (response.response && response.response.length > 0) {
        const completeStats = response.response.map(teamStats => {
          const stats = {};
          
          teamStats.statistics.forEach(stat => {
            const key = this.normalizeStatKey(stat.type);
            stats[key] = this.parseStatValue(stat.value);
          });

          return {
            team: teamStats.team,
            statistics: stats
          };
        });

        return {
          fixtureId,
          half: half,
          teamStats: completeStats,
          summary: this.calculateSummary(completeStats)
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas completas da fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  /**
   * Normaliza chaves de estatísticas para facilitar o acesso
   */
  normalizeStatKey(statType) {
    const keyMap = {
      'Shots on Goal': 'shotsOnGoal',
      'Shots off Goal': 'shotsOffGoal',
      'Shots insidebox': 'shotsInsideBox',
      'Shots outsidebox': 'shotsOutsideBox',
      'Total Shots': 'totalShots',
      'Blocked Shots': 'blockedShots',
      'Fouls': 'fouls',
      'Corner Kicks': 'cornerKicks',
      'Offsides': 'offsides',
      'Ball Possession': 'ballPossession',
      'Yellow Cards': 'yellowCards',
      'Red Cards': 'redCards',
      'Goalkeeper Saves': 'goalkeeperSaves',
      'Total passes': 'totalPasses',
      'Passes accurate': 'passesAccurate',
      'Passes %': 'passesPercentage'
    };

    return keyMap[statType] || statType.toLowerCase().replace(/\s+/g, '');
  }

  /**
   * Parse o valor da estatística
   */
  parseStatValue(value) {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'string') {
      // Remove % e converte para número
      if (value.includes('%')) {
        return parseFloat(value.replace('%', '')) || 0;
      }
      // Converte string numérica para número
      return parseFloat(value) || 0;
    }
    
    return parseFloat(value) || 0;
  }

  /**
   * Calcula resumo das estatísticas
   */
  calculateSummary(teamStats) {
    const summary = {
      totalCornerKicks: 0,
      totalShots: 0,
      totalFouls: 0,
      totalYellowCards: 0,
      totalRedCards: 0,
      totalPasses: 0,
      totalPassesAccurate: 0
    };

    teamStats.forEach(team => {
      summary.totalCornerKicks += team.statistics.cornerKicks || 0;
      summary.totalShots += team.statistics.totalShots || 0;
      summary.totalFouls += team.statistics.fouls || 0;
      summary.totalYellowCards += team.statistics.yellowCards || 0;
      summary.totalRedCards += team.statistics.redCards || 0;
      summary.totalPasses += team.statistics.totalPasses || 0;
      summary.totalPassesAccurate += team.statistics.passesAccurate || 0;
    });

    // Calcular médias
    summary.averageCornerKicks = summary.totalCornerKicks / 2;
    summary.averageShots = summary.totalShots / 2;
    summary.averageFouls = summary.totalFouls / 2;
    summary.averageYellowCards = summary.totalYellowCards / 2;
    summary.averageRedCards = summary.totalRedCards / 2;
    summary.averagePasses = summary.totalPasses / 2;
    summary.averagePassesAccurate = summary.totalPassesAccurate / 2;

    // Calcular porcentagem de passes precisos
    summary.passesAccuracyPercentage = summary.totalPasses > 0 
      ? (summary.totalPassesAccurate / summary.totalPasses) * 100 
      : 0;

    return summary;
  }

  /**
   * Analisa padrões de escanteios para Over/Under
   */
  analyzeCornerKicksPattern(fixtureId, historicalData = []) {
    try {
      // Buscar estatísticas atuais
      return this.getCornerKicksStatistics(fixtureId).then(currentStats => {
        if (!currentStats) return null;

        const analysis = {
          fixtureId,
          currentCornerKicks: currentStats.totalCornerKicks,
          historicalAverage: 0,
          overUnderRecommendation: null,
          confidence: 'baixa',
          reasoning: []
        };

        // Calcular média histórica se houver dados
        if (historicalData && historicalData.length > 0) {
          const totalCorners = historicalData.reduce((sum, match) => sum + (match.cornerKicks || 0), 0);
          analysis.historicalAverage = totalCorners / historicalData.length;
          analysis.reasoning.push(`Média histórica: ${analysis.historicalAverage.toFixed(1)} escanteios`);
        }

        // Análise baseada em dados atuais
        if (currentStats.totalCornerKicks > 0) {
          analysis.reasoning.push(`Escanteios atuais: ${currentStats.totalCornerKicks}`);
          
          // Recomendações baseadas em escanteios atuais
          if (currentStats.totalCornerKicks >= 8) {
            analysis.overUnderRecommendation = 'Over 7.5 escanteios';
            analysis.confidence = 'alta';
            analysis.reasoning.push('Alto volume de escanteios indica padrão ofensivo');
          } else if (currentStats.totalCornerKicks >= 6) {
            analysis.overUnderRecommendation = 'Over 5.5 escanteios';
            analysis.confidence = 'média';
            analysis.reasoning.push('Volume moderado de escanteios');
          } else if (currentStats.totalCornerKicks <= 3) {
            analysis.overUnderRecommendation = 'Under 5.5 escanteios';
            analysis.confidence = 'média';
            analysis.reasoning.push('Baixo volume de escanteios');
          } else {
            analysis.overUnderRecommendation = 'Under 7.5 escanteios';
            analysis.confidence = 'baixa';
            analysis.reasoning.push('Volume intermediário de escanteios');
          }
        }

        // Análise baseada em dados históricos
        if (analysis.historicalAverage > 0) {
          if (analysis.historicalAverage >= 8) {
            analysis.reasoning.push('Histórico indica alto volume de escanteios');
            if (analysis.confidence === 'baixa') analysis.confidence = 'média';
          } else if (analysis.historicalAverage <= 4) {
            analysis.reasoning.push('Histórico indica baixo volume de escanteios');
            if (analysis.confidence === 'baixa') analysis.confidence = 'média';
          }
        }

        return analysis;
      });
    } catch (error) {
      console.error(`❌ Erro ao analisar padrões de escanteios da fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  /**
   * Busca estatísticas de múltiplas fixtures
   */
  async getMultipleFixturesStatistics(fixtureIds, half = false) {
    try {
      const promises = fixtureIds.map(id => this.getCompleteFixtureStatistics(id, half));
      const results = await Promise.all(promises);
      
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de múltiplas fixtures:', error.message);
      return [];
    }
  }
}

module.exports = new StatisticsService();
