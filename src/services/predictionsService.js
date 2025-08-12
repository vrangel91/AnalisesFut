const axios = require('axios');
const cacheService = require('./cacheService');

class PredictionsService {
  constructor() {
    this.baseURL = process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io';
    this.apiKey = process.env.API_SPORTS_KEY;
  }

  /**
   * Obtém predições para uma fixture específica
   * @param {number} fixtureId - ID da fixture
   * @param {boolean} forceRefresh - Força atualização ignorando cache
   * @returns {Object} Dados das predições
   */
  async getFixturePredictions(fixtureId, forceRefresh = false) {
    try {
      // Validar fixtureId
      if (!fixtureId || isNaN(fixtureId) || fixtureId <= 0) {
        console.error(`❌ Fixture ID inválido: ${fixtureId}`);
        return {
          success: false,
          error: 'ID da fixture inválido',
          details: 'O ID da fixture deve ser um número válido'
        };
      }

      // Verificar cache primeiro (se não for force refresh)
      if (!forceRefresh) {
        const cachedData = await cacheService.getCache('predictions', { fixtureId });
        if (cachedData) {
          console.log(`📦 Retornando predições da fixture ${fixtureId} do cache`);
          return {
            success: true,
            data: cachedData,
            fromCache: true,
            timestamp: new Date().toISOString()
          };
        }
      }

      console.log(`🔮 Buscando predições para fixture ${fixtureId}`);

      const response = await axios.get(`${this.baseURL}/predictions`, {
        params: { fixture: fixtureId },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': this.apiKey
        }
      });

      if (!response.data || !response.data.response || response.data.response.length === 0) {
        return {
          success: false,
          error: 'Nenhuma predição disponível para esta fixture',
          data: null
        };
      }

      const predictionData = response.data.response[0];
      
      // Processar e estruturar os dados
      const processedData = this.processPredictionData(predictionData);

      // Salvar no cache por 1 hora (predições são atualizadas a cada hora)
      await cacheService.setCache('predictions', { fixtureId }, processedData, 3600);

      return {
        success: true,
        data: processedData,
        fromCache: false,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Erro ao buscar predições para fixture ${fixtureId}:`, error.message);
      
      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Erro de autenticação da API',
          details: 'Verifique se a API key está configurada corretamente'
        };
      }

      return {
        success: false,
        error: 'Erro ao buscar predições',
        details: error.message
      };
    }
  }

  /**
   * Processa e estrutura os dados de predição
   * @param {Object} predictionData - Dados brutos da API
   * @returns {Object} Dados processados
   */
  processPredictionData(predictionData) {
    const { predictions, league, teams, comparison, h2h } = predictionData;

    return {
      // Predições principais
      predictions: {
        winner: predictions.winner,
        winOrDraw: predictions.win_or_draw,
        underOver: predictions.under_over,
        goals: predictions.goals,
        advice: predictions.advice,
        percent: predictions.percent
      },

      // Informações da liga
      league: {
        id: league.id,
        name: league.name,
        country: league.country,
        logo: league.logo,
        flag: league.flag,
        season: league.season
      },

      // Estatísticas dos times
      teams: {
        home: {
          id: teams.home.id,
          name: teams.home.name,
          logo: teams.home.logo,
          last5: teams.home.last_5,
          league: teams.home.league
        },
        away: {
          id: teams.away.id,
          name: teams.away.name,
          logo: teams.away.logo,
          last5: teams.away.last_5,
          league: teams.away.league
        }
      },

      // Comparação entre times
      comparison: {
        form: comparison.form,
        attack: comparison.att,
        defense: comparison.def,
        poissonDistribution: comparison.poisson_distribution,
        h2h: comparison.h2h,
        goals: comparison.goals,
        total: comparison.total
      },

      // Histórico H2H
      h2h: h2h.map(match => ({
        fixture: {
          id: match.fixture.id,
          date: match.fixture.date,
          status: match.fixture.status
        },
        league: {
          id: match.league.id,
          name: match.league.name,
          season: match.league.season
        },
        teams: {
          home: {
            id: match.teams.home.id,
            name: match.teams.home.name,
            winner: match.teams.home.winner
          },
          away: {
            id: match.teams.away.id,
            name: match.teams.away.name,
            winner: match.teams.away.winner
          }
        },
        goals: match.goals,
        score: match.score
      })),

      // Análise resumida
      analysis: this.generateAnalysis(predictions, comparison, teams)
    };
  }

  /**
   * Gera análise resumida das predições
   * @param {Object} predictions - Predições da API
   * @param {Object} comparison - Comparação entre times
   * @param {Object} teams - Dados dos times
   * @returns {Object} Análise resumida
   */
  generateAnalysis(predictions, comparison, teams) {
    const analysis = {
      confidence: 'Média',
      recommendedBets: [],
      riskLevel: 'Médio',
      keyInsights: []
    };

    // Analisar confiança baseada nos percentuais
    const homePercent = parseInt(predictions.percent.home);
    const awayPercent = parseInt(predictions.percent.away);
    const drawPercent = parseInt(predictions.percent.draw);

    if (Math.max(homePercent, awayPercent, drawPercent) >= 70) {
      analysis.confidence = 'Alta';
      analysis.riskLevel = 'Baixo';
    } else if (Math.max(homePercent, awayPercent, drawPercent) >= 55) {
      analysis.confidence = 'Média';
      analysis.riskLevel = 'Médio';
    } else {
      analysis.confidence = 'Baixa';
      analysis.riskLevel = 'Alto';
    }

    // Gerar insights baseados nas predições
    if (predictions.win_or_draw) {
      analysis.keyInsights.push('Time da casa tem alta probabilidade de não perder');
    }

    if (predictions.under_over) {
      const underOver = predictions.under_over;
      if (underOver.startsWith('-')) {
        analysis.keyInsights.push(`Jogo tende a ter menos de ${underOver.substring(1)} gols`);
      } else {
        analysis.keyInsights.push(`Jogo tende a ter mais de ${underOver.substring(1)} gols`);
      }
    }

    // Analisar comparação de times
    if (comparison.form.home > comparison.form.away) {
      analysis.keyInsights.push('Time da casa em melhor forma recente');
    } else if (comparison.form.away > comparison.form.home) {
      analysis.keyInsights.push('Time visitante em melhor forma recente');
    }

    if (comparison.poisson_distribution.home > comparison.poisson_distribution.away) {
      analysis.keyInsights.push('Distribuição de Poisson favorece time da casa');
    } else {
      analysis.keyInsights.push('Distribuição de Poisson favorece time visitante');
    }

    // Gerar recomendações de apostas
    if (predictions.advice) {
      analysis.recommendedBets.push(predictions.advice);
    }

    if (homePercent > 60) {
      analysis.recommendedBets.push('Vitória do time da casa');
    } else if (awayPercent > 60) {
      analysis.recommendedBets.push('Vitória do time visitante');
    } else if (drawPercent > 40) {
      analysis.recommendedBets.push('Empate ou dupla chance');
    }

    return analysis;
  }

  /**
   * Obtém predições para múltiplas fixtures
   * @param {Array} fixtureIds - Array de IDs das fixtures
   * @returns {Object} Predições para todas as fixtures
   */
  async getMultipleFixturePredictions(fixtureIds) {
    const results = {};
    const promises = fixtureIds.map(async (fixtureId) => {
      try {
        const result = await this.getFixturePredictions(fixtureId);
        results[fixtureId] = result;
      } catch (error) {
        console.error(`❌ Erro ao buscar predições para fixture ${fixtureId}:`, error);
        results[fixtureId] = {
          success: false,
          error: error.message
        };
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Limpa cache de predições para uma fixture específica
   * @param {number} fixtureId - ID da fixture
   */
  async clearPredictionCache(fixtureId) {
    try {
      await cacheService.deleteCache('predictions', { fixtureId });
      console.log(`🗑️ Cache de predições limpo para fixture ${fixtureId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao limpar cache de predições para fixture ${fixtureId}:`, error);
      return false;
    }
  }
}

module.exports = new PredictionsService();
