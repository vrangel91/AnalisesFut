const axios = require('axios');
const cacheService = require('./cacheService');

class CornerKicksStatisticsService {
  constructor() {
    this.apiKey = process.env.API_SPORTS_KEY;
    this.apiHost = 'v3.football.api-sports.io';
    this.baseURL = 'https://v3.football.api-sports.io';
  }

  /**
   * Busca estatísticas específicas de corner kicks de uma fixture
   * @param {number} fixtureId - ID da fixture
   * @param {Object} options - Opções de busca
   * @param {boolean} options.forceRefresh - Força busca na API ignorando cache
   * @param {string} options.half - '0-15', '16-30', '31-45', '46-60', '61-75', '76-90', '91-105'
   * @param {string} options.team - ID do time específico
   * @returns {Object} Estatísticas de corner kicks processadas
   */
  async getCornerKicksStatistics(fixtureId, options = {}) {
    try {
      const { forceRefresh = false, half, team } = options;
      
      // Se não for forceRefresh, verificar cache primeiro
      if (!forceRefresh) {
        const cacheKey = `corner-kicks-statistics:${fixtureId}:${half || 'all'}:${team || 'all'}`;
        const cachedData = await cacheService.getCache('corner-kicks-statistics', { 
          fixtureId, 
          half: half || 'all', 
          team: team || 'all' 
        });
        
        if (cachedData) {
          console.log('📦 Retornando estatísticas de corner kicks do cache');
          return {
            ...cachedData,
            source: 'cache'
          };
        }
      }

      console.log(`🌐 Buscando estatísticas de corner kicks da fixture ${fixtureId} na API`);
      
      // Construir parâmetros da requisição
      const params = new URLSearchParams();
      params.append('fixture', fixtureId);
      
      if (half) params.append('half', half);
      if (team) params.append('team', team);

      const response = await axios.get(`${this.baseURL}/fixtures/statistics?${params.toString()}`, {
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey
        }
      });

      console.log(`📊 Resposta da API de estatísticas de corner kicks:`, {
        status: response.status,
        results: response.data.results,
        responseLength: response.data.response?.length || 0
      });

      if (response.data.errors && response.data.errors.length > 0) {
        console.error('❌ Erros da API:', response.data.errors);
        throw new Error(`API Errors: ${response.data.errors.join(', ')}`);
      }

      if (!response.data.response || response.data.response.length === 0) {
        console.log('⚠️ Nenhuma estatística de corner kicks encontrada para esta fixture');
        return null;
      }

      // Processar os dados da API focando em corner kicks
      const processedData = this.processCornerKicksStatistics(response.data.response);
      
      // Salvar no cache (12 horas para estatísticas de corner kicks)
      if (!forceRefresh) {
        await cacheService.setCache('corner-kicks-statistics', { 
          fixtureId, 
          half: half || 'all', 
          team: team || 'all' 
        }, processedData);
      }

      return {
        ...processedData,
        source: 'api'
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de corner kicks:', error.message);
      throw error;
    }
  }

  /**
   * Processa os dados brutos da API focando em corner kicks
   * @param {Array} statisticsData - Dados brutos da API
   * @returns {Object} Dados processados de corner kicks
   */
  processCornerKicksStatistics(statisticsData) {
    try {
      if (!statisticsData || statisticsData.length === 0) {
        return null;
      }

      const fixture = statisticsData[0];
      const teams = fixture.statistics || [];
      
      if (teams.length === 0) {
        return null;
      }

      // Extrair dados dos times
      const homeTeam = teams.find(team => team.team?.id === fixture.teams?.home?.id) || teams[0];
      const awayTeam = teams.find(team => team.team?.id === fixture.teams?.away?.id) || teams[1];

      // Processar estatísticas de corner kicks
      const homeCornerStats = this.extractCornerKicksStatistics(homeTeam);
      const awayCornerStats = this.extractCornerKicksStatistics(awayTeam);

      // Calcular totais e análises
      const totalCorners = (homeCornerStats.corners || 0) + (awayCornerStats.corners || 0);
      const homeCornerPercentage = totalCorners > 0 ? Math.round(((homeCornerStats.corners || 0) / totalCorners) * 100) : 0;
      const awayCornerPercentage = totalCorners > 0 ? Math.round(((awayCornerStats.corners || 0) / totalCorners) * 100) : 0;

      // Análise de padrões de corner kicks
      const cornerPatterns = this.analyzeCornerPatterns(homeCornerStats, awayCornerStats, totalCorners);

      return {
        fixture: {
          id: fixture.fixture?.id,
          date: fixture.fixture?.date,
          home: fixture.teams?.home,
          away: fixture.teams?.away
        },
        cornerKicks: {
          total: totalCorners,
          home: homeCornerStats.corners || 0,
          away: awayCornerStats.corners || 0,
          homePercentage: homeCornerPercentage,
          awayPercentage: awayCornerPercentage
        },
        homeTeam: {
          name: homeTeam.team?.name,
          id: homeTeam.team?.id,
          cornerStats: homeCornerStats
        },
        awayTeam: {
          name: awayTeam.team?.name,
          id: awayTeam.team?.id,
          cornerStats: awayCornerStats
        },
        analysis: {
          patterns: cornerPatterns,
          dominance: homeCornerStats.corners > awayCornerStats.corners ? 'home' : 
                    awayCornerStats.corners > homeCornerStats.corners ? 'away' : 'equal',
          intensity: this.calculateCornerIntensity(totalCorners),
          prediction: this.predictCornerTrend(homeCornerStats, awayCornerStats)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro ao processar estatísticas de corner kicks:', error.message);
      throw error;
    }
  }

  /**
   * Extrai estatísticas de corner kicks de um time específico
   * @param {Object} teamData - Dados do time
   * @returns {Object} Estatísticas de corner kicks extraídas
   */
  extractCornerKicksStatistics(teamData) {
    if (!teamData || !teamData.statistics) {
      return { corners: 0 };
    }

    const cornerStats = {
      corners: 0,
      cornerAccuracy: 0,
      cornerConversion: 0,
      cornerPressure: 0
    };
    
    teamData.statistics.forEach(stat => {
      const type = stat.type;
      const value = stat.value;

      switch (type) {
        case 'Corner Kicks':
          cornerStats.corners = parseInt(value) || 0;
          break;
        case 'Shots on Goal':
          cornerStats.shotsOnGoal = parseInt(value) || 0;
          break;
        case 'Total Shots':
          cornerStats.totalShots = parseInt(value) || 0;
          break;
        case 'Ball Possession':
          cornerStats.possession = parseInt(value) || 0;
          break;
        case 'Fouls':
          cornerStats.fouls = parseInt(value) || 0;
          break;
      }
    });

    // Calcular métricas derivadas
    if (cornerStats.corners > 0) {
      cornerStats.cornerConversion = cornerStats.shotsOnGoal > 0 ? 
        Math.round((cornerStats.shotsOnGoal / cornerStats.corners) * 100) : 0;
      
      cornerStats.cornerPressure = cornerStats.totalShots > 0 ? 
        Math.round((cornerStats.corners / cornerStats.totalShots) * 100) : 0;
    }

    return cornerStats;
  }

  /**
   * Analisa padrões de corner kicks
   * @param {Object} homeStats - Estatísticas do time da casa
   * @param {Object} awayStats - Estatísticas do time visitante
   * @param {number} totalCorners - Total de corner kicks
   * @returns {Object} Análise de padrões
   */
  analyzeCornerPatterns(homeStats, awayStats, totalCorners) {
    const patterns = {
      totalCorners,
      homeCorners: homeStats.corners || 0,
      awayCorners: awayStats.corners || 0,
      cornerDistribution: {
        homePercentage: totalCorners > 0 ? Math.round(((homeStats.corners || 0) / totalCorners) * 100) : 0,
        awayPercentage: totalCorners > 0 ? Math.round(((awayStats.corners || 0) / totalCorners) * 100) : 0
      },
      efficiency: {
        home: homeStats.cornerConversion || 0,
        away: awayStats.cornerConversion || 0
      },
      pressure: {
        home: homeStats.cornerPressure || 0,
        away: awayStats.cornerPressure || 0
      }
    };

    // Análise de intensidade
    if (totalCorners >= 10) {
      patterns.intensity = 'high';
    } else if (totalCorners >= 6) {
      patterns.intensity = 'medium';
    } else {
      patterns.intensity = 'low';
    }

    // Análise de equilíbrio
    const cornerDifference = Math.abs((homeStats.corners || 0) - (awayStats.corners || 0));
    if (cornerDifference <= 1) {
      patterns.balance = 'balanced';
    } else if (cornerDifference <= 3) {
      patterns.balance = 'slightly_unbalanced';
    } else {
      patterns.balance = 'unbalanced';
    }

    return patterns;
  }

  /**
   * Calcula a intensidade dos corner kicks
   * @param {number} totalCorners - Total de corner kicks
   * @returns {string} Nível de intensidade
   */
  calculateCornerIntensity(totalCorners) {
    if (totalCorners >= 12) return 'very_high';
    if (totalCorners >= 9) return 'high';
    if (totalCorners >= 6) return 'medium';
    if (totalCorners >= 3) return 'low';
    return 'very_low';
  }

  /**
   * Prediz tendência de corner kicks baseada nas estatísticas
   * @param {Object} homeStats - Estatísticas do time da casa
   * @param {Object} awayStats - Estatísticas do time visitante
   * @returns {Object} Predição
   */
  predictCornerTrend(homeStats, awayStats) {
    const homeEfficiency = homeStats.cornerConversion || 0;
    const awayEfficiency = awayStats.cornerConversion || 0;
    const homePressure = homeStats.cornerPressure || 0;
    const awayPressure = awayStats.cornerPressure || 0;

    let prediction = {
      trend: 'neutral',
      confidence: 'medium',
      reasoning: []
    };

    // Análise de eficiência
    if (homeEfficiency > awayEfficiency + 10) {
      prediction.trend = 'home_advantage';
      prediction.reasoning.push('Time da casa tem melhor conversão de corner kicks');
    } else if (awayEfficiency > homeEfficiency + 10) {
      prediction.trend = 'away_advantage';
      prediction.reasoning.push('Time visitante tem melhor conversão de corner kicks');
    }

    // Análise de pressão
    if (homePressure > awayPressure + 15) {
      prediction.trend = 'home_advantage';
      prediction.reasoning.push('Time da casa exerce mais pressão via corner kicks');
    } else if (awayPressure > homePressure + 15) {
      prediction.trend = 'away_advantage';
      prediction.reasoning.push('Time visitante exerce mais pressão via corner kicks');
    }

    // Determinar confiança
    if (prediction.reasoning.length >= 2) {
      prediction.confidence = 'high';
    } else if (prediction.reasoning.length === 1) {
      prediction.confidence = 'medium';
    } else {
      prediction.confidence = 'low';
    }

    return prediction;
  }

  /**
   * Método público para obter estatísticas de corner kicks
   * @param {number} fixtureId - ID da fixture
   * @param {Object} options - Opções de busca
   * @returns {Object} Resposta padronizada
   */
  async getCornerKicksStats(fixtureId, options = {}) {
    try {
      const statistics = await this.getCornerKicksStatistics(fixtureId, options);
      
      if (!statistics) {
        return {
          success: false,
          error: 'Estatísticas de corner kicks não disponíveis para esta fixture',
          fixtureId
        };
      }

      return {
        success: true,
        data: statistics,
        source: statistics.source,
        fixtureId
      };

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de corner kicks:', error.message);
      return {
        success: false,
        error: 'Erro ao buscar estatísticas de corner kicks',
        details: error.message,
        fixtureId
      };
    }
  }
}

module.exports = new CornerKicksStatisticsService();
