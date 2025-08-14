const axios = require('axios');
const cacheService = require('./cacheService');
const advancedAnalysisService = require('./advancedAnalysisService');

class PredictionsService {
  constructor() {
    this.baseURL = process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io';
    this.apiKey = process.env.API_SPORTS_KEY;
  }

  /**
   * 🚀 NOVA: Análise completa avançada de uma fixture
   * @param {number} fixtureId - ID da fixture
   * @param {boolean} forceRefresh - Força atualização ignorando cache
   * @returns {Object} Análise completa avançada
   */
  async getAdvancedFixtureAnalysis(fixtureId, forceRefresh = false) {
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
        const cachedData = await cacheService.getCache('advanced-analysis', { fixtureId });
        if (cachedData) {
          console.log(`📦 Retornando análise avançada da fixture ${fixtureId} do cache`);
          return {
            success: true,
            data: cachedData,
            fromCache: true,
            timestamp: new Date().toISOString()
          };
        }
      }

      console.log(`🔍 Iniciando análise avançada para fixture ${fixtureId}`);

      // Buscar análise avançada
      const advancedAnalysis = await advancedAnalysisService.getCompleteFixtureAnalysis(fixtureId);

      if (!advancedAnalysis.success) {
        return advancedAnalysis;
      }

      // Salvar no cache por 30 minutos (análise avançada é mais pesada)
      await cacheService.setCache('advanced-analysis', { fixtureId }, advancedAnalysis.data, 1800);

      return {
        success: true,
        data: advancedAnalysis.data,
        fromCache: false,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Erro na análise avançada para fixture ${fixtureId}:`, error.message);
      return {
        success: false,
        error: 'Erro na análise avançada',
        details: error.message
      };
    }
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
      } else {
        console.log(`🔄 Force refresh: limpando cache para fixture ${fixtureId}`);
        await cacheService.deleteCache('predictions', { fixtureId });
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
      const processedData = this.processPredictionData(predictionData, fixtureId);

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
   * @param {number} fixtureId - ID da fixture (obtido do parâmetro da requisição)
   * @returns {Object} Dados processados
   */
  processPredictionData(predictionData, fixtureId) {
    const { predictions, league, teams, comparison, h2h } = predictionData;

    return {
      // Informações da fixture (INCLUINDO O ID NUMÉRICO REAL)
      fixture: {
        fixture: {
          id: fixtureId, // ID numérico real da API (obtido do parâmetro da requisição)
          date: new Date().toISOString(), // Data atual como fallback
          status: 'NS', // Status padrão
          timestamp: Math.floor(Date.now() / 1000), // Timestamp atual
          timezone: 'UTC',
          referee: null,
          venue: null,
          periods: null
        },
        goals: null,
        score: null,
        events: null,
        lineups: null,
        statistics: null,
        players: null
      },

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
      keyInsights: [],
      advancedScore: 0
    };

    // Analisar confiança baseada nos percentuais
    const homePercent = parseInt(predictions.percent.home);
    const awayPercent = parseInt(predictions.percent.away);
    const drawPercent = parseInt(predictions.percent.draw);
    
    const maxPercent = Math.max(homePercent, awayPercent, drawPercent);
    const totalPercent = homePercent + awayPercent + drawPercent;
    
    // Lógica mais realista para confiança
    if (maxPercent >= 60) {
      analysis.confidence = 'Alta';
      analysis.riskLevel = 'Baixo';
    } else if (maxPercent >= 45) {
      analysis.confidence = 'Média';
      analysis.riskLevel = 'Médio';
    } else {
      analysis.confidence = 'Baixa';
      analysis.riskLevel = 'Alto';
    }
    
    // Ajustar baseado na distribuição dos percentuais
    if (maxPercent >= 50 && (homePercent === awayPercent || awayPercent === drawPercent || homePercent === drawPercent)) {
      // Se há empate nos percentuais mais altos, reduzir confiança
      if (analysis.confidence === 'Alta') {
        analysis.confidence = 'Média';
        analysis.riskLevel = 'Médio';
      }
    }

    // 🚀 NOVA: Análise de tendências históricas
    const homeForm = this.analyzeTeamForm(teams.home?.last_5);
    const awayForm = this.analyzeTeamForm(teams.away?.last_5);
    
    // Calcular score de forma recente
    const formScore = this.calculateFormScore(homeForm, awayForm);
    
    // 🚀 NOVA: Análise de distribuição de Poisson
    const poissonScore = this.calculatePoissonScore(comparison?.poissonDistribution || {});
    
    // 🚀 NOVA: Análise de ataque/defesa
    const attackDefenseScore = this.calculateAttackDefenseScore(
      comparison?.attack || { home: 0, away: 0 }, 
      comparison?.defense || { home: 0, away: 0 }
    );

    // 🚀 NOVA: Score composto avançado
    analysis.advancedScore = this.calculateAdvancedScore({
      apiConfidence: maxPercent / 100,
      formScore: formScore,
      poissonScore: poissonScore,
      attackDefenseScore: attackDefenseScore,
      h2hScore: comparison?.h2h?.home > comparison?.h2h?.away ? 0.8 : 0.2
    });

    // Ajustar confiança baseada no score avançado
    if (analysis.advancedScore >= 0.7) {
      analysis.confidence = 'Alta';
      analysis.riskLevel = 'Baixo';
    } else if (analysis.advancedScore >= 0.5) {
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

    // 🚀 NOVA: Insights baseados na forma recente
    if (homeForm.wins > 3) {
      analysis.keyInsights.push('Time da casa em excelente forma recente');
    } else if (homeForm.losses > 3) {
      analysis.keyInsights.push('Time da casa em má fase');
    }

    if (awayForm.wins > 3) {
      analysis.keyInsights.push('Time visitante em excelente forma recente');
    } else if (awayForm.losses > 3) {
      analysis.keyInsights.push('Time visitante em má fase');
    }

    // Analisar comparação de times
    if (comparison?.form?.home > comparison?.form?.away) {
      analysis.keyInsights.push('Time da casa em melhor forma recente');
    } else if (comparison?.form?.away > comparison?.form?.home) {
      analysis.keyInsights.push('Time visitante em melhor forma recente');
    }

    if (comparison?.poissonDistribution?.home > comparison?.poissonDistribution?.away) {
      analysis.keyInsights.push('Distribuição de Poisson favorece time da casa');
    } else if (comparison?.poissonDistribution?.away > comparison?.poissonDistribution?.home) {
      analysis.keyInsights.push('Distribuição de Poisson favorece time visitante');
    }

    // 🚀 NOVA: Análise de ataque/defesa
    if (comparison?.attack?.home > comparison?.attack?.away) {
      analysis.keyInsights.push('Time da casa tem melhor ataque');
    } else if (comparison?.attack?.away > comparison?.attack?.home) {
      analysis.keyInsights.push('Time visitante tem melhor ataque');
    }

    if (comparison?.defense?.home > comparison?.defense?.away) {
      analysis.keyInsights.push('Time da casa tem melhor defesa');
    } else if (comparison?.defense?.away > comparison?.defense?.home) {
      analysis.keyInsights.push('Time visitante tem melhor defesa');
    }

    // Gerar recomendações de apostas
    if (predictions.advice) {
      analysis.recommendedBets.push(predictions.advice);
    }

    // 🚀 NOVA: Recomendações baseadas no score avançado
    if (analysis.advancedScore >= 0.7) {
      if (homePercent > 60) {
        analysis.recommendedBets.push('APOSTA FORTE: Vitória do time da casa');
      } else if (awayPercent > 60) {
        analysis.recommendedBets.push('APOSTA FORTE: Vitória do time visitante');
      }
    } else if (analysis.advancedScore >= 0.5) {
      if (homePercent > 50) {
        analysis.recommendedBets.push('APOSTA MODERADA: Vitória do time da casa');
      } else if (awayPercent > 50) {
        analysis.recommendedBets.push('APOSTA MODERADA: Vitória do time visitante');
      }
    }

    if (drawPercent > 40) {
      analysis.recommendedBets.push('Empate ou dupla chance');
    }

    return analysis;
  }

  /**
   * 🚀 NOVA: Analisa a forma recente de um time
   * @param {Object|Array} last5 - Últimos 5 jogos (pode ser objeto ou array)
   * @returns {Object} Análise da forma
   */
  analyzeTeamForm(last5) {
    const form = {
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0
    };

    // Se last5 é um array (formato esperado: ['W', 'D', 'L', 'W', 'D'])
    if (Array.isArray(last5)) {
      last5.forEach(match => {
        if (match === 'W') {
          form.wins++;
        } else if (match === 'D') {
          form.draws++;
        } else if (match === 'L') {
          form.losses++;
        }
      });
    }
    // Se last5 é um objeto (formato atual da API)
    else if (last5 && typeof last5 === 'object') {
      // Tentar extrair informações do objeto last5
      if (last5.form && typeof last5.form === 'string') {
        // Se form é uma string como "60%", tentar interpretar
        const formPercent = parseInt(last5.form.replace('%', ''));
        if (!isNaN(formPercent)) {
          // Estimativa baseada na porcentagem de forma
          if (formPercent >= 80) {
            form.wins = 4;
            form.draws = 1;
          } else if (formPercent >= 60) {
            form.wins = 3;
            form.draws = 2;
          } else if (formPercent >= 40) {
            form.wins = 2;
            form.draws = 2;
            form.losses = 1;
          } else if (formPercent >= 20) {
            form.wins = 1;
            form.draws = 2;
            form.losses = 2;
          } else {
            form.wins = 0;
            form.draws = 1;
            form.losses = 4;
          }
        }
      }
      
      // Se há dados de gols, usar para estimar
      if (last5.goals && last5.goals.for && last5.goals.against) {
        form.goalsFor = last5.goals.for.total || 0;
        form.goalsAgainst = last5.goals.against.total || 0;
      }
    }

    return form;
  }

  /**
   * 🚀 NOVA: Calcula score baseado na forma recente
   * @param {Object} homeForm - Forma do time da casa
   * @param {Object} awayForm - Forma do time visitante
   * @returns {number} Score de forma (0-1)
   */
  calculateFormScore(homeForm, awayForm) {
    const homeScore = (homeForm.wins * 3 + homeForm.draws) / 15; // Máximo 15 pontos
    const awayScore = (awayForm.wins * 3 + awayForm.draws) / 15;
    
    // Se time da casa tem melhor forma, score mais alto
    if (homeScore > awayScore) {
      return 0.5 + (homeScore - awayScore) * 0.5;
    } else {
      return 0.5 - (awayScore - homeScore) * 0.5;
    }
  }

  /**
   * 🚀 NOVA: Calcula score baseado na distribuição de Poisson
   * @param {Object} poisson - Distribuição de Poisson
   * @returns {number} Score de Poisson (0-1)
   */
  calculatePoissonScore(poisson) {
    // Converter strings como "0%" para números
    const homePoisson = typeof poisson.home === 'string' ? 
      parseInt(poisson.home.replace('%', '')) / 100 : 
      (poisson.home || 0);
    const awayPoisson = typeof poisson.away === 'string' ? 
      parseInt(poisson.away.replace('%', '')) / 100 : 
      (poisson.away || 0);
    
    if (homePoisson > awayPoisson) {
      return 0.5 + (homePoisson - awayPoisson) * 0.1;
    } else {
      return 0.5 - (awayPoisson - homePoisson) * 0.1;
    }
  }

  /**
   * 🚀 NOVA: Calcula score baseado em ataque/defesa
   * @param {Object} attack - Estatísticas de ataque
   * @param {Object} defense - Estatísticas de defesa
   * @returns {number} Score de ataque/defesa (0-1)
   */
  calculateAttackDefenseScore(attack, defense) {
    // Converter strings como "0%" para números
    const homeAttack = typeof attack.home === 'string' ? 
      parseInt(attack.home.replace('%', '')) : 
      (attack.home || 0);
    const awayAttack = typeof attack.away === 'string' ? 
      parseInt(attack.away.replace('%', '')) : 
      (attack.away || 0);
    const homeDefense = typeof defense.home === 'string' ? 
      parseInt(defense.home.replace('%', '')) : 
      (defense.home || 0);
    const awayDefense = typeof defense.away === 'string' ? 
      parseInt(defense.away.replace('%', '')) : 
      (defense.away || 0);
    
    const homeAttackAdvantage = (homeAttack - awayAttack) / 100;
    const homeDefenseAdvantage = (homeDefense - awayDefense) / 100;
    
    return 0.5 + (homeAttackAdvantage + homeDefenseAdvantage) * 0.25;
  }

  /**
   * 🚀 NOVA: Calcula score composto avançado
   * @param {Object} scores - Scores individuais
   * @returns {number} Score composto (0-1)
   */
  calculateAdvancedScore(scores) {
    return (
      scores.apiConfidence * 0.35 +
      scores.formScore * 0.25 +
      scores.poissonScore * 0.20 +
      scores.attackDefenseScore * 0.15 +
      scores.h2hScore * 0.05
    );
  }

  /**
   * Obtém predições para múltiplas fixtures
   * @param {Array} fixtureIds - Array de IDs das fixtures
   * @returns {Object} Predições para todas as fixtures
   */
  async getMultipleFixturePredictions(fixtureIds) {
    console.log('🔍 getMultipleFixturePredictions chamado com:', fixtureIds);
    const results = {};
    const promises = fixtureIds.map(async (fixtureId) => {
      try {
        console.log(`🔍 Buscando predições para fixture ${fixtureId} (tipo: ${typeof fixtureId})`);
        const result = await this.getFixturePredictions(fixtureId);
        console.log(`✅ Resultado para fixture ${fixtureId}:`, result.success ? 'sucesso' : 'erro');
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
    console.log('🔍 Resultados finais:', Object.keys(results));
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
