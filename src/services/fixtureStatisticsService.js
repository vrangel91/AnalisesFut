const axios = require('axios');
const cacheService = require('./cacheService');

class FixtureStatisticsService {
  constructor() {
    this.apiKey = process.env.API_SPORTS_KEY;
    this.apiHost = 'v3.football.api-sports.io';
    this.baseURL = 'https://v3.football.api-sports.io';
  }

  /**
   * Busca estatísticas completas de uma fixture específica
   * @param {number} fixtureId - ID da fixture
   * @param {Object} options - Opções de busca
   * @param {boolean} options.forceRefresh - Força busca na API ignorando cache
   * @param {string} options.half - '0-15', '16-30', '31-45', '46-60', '61-75', '76-90', '91-105'
   * @param {string} options.team - ID do time específico
   * @param {string} options.type - Tipo de estatística
   * @returns {Object} Estatísticas processadas
   */
  async getFixtureCompleteStatistics(fixtureId, options = {}) {
    try {
      const { forceRefresh = false, half, team, type } = options;
      
      // Se não for forceRefresh, verificar cache primeiro
      if (!forceRefresh) {
        const cacheKey = `fixture-statistics:${fixtureId}:${half || 'all'}:${team || 'all'}:${type || 'all'}`;
        const cachedData = await cacheService.getCache('fixture-statistics', { 
          fixtureId, 
          half: half || 'all', 
          team: team || 'all', 
          type: type || 'all' 
        });
        
        if (cachedData) {
          console.log('📦 Retornando estatísticas completas da fixture do cache');
          return {
            ...cachedData,
            source: 'cache'
          };
        }
      }

      console.log(`🌐 Buscando estatísticas completas da fixture ${fixtureId} na API`);
      
      // Construir parâmetros da requisição
      const params = new URLSearchParams();
      params.append('fixture', fixtureId);
      
      if (half) params.append('half', half);
      if (team) params.append('team', team);
      if (type) params.append('type', type);

      const response = await axios.get(`${this.baseURL}/fixtures/statistics?${params.toString()}`, {
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey
        }
      });

      console.log(`📊 Resposta da API de estatísticas:`, {
        status: response.status,
        results: response.data.results,
        responseLength: response.data.response?.length || 0
      });

      if (response.data.errors && response.data.errors.length > 0) {
        console.error('❌ Erros da API:', response.data.errors);
        throw new Error(`API Errors: ${response.data.errors.join(', ')}`);
      }

      if (!response.data.response || response.data.response.length === 0) {
        console.log('⚠️ Nenhuma estatística encontrada para esta fixture');
        return null;
      }

      // Processar os dados da API
      const processedData = this.processCompleteStatistics(response.data.response);
      
      // Salvar no cache (24 horas para estatísticas)
      if (!forceRefresh) {
        await cacheService.setCache('fixture-statistics', { 
          fixtureId, 
          half: half || 'all', 
          team: team || 'all', 
          type: type || 'all' 
        }, processedData);
      }

      return {
        ...processedData,
        source: 'api'
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas completas da fixture:', error.message);
      throw error;
    }
  }

  /**
   * Processa os dados brutos da API de estatísticas
   * @param {Array} statisticsData - Dados brutos da API
   * @returns {Object} Dados processados
   */
  processCompleteStatistics(statisticsData) {
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

      // Processar estatísticas
      const homeStats = this.extractTeamStatistics(homeTeam);
      const awayStats = this.extractTeamStatistics(awayTeam);

      // Calcular totais
      const totalShots = (homeStats.shots?.total || 0) + (awayStats.shots?.total || 0);
      const totalFouls = (homeStats.fouls || 0) + (awayStats.fouls || 0);
      const totalPasses = (homeStats.passes?.total || 0) + (awayStats.passes?.total || 0);
      const totalCorners = (homeStats.corners || 0) + (awayStats.corners || 0);
      const totalYellowCards = (homeStats.cards?.yellow || 0) + (awayStats.cards?.yellow || 0);
      const totalRedCards = (homeStats.cards?.red || 0) + (awayStats.cards?.red || 0);

      // Calcular percentuais de passes
      const homePassAccuracy = homeStats.passes?.accuracy ? parseFloat(homeStats.passes.accuracy.replace('%', '')) : 0;
      const awayPassAccuracy = awayStats.passes?.accuracy ? parseFloat(awayStats.passes.accuracy.replace('%', '')) : 0;

      return {
        fixture: {
          id: fixture.fixture?.id,
          date: fixture.fixture?.date,
          home: fixture.teams?.home,
          away: fixture.teams?.away
        },
        summary: {
          totalShots,
          totalFouls,
          totalPasses,
          totalCorners,
          totalYellowCards,
          totalRedCards
        },
        // Estrutura compatível com o frontend
        totalShots: {
          home: homeStats.shots?.total || 0,
          away: awayStats.shots?.total || 0
        },
        totalFouls: {
          home: homeStats.fouls || 0,
          away: awayStats.fouls || 0
        },
        totalPasses: {
          home: homeStats.passes?.total || 0,
          away: awayStats.passes?.total || 0
        },
        corners: {
          home: homeStats.corners || 0,
          away: awayStats.corners || 0
        },
        shotsOnGoal: {
          home: homeStats.shotsOnGoal || 0,
          away: awayStats.shotsOnGoal || 0
        },
        shotsOffGoal: {
          home: homeStats.shotsOffGoal || 0,
          away: awayStats.shotsOffGoal || 0
        },
        shotsInsideBox: {
          home: homeStats.shots?.insideBox || 0,
          away: awayStats.shots?.insideBox || 0
        },
        shotsOutsideBox: {
          home: homeStats.shots?.outsideBox || 0,
          away: awayStats.shots?.outsideBox || 0
        },
        blockedShots: {
          home: homeStats.shots?.blocked || 0,
          away: awayStats.shots?.blocked || 0
        },
        ballPossession: {
          home: homeStats.possession || 0,
          away: awayStats.possession || 0
        },
        passesAccurate: {
          home: homeStats.passes?.accurate || 0,
          away: awayStats.passes?.accurate || 0
        },
        passesPercentage: {
          home: homeStats.passes?.accuracy || '0%',
          away: awayStats.passes?.accuracy || '0%'
        },
        yellowCards: {
          home: homeStats.cards?.yellow || 0,
          away: awayStats.cards?.yellow || 0
        },
        redCards: {
          home: homeStats.cards?.red || 0,
          away: awayStats.cards?.red || 0
        },
        offsides: {
          home: homeStats.offsides || 0,
          away: awayStats.offsides || 0
        },
        saves: {
          home: homeStats.saves || 0,
          away: awayStats.saves || 0
        },
        homeTeam: {
          name: homeTeam.team?.name,
          id: homeTeam.team?.id,
          ...homeStats
        },
        awayTeam: {
          name: awayTeam.team?.name,
          id: awayTeam.team?.id,
          ...awayStats
        },
        comparison: {
          shots: {
            home: homeStats.shots?.total || 0,
            away: awayStats.shots?.total || 0,
            homePercentage: totalShots > 0 ? Math.round(((homeStats.shots?.total || 0) / totalShots) * 100) : 0,
            awayPercentage: totalShots > 0 ? Math.round(((awayStats.shots?.total || 0) / totalShots) * 100) : 0
          },
          passes: {
            home: homeStats.passes?.total || 0,
            away: awayStats.passes?.total || 0,
            homeAccuracy: homePassAccuracy,
            awayAccuracy: awayPassAccuracy
          },
          possession: {
            home: homeStats.possession || 0,
            away: awayStats.possession || 0
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro ao processar estatísticas:', error.message);
      throw error;
    }
  }

  /**
   * Extrai estatísticas de um time específico
   * @param {Object} teamData - Dados do time
   * @returns {Object} Estatísticas extraídas
   */
  extractTeamStatistics(teamData) {
    if (!teamData || !teamData.statistics) {
      return {};
    }

    const stats = {};
    
    teamData.statistics.forEach(stat => {
      const type = stat.type;
      const value = stat.value;

      switch (type) {
        case 'Shots on Goal':
          stats.shotsOnGoal = parseInt(value) || 0;
          break;
        case 'Shots off Goal':
          stats.shotsOffGoal = parseInt(value) || 0;
          break;
        case 'Total Shots':
          stats.shots = { ...stats.shots, total: parseInt(value) || 0 };
          break;
        case 'Blocked Shots':
          stats.shots = { ...stats.shots, blocked: parseInt(value) || 0 };
          break;
        case 'Shots insidebox':
          stats.shots = { ...stats.shots, insideBox: parseInt(value) || 0 };
          break;
        case 'Shots outsidebox':
          stats.shots = { ...stats.shots, outsideBox: parseInt(value) || 0 };
          break;
        case 'Fouls':
          stats.fouls = parseInt(value) || 0;
          break;
        case 'Corner Kicks':
          stats.corners = parseInt(value) || 0;
          break;
        case 'Offsides':
          stats.offsides = parseInt(value) || 0;
          break;
        case 'Ball Possession':
          stats.possession = parseInt(value) || 0;
          break;
        case 'Yellow Cards':
          stats.cards = { ...stats.cards, yellow: parseInt(value) || 0 };
          break;
        case 'Red Cards':
          stats.cards = { ...stats.cards, red: parseInt(value) || 0 };
          break;
        case 'Goalkeeper Saves':
          stats.saves = parseInt(value) || 0;
          break;
        case 'Total passes':
          stats.passes = { ...stats.passes, total: parseInt(value) || 0 };
          break;
        case 'Passes accurate':
          stats.passes = { ...stats.passes, accurate: parseInt(value) || 0 };
          break;
        case 'Passes %':
          stats.passes = { ...stats.passes, accuracy: value };
          break;
      }
    });

    return stats;
  }

  /**
   * Método público para obter estatísticas da fixture
   * @param {number} fixtureId - ID da fixture
   * @param {Object} options - Opções de busca
   * @returns {Object} Resposta padronizada
   */
  async getFixtureStats(fixtureId, options = {}) {
    try {
      const statistics = await this.getFixtureCompleteStatistics(fixtureId, options);
      
      if (!statistics) {
        return {
          success: false,
          error: 'Estatísticas não disponíveis para esta fixture',
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
      console.error('❌ Erro ao obter estatísticas da fixture:', error.message);
      return {
        success: false,
        error: 'Erro ao buscar estatísticas',
        details: error.message,
        fixtureId
      };
    }
  }
}

module.exports = new FixtureStatisticsService();
