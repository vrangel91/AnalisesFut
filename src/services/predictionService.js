const cachedApiService = require('./cachedApiService');
const H2HAnalysisService = require('./h2hAnalysisService');
const moment = require('moment');

class PredictionService {
  constructor() {
    this.apiService = cachedApiService;
    this.h2hService = new H2HAnalysisService();
  }

  // Obter predições da API-SPORTS para um fixture específico
  async getApiPredictions(fixtureId) {
    try {
      const data = await this.apiService.getPredictions(fixtureId);
      return data.response[0] || null;
    } catch (error) {
      console.error('Erro ao obter predições da API:', error.message);
      return null;
    }
  }

  // Obter predições para jogos de hoje
  async getTodayPredictions() {
    try {
      const today = moment().format('YYYY-MM-DD');
      const fixtures = await this.apiService.getFixturesByDate(today);
      
      if (!fixtures.response || fixtures.response.length === 0) {
        console.log('📅 Nenhum jogo encontrado para hoje');
        return [];
      }

      console.log(`📅 Encontrados ${fixtures.response.length} jogos para hoje`);
      
      // Filtrar apenas jogos que ainda não terminaram
      const activeFixtures = fixtures.response.filter(fixture => {
        const status = fixture.fixture?.status?.short;
        const isFinished = status === 'FT' || status === 'AET' || status === 'PEN' || status === 'HT';
        
        if (isFinished) {
          console.log(`⏭️ Pular jogo finalizado: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (status: ${status})`);
          return false;
        }
        
        return true;
      });
      
      console.log(`📅 ${activeFixtures.length} jogos ativos (não finalizados) para hoje`);
      
      if (activeFixtures.length === 0) {
        console.log('📅 Todos os jogos de hoje já terminaram');
        return [];
      }
      
      const predictions = [];
      
      for (const fixture of activeFixtures.slice(0, 10)) { // Limitar a 10 jogos
        try {
          console.log(`🔍 Analisando: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (status: ${fixture.fixture?.status?.short})`);
          
          const prediction = await this.getApiPredictions(fixture.fixture.id);
          if (prediction) {
            // Adicionar análise H2H
            const h2hAnalysis = await this.h2hService.getCompleteH2HAnalysis(fixture);
            
            const confidence = this.calculateConfidenceWithH2H(prediction, h2hAnalysis);
            const recommendation = this.generateRecommendationWithH2H(prediction, h2hAnalysis);
            
            console.log(`✅ Predição gerada: ${recommendation} (${confidence})`);
            
            predictions.push({
              fixture: fixture,
              prediction: prediction,
              h2h: h2hAnalysis,
              confidence: confidence,
              recommendation: recommendation
            });
          } else {
            console.log(`❌ Sem predição da API para: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
          }
        } catch (error) {
          console.error(`Erro ao obter predição para fixture ${fixture.fixture.id}:`, error.message);
        }
      }

      console.log(`📊 Total de predições geradas: ${predictions.length}`);
      return predictions;
    } catch (error) {
      console.error('Erro ao obter predições de hoje:', error.message);
      return [];
    }
  }

  // Obter predições para uma liga específica
  async getLeaguePredictions(leagueId, season) {
    try {
      const fixtures = await this.apiService.getFixturesByLeague(leagueId, season);
      
      if (!fixtures.response || fixtures.response.length === 0) {
        return [];
      }

      const predictions = [];
      
      for (const fixture of fixtures.response.slice(0, 20)) { // Limitar a 20 jogos
        try {
          const prediction = await this.getApiPredictions(fixture.fixture.id);
          if (prediction) {
            // Adicionar análise H2H
            const h2hAnalysis = await this.h2hService.getCompleteH2HAnalysis(fixture);
            
            predictions.push({
              fixture: fixture,
              prediction: prediction,
              h2h: h2hAnalysis,
              confidence: this.calculateConfidenceWithH2H(prediction, h2hAnalysis),
              recommendation: this.generateRecommendationWithH2H(prediction, h2hAnalysis)
            });
          }
        } catch (error) {
          console.error(`Erro ao obter predição para fixture ${fixture.fixture.id}:`, error.message);
        }
      }

      return predictions;
    } catch (error) {
      console.error('Erro ao obter predições da liga:', error.message);
      return [];
    }
  }

  // Calcular nível de confiança baseado nos dados da API
  calculateConfidence(prediction) {
    if (!prediction || !prediction.predictions) {
      return 'baixa';
    }

    const { percent, comparison } = prediction.predictions;
    
    // Análise das porcentagens
    const homePercent = parseInt(percent?.home) || 0;
    const awayPercent = parseInt(percent?.away) || 0;
    const drawPercent = parseInt(percent?.draw) || 0;
    
    // Análise da comparação (com verificação de segurança)
    let formDiff = 0;
    let totalDiff = 0;
    
    if (comparison && comparison.form) {
      formDiff = Math.abs((parseInt(comparison.form.home) || 0) - (parseInt(comparison.form.away) || 0));
    }
    
    if (comparison && comparison.total) {
      totalDiff = Math.abs((parseFloat(comparison.total.home) || 0) - (parseFloat(comparison.total.away) || 0));
    }
    
    // NOVOS CRITÉRIOS MELHORADOS
    
    // Alta confiança - critérios mais realistas
    if (homePercent >= 65 || awayPercent >= 65) {
      return 'alta';
    }
    
    // Alta confiança com diferença significativa de forma
    if ((homePercent >= 55 || awayPercent >= 55) && (formDiff >= 15 || totalDiff >= 8)) {
      return 'alta';
    }
    
    // Média confiança - critérios mais flexíveis
    if (homePercent >= 45 || awayPercent >= 45) {
      return 'média';
    }
    
    // Média confiança com alguma diferença de forma
    if ((homePercent >= 35 || awayPercent >= 35) && (formDiff >= 10 || totalDiff >= 5)) {
      return 'média';
    }
    
    // Média confiança para jogos equilibrados com dados suficientes
    if (homePercent >= 30 && awayPercent >= 30 && drawPercent >= 30) {
      return 'média';
    }
    
    // Baixa confiança apenas para casos realmente incertos
    return 'baixa';
  }

  // Calcular confiança com dados H2H - lógica melhorada
  calculateConfidenceWithH2H(prediction, h2hAnalysis) {
    const baseConfidence = this.calculateConfidence(prediction);
    
    if (!h2hAnalysis || h2hAnalysis.error) {
      return baseConfidence;
    }

    const h2hConfidence = h2hAnalysis.confidence;
    
    // LÓGICA MELHORADA DE COMBINAÇÃO
    
    // Se qualquer um for alta, resultado é alta
    if (baseConfidence === 'alta' || h2hConfidence === 'alta') {
      return 'alta';
    }
    
    // Se ambos forem média, resultado é média
    if (baseConfidence === 'média' && h2hConfidence === 'média') {
      return 'média';
    }
    
    // Se um for média e outro baixa, favorecer média
    if (baseConfidence === 'média' || h2hConfidence === 'média') {
      return 'média';
    }
    
    // Se ambos forem baixa, mas temos dados H2H válidos, considerar média
    if (h2hAnalysis.stats && h2hAnalysis.stats.totalMatches >= 3) {
      return 'média';
    }
    
    return 'baixa';
  }

  // Gerar recomendação baseada na predição
  generateRecommendation(prediction) {
    if (!prediction || !prediction.predictions) {
      return 'Dados insuficientes para recomendação';
    }

    const { predictions } = prediction;
    const { winner, advice, percent, under_over, goals } = predictions;
    
    let recommendation = '';
    
    // Recomendação do vencedor
    if (winner && winner.comment) {
      recommendation += `Vencedor: ${winner.name} (${winner.comment})`;
    }
    
    // Recomendação de gols
    if (under_over) {
      recommendation += ` | Gols: ${under_over}`;
    }
    
    // Recomendação específica
    if (advice) {
      recommendation += ` | ${advice}`;
    }
    
    // Porcentagens
    if (percent) {
      recommendation += ` | Probabilidades: Casa ${percent.home || 'N/A'}, Empate ${percent.draw || 'N/A'}, Fora ${percent.away || 'N/A'}`;
    }
    
    return recommendation || 'Análise em andamento';
  }

  // Gerar recomendação com dados H2H - versão simplificada
  generateRecommendationWithH2H(prediction, h2hAnalysis) {
    if (!prediction || !prediction.predictions) {
      return 'Dados insuficientes para recomendação';
    }

    const { predictions } = prediction;
    const { winner, advice, percent, under_over, goals } = predictions;
    
    // Determinar a melhor oportunidade de aposta
    let bestBet = this.getBestBettingOpportunity(prediction, h2hAnalysis);
    
    return bestBet;
  }

  // Determinar a melhor oportunidade de aposta - FOCADO APENAS EM OVER/UNDER
  getBestBettingOpportunity(prediction, h2hAnalysis) {
    const { predictions } = prediction;
    const { under_over, goals } = predictions;
    
    console.log('🔍 getBestBettingOpportunity - H2H Analysis:', h2hAnalysis);
    console.log('🔍 getBestBettingOpportunity - Under/Over:', under_over);
    
    // Prioridade 1: Over/Under gols com margem de segurança
    let h2hStats = null;
    
    if (h2hAnalysis && h2hAnalysis.stats) {
      h2hStats = h2hAnalysis.stats;
    } else if (h2hAnalysis && h2hAnalysis.h2h && h2hAnalysis.h2h.analysis) {
      h2hStats = h2hAnalysis.h2h.analysis;
    }
    
    if (h2hStats) {
      const { averageGoals, totalMatches } = h2hStats;
      
      console.log(`🔍 H2H Stats - averageGoals: ${averageGoals}, totalMatches: ${totalMatches}`);
      
      if (totalMatches >= 2) {
        if (averageGoals >= 3.5) {
          console.log('✅ Retornando Over 2.5 gols (H2H alta média)');
          return `Over 2.5 gols (H2H média: ${averageGoals.toFixed(1)} gols)`;
        } else if (averageGoals >= 2.5) {
          console.log('✅ Retornando Over 1.5 gols (H2H média)');
          return `Over 1.5 gols (H2H média: ${averageGoals.toFixed(1)} gols)`;
        } else if (averageGoals <= 1.5) {
          console.log('✅ Retornando Under 2.5 gols (H2H baixa média)');
          return `Under 2.5 gols (H2H média: ${averageGoals.toFixed(1)} gols)`;
        } else if (averageGoals <= 2.0) {
          console.log('✅ Retornando Under 3.5 gols (H2H baixa média)');
          return `Under 3.5 gols (H2H média: ${averageGoals.toFixed(1)} gols)`;
        }
      } else {
        console.log(`⚠️ H2H totalMatches insuficiente: ${totalMatches}`);
      }
    } else {
      console.log('⚠️ H2H Analysis ou stats não disponíveis');
    }
    
    // Prioridade 2: Over/Under gols baseado na API
    if (under_over && under_over.includes('Over')) {
      return `Over 2.5 gols (API recomendação)`;
    } else if (under_over && under_over.includes('Under')) {
      return `Under 2.5 gols (API recomendação)`;
    }
    
    // Prioridade 3: Over/Under escanteios
    if (h2hStats && h2hStats.averageCorners) {
      const { averageCorners, totalMatches } = h2hStats;
      
      if (totalMatches >= 3) {
        if (averageCorners >= 8.0) {
          return `Over 7.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners >= 7.0) {
          return `Over 6.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners >= 6.0) {
          return `Over 5.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners <= 4.5) {
          return `Under 5.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners <= 5.5) {
          return `Under 6.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        }
      }
    }
    
    // Prioridade 3: Over/Under escanteios - NOVA PRIORIDADE ALTA
    if (h2hStats && h2hStats.averageCorners) {
      const { averageCorners, totalMatches, cornerTrends } = h2hStats;
      
      if (totalMatches >= 3) {
        if (averageCorners >= 8.5) {
          return `Over 8.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners >= 7.5) {
          return `Over 7.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners >= 6.5) {
          return `Over 6.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners >= 5.5) {
          return `Over 5.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners >= 4.5) {
          return `Over 4.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners <= 4.0) {
          return `Under 4.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners <= 5.0) {
          return `Under 5.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        } else if (averageCorners <= 6.0) {
          return `Under 6.5 escanteios (H2H média: ${averageCorners.toFixed(1)} escanteios)`;
        }
      }
      
      // Análise de padrões de distribuição
      if (cornerTrends && totalMatches >= 3) {
        const balancedRatio = cornerTrends.balanced / totalMatches;
        const homeDominantRatio = cornerTrends.homeDominant / totalMatches;
        const awayDominantRatio = cornerTrends.awayDominant / totalMatches;
        
        if (balancedRatio >= 0.6) {
          return `Over 5.5 escanteios (H2H distribuição equilibrada: ${(balancedRatio * 100).toFixed(0)}%)`;
        } else if (homeDominantRatio >= 0.5) {
          return `Over 6.5 escanteios (H2H vantagem da casa: ${(homeDominantRatio * 100).toFixed(0)}%)`;
        } else if (awayDominantRatio >= 0.5) {
          return `Over 6.5 escanteios (H2H pressão do visitante: ${(awayDominantRatio * 100).toFixed(0)}%)`;
        }
      }
    }
    
    // Prioridade 4: Over/Under cartões
    if (h2hStats && h2hStats.averageCards) {
      const { averageCards, totalMatches } = h2hStats;
      
      if (totalMatches >= 3) {
        if (averageCards >= 6.0) {
          return `Over 5.5 cartões (H2H média: ${averageCards.toFixed(1)} cartões)`;
        } else if (averageCards >= 5.0) {
          return `Over 4.5 cartões (H2H média: ${averageCards.toFixed(1)} cartões)`;
        } else if (averageCards >= 4.0) {
          return `Over 3.5 cartões (H2H média: ${averageCards.toFixed(1)} cartões)`;
        } else if (averageCards <= 2.5) {
          return `Under 3.5 cartões (H2H média: ${averageCards.toFixed(1)} cartões)`;
        } else if (averageCards <= 3.5) {
          return `Under 4.5 cartões (H2H média: ${averageCards.toFixed(1)} cartões)`;
        }
      }
    }
    
    // Prioridade 5: Over/Under finalizações
    if (h2hStats && h2hStats.averageShots) {
      const { averageShots, totalMatches } = h2hStats;
      
      if (totalMatches >= 3) {
        if (averageShots >= 13.0) {
          return `Over 12.5 finalizações (H2H média: ${averageShots.toFixed(1)} finalizações)`;
        } else if (averageShots >= 12.0) {
          return `Over 11.5 finalizações (H2H média: ${averageShots.toFixed(1)} finalizações)`;
        } else if (averageShots >= 10.0) {
          return `Over 9.5 finalizações (H2H média: ${averageShots.toFixed(1)} finalizações)`;
        } else if (averageShots <= 8.0) {
          return `Under 9.5 finalizações (H2H média: ${averageShots.toFixed(1)} finalizações)`;
        } else if (averageShots <= 9.0) {
          return `Under 10.5 finalizações (H2H média: ${averageShots.toFixed(1)} finalizações)`;
        }
      }
    }
    
    // Fallback: análise genérica de gols
    if (h2hStats && h2hStats.averageGoals) {
      const { averageGoals } = h2hStats;
      console.log(`🔍 Fallback - averageGoals: ${averageGoals}`);
      if (averageGoals >= 2.5) {
        console.log('✅ Retornando Over 1.5 gols (fallback)');
        return `Over 1.5 gols (média histórica: ${averageGoals.toFixed(1)} gols)`;
      } else {
        console.log('✅ Retornando Under 2.5 gols (fallback)');
        return `Under 2.5 gols (média histórica: ${averageGoals.toFixed(1)} gols)`;
      }
    }
    
    console.log('❌ Nenhuma análise encontrada, retornando fallback genérico');
    return 'Análise over/under em andamento';
  }

  // Análise completa de um jogo
  async getCompleteAnalysis(fixtureId) {
    try {
      const prediction = await this.getApiPredictions(fixtureId);
      
      if (!prediction) {
        return {
          error: 'Não foi possível obter predições para este jogo'
        };
      }

      const { predictions, teams, comparison, h2h } = prediction;
      
      return {
        fixture: {
          id: fixtureId,
          home: teams.home.name,
          away: teams.away.name,
          league: prediction.league.name
        },
        predictions: {
          winner: predictions.winner,
          winOrDraw: predictions.win_or_draw,
          underOver: predictions.under_over,
          goals: predictions.goals,
          advice: predictions.advice,
          percent: predictions.percent
        },
        teamStats: {
          home: {
            form: teams.home?.last_5?.form || 'N/A',
            attack: teams.home?.last_5?.att || 'N/A',
            defense: teams.home?.last_5?.def || 'N/A',
            goalsFor: teams.home?.last_5?.goals?.for?.average || 'N/A',
            goalsAgainst: teams.home?.last_5?.goals?.against?.average || 'N/A'
          },
          away: {
            form: teams.away?.last_5?.form || 'N/A',
            attack: teams.away?.last_5?.att || 'N/A',
            defense: teams.away?.last_5?.def || 'N/A',
            goalsFor: teams.away?.last_5?.goals?.for?.average || 'N/A',
            goalsAgainst: teams.away?.last_5?.goals?.against?.average || 'N/A'
          }
        },
        comparison: comparison,
        h2h: h2h ? h2h.slice(0, 5) : [], // Últimos 5 confrontos
        confidence: this.calculateConfidence(prediction),
        recommendation: this.generateRecommendation(prediction),
        riskLevel: this.calculateRiskLevel(prediction),
        bestBets: this.suggestBestBets(prediction)
      };
    } catch (error) {
      console.error('Erro na análise completa:', error.message);
      return {
        error: 'Erro ao analisar o jogo'
      };
    }
  }

  // Calcular nível de risco
  calculateRiskLevel(prediction) {
    if (!prediction || !prediction.predictions) {
      return 'alto';
    }

    const { percent } = prediction.predictions;
    const homePercent = parseInt(percent?.home) || 0;
    const awayPercent = parseInt(percent?.away) || 0;
    const drawPercent = parseInt(percent?.draw) || 0;
    
    const maxPercent = Math.max(homePercent, awayPercent, drawPercent);
    
    if (maxPercent >= 70) return 'baixo';
    if (maxPercent >= 50) return 'médio';
    return 'alto';
  }

  // Sugerir melhores apostas
  suggestBestBets(prediction) {
    if (!prediction || !prediction.predictions) {
      return [];
    }

    const { predictions } = prediction;
    const bets = [];
    
    // Aposta no vencedor se confiança alta
    if (predictions.winner && this.calculateConfidence(prediction) === 'alta') {
      bets.push({
        type: 'Vencedor',
        selection: predictions.winner.name,
        confidence: 'alta'
      });
    }
    
    // Aposta em gols se recomendação clara
    if (predictions.under_over) {
      bets.push({
        type: 'Gols',
        selection: predictions.under_over,
        confidence: 'média'
      });
    }
    
    // Aposta combinada se disponível
    if (predictions.advice && predictions.advice.includes('Combo')) {
      bets.push({
        type: 'Combinada',
        selection: predictions.advice,
        confidence: 'média'
      });
    }
    
    return bets;
  }

  // Predições em tempo real (para jogos ao vivo)
  async getLivePredictions() {
    try {
      const liveFixtures = await this.apiService.getLiveFixtures();
      
      if (!liveFixtures.response || liveFixtures.response.length === 0) {
        console.log('🔥 Nenhum jogo ao vivo encontrado');
        return [];
      }

      console.log(`🔥 Encontrados ${liveFixtures.response.length} jogos ao vivo`);
      
      // Filtrar apenas jogos que estão realmente ao vivo (não finalizados)
      const trulyLiveFixtures = liveFixtures.response.filter(fixture => {
        const status = fixture.fixture?.status?.short;
        const isLive = status === '1H' || status === '2H' || status === 'HT' || status === 'ET' || status === 'P';
        const isFinished = status === 'FT' || status === 'AET' || status === 'PEN';
        
        if (isFinished) {
          console.log(`⏭️ Pular jogo finalizado: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (status: ${status})`);
          return false;
        }
        
        if (!isLive) {
          console.log(`⏭️ Pular jogo não ao vivo: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (status: ${status})`);
          return false;
        }
        
        return true;
      });
      
      console.log(`🔥 ${trulyLiveFixtures.length} jogos realmente ao vivo`);
      
      if (trulyLiveFixtures.length === 0) {
        console.log('🔥 Nenhum jogo realmente ao vivo encontrado');
        return [];
      }
      
      const predictions = [];
      
      for (const fixture of trulyLiveFixtures) {
        try {
          console.log(`🔍 Analisando ao vivo: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (status: ${fixture.fixture?.status?.short})`);
          
          const prediction = await this.getApiPredictions(fixture.fixture.id);
          if (prediction) {
            // Adicionar análise H2H
            const h2hAnalysis = await this.h2hService.getCompleteH2HAnalysis(fixture);
            
            const confidence = this.calculateConfidenceWithH2H(prediction, h2hAnalysis);
            const recommendation = this.generateRecommendationWithH2H(prediction, h2hAnalysis);
            
            console.log(`✅ Predição ao vivo gerada: ${recommendation} (${confidence})`);
            
            predictions.push({
              fixture: fixture,
              prediction: prediction,
              h2h: h2hAnalysis,
              confidence: confidence,
              recommendation: recommendation,
              live: true
            });
          } else {
            console.log(`❌ Sem predição da API para jogo ao vivo: ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
          }
        } catch (error) {
          console.error(`Erro ao obter predição ao vivo para fixture ${fixture.fixture.id}:`, error.message);
        }
      }

      console.log(`📊 Total de predições ao vivo geradas: ${predictions.length}`);
      return predictions;
    } catch (error) {
      console.error('Erro ao obter predições ao vivo:', error.message);
      return [];
    }
  }
}

module.exports = PredictionService;
