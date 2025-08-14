const axios = require('axios');
const cacheService = require('./cacheService');
const fixtureStatisticsService = require('./fixtureStatisticsService');

class AdvancedAnalysisService {
  constructor() {
    this.baseURL = process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io';
    this.apiKey = process.env.API_SPORTS_KEY;
  }

  /**
   * 🎯 Análise completa de uma fixture com dados avançados
   * @param {number} fixtureId - ID da fixture
   * @returns {Object} Análise completa
   */
  async getCompleteFixtureAnalysis(fixtureId) {
    try {
      console.log(`🔍 Iniciando análise avançada para fixture ${fixtureId}`);
      
      // Buscar dados em paralelo para otimizar performance
      const [
        fixtureData,
        homeStats,
        awayStats,
        h2hData
      ] = await Promise.all([
        this.getFixtureDetails(fixtureId),
        this.getTeamStatistics(fixtureId, 'home'),
        this.getTeamStatistics(fixtureId, 'away'),
        this.getH2HAnalysis(fixtureId)
      ]);

      // Buscar análises de forma separadamente
      const homeRecentForm = await this.analyzeRecentForm(fixtureId, 'home');
      const awayRecentForm = await this.analyzeRecentForm(fixtureId, 'away');

      // Gerar análise completa
      const analysis = {
        fixture: fixtureData,
        attackAnalysis: this.analyzeAttack(homeStats, awayStats),
        defenseAnalysis: this.analyzeDefense(homeStats, awayStats),
        setPieceAnalysis: this.analyzeSetPieces(homeStats, awayStats),
        timingAnalysis: this.analyzeTiming(fixtureData),
        formAnalysis: {
          home: homeRecentForm,
          away: awayRecentForm
        },
        h2hAnalysis: h2hData,
        overUnderAnalysis: this.analyzeOverUnder(homeRecentForm, awayRecentForm),
        bettingInsights: this.generateBettingInsights({
          attack: this.analyzeAttack(homeStats, awayStats),
          defense: this.analyzeDefense(homeStats, awayStats),
          form: {
            home: homeRecentForm,
            away: awayRecentForm
          },
          h2h: h2hData,
          timing: this.analyzeTiming(fixtureData)
        }),
        riskAssessment: this.assessRisk({
          attack: this.analyzeAttack(homeStats, awayStats),
          defense: this.analyzeDefense(homeStats, awayStats),
          form: {
            home: homeRecentForm,
            away: awayRecentForm
          },
          h2h: h2hData
        })
      };

      return {
        success: true,
        data: analysis,
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
   * 📊 Análise de Ataque - Taxa de conversão, chutes, finalizações
   */
  analyzeAttack(homeStats, awayStats) {
    const analysis = {
      home: {
        conversionRate: 0,
        shotsPerGame: 0,
        shotsOnTarget: 0,
        efficiency: 0,
        strength: 'Média'
      },
      away: {
        conversionRate: 0,
        shotsPerGame: 0,
        shotsOnTarget: 0,
        efficiency: 0,
        strength: 'Média'
      },
      comparison: {
        homeAdvantage: 0,
        keyInsights: []
      }
    };

    // Análise do time da casa
    if (homeStats && homeStats.shots) {
      const totalShots = homeStats.shots.total || 0;
      const shotsOnTarget = homeStats.shots.on || 0;
      const shotsInsideBox = homeStats.shotsInsideBox || 0;
      const shotsOutsideBox = homeStats.shotsOutsideBox || 0;
      
      analysis.home.shotsPerGame = totalShots;
      analysis.home.shotsOnTarget = shotsOnTarget;
      
      // Taxa de conversão baseada em finalizações no alvo
      analysis.home.conversionRate = totalShots > 0 ? ((shotsOnTarget / totalShots) * 100).toFixed(1) : 0;
      analysis.home.efficiency = totalShots > 0 ? ((shotsOnTarget / totalShots) * 100).toFixed(1) : 0;
      
      // Classificar força do ataque baseado em múltiplos fatores
      let attackScore = 0;
      if (totalShots >= 15) attackScore += 3;
      else if (totalShots >= 10) attackScore += 2;
      else if (totalShots >= 5) attackScore += 1;
      
      if (shotsOnTarget >= 8) attackScore += 3;
      else if (shotsOnTarget >= 5) attackScore += 2;
      else if (shotsOnTarget >= 3) attackScore += 1;
      
      if (shotsInsideBox >= 8) attackScore += 2;
      else if (shotsInsideBox >= 5) attackScore += 1;
      
      if (attackScore >= 7) analysis.home.strength = 'Excelente';
      else if (attackScore >= 4) analysis.home.strength = 'Boa';
      else if (attackScore >= 2) analysis.home.strength = 'Média';
      else analysis.home.strength = 'Fraca';
    }

    // Análise do time visitante
    if (awayStats && awayStats.shots) {
      const totalShots = awayStats.shots.total || 0;
      const shotsOnTarget = awayStats.shots.on || 0;
      const shotsInsideBox = awayStats.shotsInsideBox || 0;
      const shotsOutsideBox = awayStats.shotsOutsideBox || 0;
      
      analysis.away.shotsPerGame = totalShots;
      analysis.away.shotsOnTarget = shotsOnTarget;
      
      // Taxa de conversão baseada em finalizações no alvo
      analysis.away.conversionRate = totalShots > 0 ? ((shotsOnTarget / totalShots) * 100).toFixed(1) : 0;
      analysis.away.efficiency = totalShots > 0 ? ((shotsOnTarget / totalShots) * 100).toFixed(1) : 0;
      
      // Classificar força do ataque baseado em múltiplos fatores
      let attackScore = 0;
      if (totalShots >= 15) attackScore += 3;
      else if (totalShots >= 10) attackScore += 2;
      else if (totalShots >= 5) attackScore += 1;
      
      if (shotsOnTarget >= 8) attackScore += 3;
      else if (shotsOnTarget >= 5) attackScore += 2;
      else if (shotsOnTarget >= 3) attackScore += 1;
      
      if (shotsInsideBox >= 8) attackScore += 2;
      else if (shotsInsideBox >= 5) attackScore += 1;
      
      if (attackScore >= 7) analysis.away.strength = 'Excelente';
      else if (attackScore >= 4) analysis.away.strength = 'Boa';
      else if (attackScore >= 2) analysis.away.strength = 'Média';
      else analysis.away.strength = 'Fraca';
    }

    // Comparação
    analysis.comparison.homeAdvantage = analysis.home.shotsOnTarget - analysis.away.shotsOnTarget;
    
    if (analysis.home.shotsOnTarget > analysis.away.shotsOnTarget * 1.5) {
      analysis.comparison.keyInsights.push('Time da casa tem ataque significativamente superior');
    } else if (analysis.away.shotsOnTarget > analysis.home.shotsOnTarget * 1.5) {
      analysis.comparison.keyInsights.push('Time visitante tem ataque significativamente superior');
    }

    if (analysis.home.shotsOnTarget > analysis.away.shotsOnTarget * 1.3) {
      analysis.comparison.keyInsights.push('Time da casa tem melhor precisão de finalização');
    }

    return analysis;
  }

  /**
   * 🛡️ Análise de Defesa - Gols sofridos, escanteios, faltas
   */
  analyzeDefense(homeStats, awayStats) {
    const analysis = {
      home: {
        goalsConceded: 0,
        cornersConceded: 0,
        foulsCommitted: 0,
        defensiveEfficiency: 0,
        strength: 'Média'
      },
      away: {
        goalsConceded: 0,
        cornersConceded: 0,
        foulsCommitted: 0,
        defensiveEfficiency: 0,
        strength: 'Média'
      },
      comparison: {
        homeAdvantage: 0,
        keyInsights: []
      }
    };

    // Análise da defesa do time da casa
    if (homeStats) {
      analysis.home.foulsCommitted = homeStats.fouls?.committed || 0;
      analysis.home.cornersConceded = homeStats.corners?.won || 0; // Escanteios ganhos pelo oponente
      analysis.home.goalsConceded = homeStats.goalsConceded || 0; // Gols sofridos calculados
      analysis.home.goalkeeperSaves = homeStats.goalkeeperSaves || 0;
      analysis.home.yellowCards = homeStats.yellowCards || 0;
      analysis.home.redCards = homeStats.redCards || 0;
      
      // Eficiência defensiva baseada em múltiplos fatores
      let defenseScore = 0;
      
      // Menos gols sofridos = melhor defesa (mais importante)
      if (analysis.home.goalsConceded === 0) defenseScore += 5;
      else if (analysis.home.goalsConceded <= 1) defenseScore += 3;
      else if (analysis.home.goalsConceded <= 2) defenseScore += 1;
      
      // Menos faltas = melhor defesa
      if (analysis.home.foulsCommitted <= 10) defenseScore += 3;
      else if (analysis.home.foulsCommitted <= 15) defenseScore += 2;
      else if (analysis.home.foulsCommitted <= 20) defenseScore += 1;
      
      // Mais defesas = melhor defesa
      if (analysis.home.goalkeeperSaves >= 5) defenseScore += 3;
      else if (analysis.home.goalkeeperSaves >= 3) defenseScore += 2;
      else if (analysis.home.goalkeeperSaves >= 1) defenseScore += 1;
      
      // Menos cartões = melhor disciplina
      if (analysis.home.yellowCards <= 1) defenseScore += 2;
      else if (analysis.home.yellowCards <= 3) defenseScore += 1;
      
      if (analysis.home.redCards === 0) defenseScore += 1;
      
      analysis.home.defensiveEfficiency = Math.min(100, defenseScore * 7); // Ajustado para dar mais peso aos gols
      
      if (analysis.home.defensiveEfficiency >= 80) analysis.home.strength = 'Excelente';
      else if (analysis.home.defensiveEfficiency >= 60) analysis.home.strength = 'Boa';
      else if (analysis.home.defensiveEfficiency >= 40) analysis.home.strength = 'Média';
      else analysis.home.strength = 'Fraca';
    }

    // Análise da defesa do time visitante
    if (awayStats) {
      analysis.away.foulsCommitted = awayStats.fouls?.committed || 0;
      analysis.away.cornersConceded = awayStats.corners?.won || 0; // Escanteios ganhos pelo oponente
      analysis.away.goalsConceded = awayStats.goalsConceded || 0; // Gols sofridos calculados
      analysis.away.goalkeeperSaves = awayStats.goalkeeperSaves || 0;
      analysis.away.yellowCards = awayStats.yellowCards || 0;
      analysis.away.redCards = awayStats.redCards || 0;
      
      // Eficiência defensiva baseada em múltiplos fatores
      let defenseScore = 0;
      
      // Menos gols sofridos = melhor defesa (mais importante)
      if (analysis.away.goalsConceded === 0) defenseScore += 5;
      else if (analysis.away.goalsConceded <= 1) defenseScore += 3;
      else if (analysis.away.goalsConceded <= 2) defenseScore += 1;
      
      // Menos faltas = melhor defesa
      if (analysis.away.foulsCommitted <= 10) defenseScore += 3;
      else if (analysis.away.foulsCommitted <= 15) defenseScore += 2;
      else if (analysis.away.foulsCommitted <= 20) defenseScore += 1;
      
      // Mais defesas = melhor defesa
      if (analysis.away.goalkeeperSaves >= 5) defenseScore += 3;
      else if (analysis.away.goalkeeperSaves >= 3) defenseScore += 2;
      else if (analysis.away.goalkeeperSaves >= 1) defenseScore += 1;
      
      // Menos cartões = melhor disciplina
      if (analysis.away.yellowCards <= 1) defenseScore += 2;
      else if (analysis.away.yellowCards <= 3) defenseScore += 1;
      
      if (analysis.away.redCards === 0) defenseScore += 1;
      
      analysis.away.defensiveEfficiency = Math.min(100, defenseScore * 7); // Ajustado para dar mais peso aos gols
      
      if (analysis.away.defensiveEfficiency >= 80) analysis.away.strength = 'Excelente';
      else if (analysis.away.defensiveEfficiency >= 60) analysis.away.strength = 'Boa';
      else if (analysis.away.defensiveEfficiency >= 40) analysis.away.strength = 'Média';
      else analysis.away.strength = 'Fraca';
    }

    // Comparação
    analysis.comparison.homeAdvantage = analysis.home.defensiveEfficiency - analysis.away.defensiveEfficiency;
    
    if (analysis.home.defensiveEfficiency > analysis.away.defensiveEfficiency + 20) {
      analysis.comparison.keyInsights.push('Time da casa tem defesa significativamente melhor');
    } else if (analysis.away.defensiveEfficiency > analysis.home.defensiveEfficiency + 20) {
      analysis.comparison.keyInsights.push('Time visitante tem defesa significativamente melhor');
    }

    if (analysis.home.foulsCommitted > analysis.away.foulsCommitted * 1.5) {
      analysis.comparison.keyInsights.push('Time da casa comete mais faltas (risco de cartões)');
    }

    return analysis;
  }

  /**
   * ⚽ Análise de Bola Parada - Escanteios, faltas perigosas
   */
  analyzeSetPieces(homeStats, awayStats) {
    const analysis = {
      home: {
        cornersWon: 0,
        cornersConceded: 0,
        foulsWon: 0,
        setPieceEfficiency: 0,
        strength: 'Média'
      },
      away: {
        cornersWon: 0,
        cornersConceded: 0,
        foulsWon: 0,
        setPieceEfficiency: 0,
        strength: 'Média'
      },
      comparison: {
        homeAdvantage: 0,
        keyInsights: []
      }
    };

    // Análise do time da casa
    if (homeStats) {
      analysis.home.cornersWon = homeStats.corners?.won || 0;
      analysis.home.cornersConceded = homeStats.corners?.conceded || 0;
      analysis.home.foulsWon = homeStats.fouls?.won || 0;
      
      // Eficiência de bola parada
      const totalSetPieces = analysis.home.cornersWon + analysis.home.foulsWon;
      analysis.home.setPieceEfficiency = totalSetPieces > 0 ? (analysis.home.cornersWon / totalSetPieces) * 100 : 0;
      
      if (analysis.home.setPieceEfficiency >= 60) analysis.home.strength = 'Excelente';
      else if (analysis.home.setPieceEfficiency >= 40) analysis.home.strength = 'Boa';
      else if (analysis.home.setPieceEfficiency >= 20) analysis.home.strength = 'Média';
      else analysis.home.strength = 'Fraca';
    }

    // Análise do time visitante
    if (awayStats) {
      analysis.away.cornersWon = awayStats.corners?.won || 0;
      analysis.away.cornersConceded = awayStats.corners?.conceded || 0;
      analysis.away.foulsWon = awayStats.fouls?.won || 0;
      
      const totalSetPieces = analysis.away.cornersWon + analysis.away.foulsWon;
      analysis.away.setPieceEfficiency = totalSetPieces > 0 ? (analysis.away.cornersWon / totalSetPieces) * 100 : 0;
      
      if (analysis.away.setPieceEfficiency >= 60) analysis.away.strength = 'Excelente';
      else if (analysis.away.setPieceEfficiency >= 40) analysis.away.strength = 'Boa';
      else if (analysis.away.setPieceEfficiency >= 20) analysis.away.strength = 'Média';
      else analysis.away.strength = 'Fraca';
    }

    // Comparação
    analysis.comparison.homeAdvantage = analysis.home.setPieceEfficiency - analysis.away.setPieceEfficiency;
    
    if (analysis.home.cornersWon > analysis.away.cornersWon * 1.5) {
      analysis.comparison.keyInsights.push('Time da casa domina escanteios');
    }

    if (analysis.home.foulsWon > analysis.away.foulsWon * 1.3) {
      analysis.comparison.keyInsights.push('Time da casa ganha mais faltas perigosas');
    }

    return analysis;
  }

  /**
   * ⏰ Análise de Timing - Gols por período do jogo
   */
  analyzeTiming(fixtureData) {
    const analysis = {
      home: {
        firstHalfGoals: 0,
        secondHalfGoals: 0,
        earlyGoals: 0, // 0-15 min
        lateGoals: 0,  // 75+ min
        timingPattern: 'Equilibrado'
      },
      away: {
        firstHalfGoals: 0,
        secondHalfGoals: 0,
        earlyGoals: 0,
        lateGoals: 0,
        timingPattern: 'Equilibrado'
      },
      insights: []
    };

    if (fixtureData && fixtureData.periods) {
      const periods = fixtureData.periods;
      
      // Análise do time da casa
      if (periods.first && periods.first.home !== null) {
        analysis.home.firstHalfGoals = periods.first.home;
      }
      if (periods.second && periods.second.home !== null) {
        analysis.home.secondHalfGoals = periods.second.home;
      }
      
      // Análise do time visitante
      if (periods.first && periods.first.away !== null) {
        analysis.away.firstHalfGoals = periods.first.away;
      }
      if (periods.second && periods.second.away !== null) {
        analysis.away.secondHalfGoals = periods.second.away;
      }
    }

    // Determinar padrão de timing
    if (analysis.home.firstHalfGoals > analysis.home.secondHalfGoals * 1.5) {
      analysis.home.timingPattern = 'Primeiro Tempo';
    } else if (analysis.home.secondHalfGoals > analysis.home.firstHalfGoals * 1.5) {
      analysis.home.timingPattern = 'Segundo Tempo';
    }

    if (analysis.away.firstHalfGoals > analysis.away.secondHalfGoals * 1.5) {
      analysis.away.timingPattern = 'Primeiro Tempo';
    } else if (analysis.away.secondHalfGoals > analysis.away.firstHalfGoals * 1.5) {
      analysis.away.timingPattern = 'Segundo Tempo';
    }

    // Insights
    if (analysis.home.timingPattern === 'Primeiro Tempo' && analysis.away.timingPattern === 'Primeiro Tempo') {
      analysis.insights.push('Ambos os times tendem a marcar no primeiro tempo');
    } else if (analysis.home.timingPattern === 'Segundo Tempo' && analysis.away.timingPattern === 'Segundo Tempo') {
      analysis.insights.push('Ambos os times tendem a marcar no segundo tempo');
    }

    return analysis;
  }

  /**
   * 📈 Análise de Forma Recente - Últimos jogos
   */
  async analyzeRecentForm(fixtureId, teamType) {
    try {
      const recentFixtures = await this.getTeamRecentFixtures(fixtureId, teamType, 10);
      
      const analysis = {
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        failedToScore: 0,
        form: 'Média',
        trend: 'Estável'
      };

      recentFixtures.forEach(fixture => {
        const isHome = fixture.teams.home.id === fixture.teams[teamType].id;
        const teamGoals = isHome ? fixture.goals.home : fixture.goals.away;
        const opponentGoals = isHome ? fixture.goals.away : fixture.goals.home;
        
        if (teamGoals > opponentGoals) {
          analysis.wins++;
        } else if (teamGoals === opponentGoals) {
          analysis.draws++;
        } else {
          analysis.losses++;
        }

        analysis.goalsFor += teamGoals || 0;
        analysis.goalsAgainst += opponentGoals || 0;

        if (opponentGoals === 0) analysis.cleanSheets++;
        if (teamGoals === 0) analysis.failedToScore++;
      });

      // Calcular forma
      const totalGames = analysis.wins + analysis.draws + analysis.losses;
      const winRate = totalGames > 0 ? (analysis.wins / totalGames) * 100 : 0;
      
      if (winRate >= 70) analysis.form = 'Excelente';
      else if (winRate >= 50) analysis.form = 'Boa';
      else if (winRate >= 30) analysis.form = 'Média';
      else analysis.form = 'Ruim';

      // Determinar tendência
      const recentGames = recentFixtures.slice(0, 5);
      const recentWins = recentGames.filter(fixture => {
        const isHome = fixture.teams.home.id === fixture.teams[teamType].id;
        const teamGoals = isHome ? fixture.goals.home : fixture.goals.away;
        const opponentGoals = isHome ? fixture.goals.away : fixture.goals.home;
        return teamGoals > opponentGoals;
      }).length;

      if (recentWins >= 4) analysis.trend = 'Ascendente';
      else if (recentWins <= 1) analysis.trend = 'Descendente';
      else analysis.trend = 'Estável';

      return analysis;

    } catch (error) {
      console.error(`❌ Erro ao analisar forma recente: ${error.message}`);
      return {
        wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0,
        cleanSheets: 0, failedToScore: 0,
        form: 'Desconhecida', trend: 'Desconhecida'
      };
    }
  }

  /**
   * 🎯 Análise Over/Under - Probabilidade histórica
   */
  analyzeOverUnder(homeRecentForm, awayRecentForm) {
    const analysis = {
      averageGoals: 0,
      over25Probability: 0,
      over35Probability: 0,
      under25Probability: 0,
      recommendation: 'Aguardar',
      confidence: 'Baixa'
    };

    // Verificar se temos dados válidos
    if (!homeRecentForm || !awayRecentForm) {
      console.log('⚠️ Dados de forma recente não disponíveis para análise Over/Under');
      return analysis;
    }

    // Calcular média de gols
    const totalGames = (homeRecentForm.wins + homeRecentForm.draws + homeRecentForm.losses) +
                      (awayRecentForm.wins + awayRecentForm.draws + awayRecentForm.losses);
    
    const totalGoals = homeRecentForm.goalsFor + homeRecentForm.goalsAgainst +
                      awayRecentForm.goalsFor + awayRecentForm.goalsAgainst;

    analysis.averageGoals = totalGames > 0 ? totalGoals / totalGames : 0;

    // Calcular probabilidades baseadas na média
    if (analysis.averageGoals >= 3.5) {
      analysis.over25Probability = 85;
      analysis.over35Probability = 70;
      analysis.under25Probability = 15;
      analysis.recommendation = 'Over 2.5';
      analysis.confidence = 'Alta';
    } else if (analysis.averageGoals >= 2.8) {
      analysis.over25Probability = 75;
      analysis.over35Probability = 50;
      analysis.under25Probability = 25;
      analysis.recommendation = 'Over 2.5';
      analysis.confidence = 'Média';
    } else if (analysis.averageGoals >= 2.2) {
      analysis.over25Probability = 60;
      analysis.over35Probability = 35;
      analysis.under25Probability = 40;
      analysis.recommendation = 'Over 2.5';
      analysis.confidence = 'Baixa';
    } else {
      analysis.over25Probability = 40;
      analysis.over35Probability = 20;
      analysis.under25Probability = 60;
      analysis.recommendation = 'Under 2.5';
      analysis.confidence = 'Média';
    }

    return analysis;
  }

  /**
   * 💰 Gerar Insights de Apostas
   */
  generateBettingInsights(analyses) {
    const insights = {
      recommendedBets: [],
      riskLevel: 'Médio',
      confidence: 'Média',
      keyFactors: [],
      avoidBets: []
    };

    // Verificar se analyses existe
    if (!analyses) {
      console.log('⚠️ Dados de análises não disponíveis para insights de apostas');
      return insights;
    }

    const { attack, defense, form, h2h, timing } = analyses;

    // Verificar se temos dados válidos antes de usar
    if (attack && attack.comparison && typeof attack.comparison.homeAdvantage === 'number') {
      if (attack.comparison.homeAdvantage > 10) {
        insights.recommendedBets.push('Vitória do time da casa');
        insights.keyFactors.push('Ataque superior do time da casa');
      } else if (attack.comparison.homeAdvantage < -10) {
        insights.recommendedBets.push('Vitória do time visitante');
        insights.keyFactors.push('Ataque superior do time visitante');
      }
    }

    // Análise de defesa
    if (defense && defense.comparison && typeof defense.comparison.homeAdvantage === 'number') {
      if (defense.comparison.homeAdvantage > 20) {
        insights.keyFactors.push('Defesa sólida do time da casa');
      } else if (defense.comparison.homeAdvantage < -20) {
        insights.keyFactors.push('Defesa vulnerável do time da casa');
      }
    }

    // Análise de forma
    if (form && form.home && form.away && form.home.form && form.away.form) {
      if (form.home.form === 'Excelente' && form.away.form === 'Ruim') {
        insights.recommendedBets.push('Vitória do time da casa');
        insights.confidence = 'Alta';
      } else if (form.away.form === 'Excelente' && form.home.form === 'Ruim') {
        insights.recommendedBets.push('Vitória do time visitante');
        insights.confidence = 'Alta';
      }
    }

    // Análise H2H
    if (h2h && typeof h2h.homeWins === 'number' && typeof h2h.awayWins === 'number') {
      if (h2h.homeWins > h2h.awayWins * 2) {
        insights.keyFactors.push('Histórico favorável ao time da casa');
      } else if (h2h.awayWins > h2h.homeWins * 2) {
        insights.keyFactors.push('Histórico favorável ao time visitante');
      }
    }

    // Determinar nível de risco
    if (insights.confidence === 'Alta' && insights.recommendedBets.length > 0) {
      insights.riskLevel = 'Baixo';
    } else if (insights.confidence === 'Baixa') {
      insights.riskLevel = 'Alto';
    }

    // Apostas a evitar
    if (form && form.home && form.away && form.home.form && form.away.form) {
      if (form.home.form === 'Ruim' && form.away.form === 'Ruim') {
        insights.avoidBets.push('Apostas em vitória (ambos em má fase)');
      }
    }

    if (attack && attack.home && attack.away && typeof attack.home.conversionRate === 'number' && typeof attack.away.conversionRate === 'number') {
      if (attack.home.conversionRate < 5 && attack.away.conversionRate < 5) {
        insights.avoidBets.push('Over 2.5 (ataques ineficientes)');
      }
    }

    return insights;
  }

  /**
   * ⚠️ Avaliação de Risco
   */
  assessRisk(analyses) {
    const riskFactors = [];
    let riskScore = 50; // Score base (0-100, menor = mais seguro)

    // Verificar se analyses existe
    if (!analyses) {
      console.log('⚠️ Dados de análises não disponíveis para avaliação de risco');
      return {
        score: riskScore,
        level: 'Médio',
        factors: ['Dados insuficientes'],
        recommendation: 'Apostas moderadas'
      };
    }

    const { attack, defense, form, h2h } = analyses;

    // Fatores de risco
    if (form && form.home && form.away && form.home.form && form.away.form) {
      if (form.home.form === 'Ruim' && form.away.form === 'Ruim') {
        riskFactors.push('Ambos os times em má fase');
        riskScore += 20;
      }
    }

    if (attack && attack.home && attack.away && typeof attack.home.conversionRate === 'number' && typeof attack.away.conversionRate === 'number') {
      if (attack.home.conversionRate < 5 || attack.away.conversionRate < 5) {
        riskFactors.push('Ataques ineficientes');
        riskScore += 15;
      }
    }

    if (defense && defense.home && defense.away && typeof defense.home.defensiveEfficiency === 'number' && typeof defense.away.defensiveEfficiency === 'number') {
      if (defense.home.defensiveEfficiency < 40 || defense.away.defensiveEfficiency < 40) {
        riskFactors.push('Defesas vulneráveis');
        riskScore += 15;
      }
    }

    if (!h2h || typeof h2h.totalMatches !== 'number' || h2h.totalMatches < 3) {
      riskFactors.push('Pouco histórico H2H');
      riskScore += 10;
    }

    // Classificar risco
    let riskLevel = 'Médio';
    if (riskScore >= 80) riskLevel = 'Muito Alto';
    else if (riskScore >= 65) riskLevel = 'Alto';
    else if (riskScore >= 35) riskLevel = 'Médio';
    else if (riskScore >= 20) riskLevel = 'Baixo';
    else riskLevel = 'Muito Baixo';

    return {
      score: riskScore,
      level: riskLevel,
      factors: riskFactors,
      recommendation: riskScore >= 70 ? 'Evitar apostas' : 'Apostas moderadas'
    };
  }

  // ===== MÉTODOS AUXILIARES PARA BUSCAR DADOS =====

  async getFixtureDetails(fixtureId) {
    try {
      const response = await axios.get(`${this.baseURL}/fixtures`, {
        params: { id: fixtureId },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': this.apiKey
        }
      });

      return response.data.response?.[0] || null;
    } catch (error) {
      console.error(`❌ Erro ao buscar detalhes da fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  async getTeamStatistics(fixtureId, teamType) {
    try {
      console.log(`📊 Buscando estatísticas ${teamType} para fixture ${fixtureId}`);
      
      // Primeiro, buscar detalhes da fixture para obter os IDs dos times
      const fixtureDetails = await this.getFixtureDetails(fixtureId);
      if (!fixtureDetails) {
        console.log(`⚠️ Detalhes da fixture ${fixtureId} não encontrados`);
        return null;
      }

      const homeTeamId = fixtureDetails.teams?.home?.id;
      const awayTeamId = fixtureDetails.teams?.away?.id;
      
      if (!homeTeamId || !awayTeamId) {
        console.log(`⚠️ IDs dos times não encontrados para fixture ${fixtureId}`);
        return null;
      }

      // Buscar estatísticas do time específico
      const targetTeamId = teamType === 'home' ? homeTeamId : awayTeamId;
      const statistics = await fixtureStatisticsService.getFixtureStatistics(fixtureId, targetTeamId);
      
      if (!statistics || statistics.length === 0) {
        console.log(`⚠️ Estatísticas do time ${teamType} (ID: ${targetTeamId}) não encontradas para fixture ${fixtureId}`);
        return null;
      }

      // Pegar os dados do time específico
      const teamData = statistics[0]; // Deve ser o único time retornado quando especificamos teamId
      
      if (!teamData) {
        console.log(`⚠️ Dados do time ${teamType} não encontrados para fixture ${fixtureId}`);
        return null;
      }

      // Usar o método de extração do serviço de estatísticas
      const rawStats = fixtureStatisticsService.extractTeamStatistics(teamData);
      
      // Buscar estatísticas do time oponente para calcular gols sofridos
      const opponentTeamId = teamType === 'home' ? awayTeamId : homeTeamId;
      const opponentStats = await fixtureStatisticsService.getFixtureStatistics(fixtureId, opponentTeamId);
      
      let goalsConceded = 0;
      if (opponentStats && opponentStats.length > 0) {
        const opponentRawStats = fixtureStatisticsService.extractTeamStatistics(opponentStats[0]);
        // Assumir que os gols do oponente são os gols sofridos por este time
        // Como a API não retorna gols diretamente, vamos usar uma estimativa baseada em finalizações
        goalsConceded = Math.floor(opponentRawStats.shotsOnGoal * 0.3); // Estimativa: 30% das finalizações viram gols
      }
      
      // Converter para o formato esperado pela análise avançada
      const processedStats = {
        shots: { 
          total: rawStats.totalShots || 0, 
          on: rawStats.shotsOnGoal || 0, 
          off: rawStats.shotsOffGoal || 0 
        },
        fouls: { committed: rawStats.fouls || 0 },
        corners: { won: rawStats.cornerKicks || 0 },
        passes: { 
          total: rawStats.totalPasses || 0, 
          accurate: rawStats.passesAccurate || 0 
        },
        possession: rawStats.ballPossession || '0%',
        yellowCards: rawStats.yellowCards || 0,
        redCards: rawStats.redCards || 0,
        goalkeeperSaves: rawStats.goalkeeperSaves || 0,
        shotsInsideBox: rawStats.shotsInsideBox || 0,
        shotsOutsideBox: rawStats.shotsOutsideBox || 0,
        blockedShots: rawStats.blockedShots || 0,
        offsides: rawStats.offsides || 0,
        goalsConceded: goalsConceded
      };

      console.log(`✅ Estatísticas ${teamType} processadas:`, {
        shotsTotal: processedStats.shots.total,
        shotsOn: processedStats.shots.on,
        fouls: processedStats.fouls.committed,
        corners: processedStats.corners.won,
        goalsConceded: processedStats.goalsConceded
      });
      
      return processedStats;

    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas ${teamType} para fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  async getH2HAnalysis(fixtureId) {
    try {
      const fixture = await this.getFixtureDetails(fixtureId);
      if (!fixture) return null;

      const homeTeamId = fixture.teams.home.id;
      const awayTeamId = fixture.teams.away.id;

      const response = await axios.get(`${this.baseURL}/fixtures/headtohead`, {
        params: { h2h: `${homeTeamId}-${awayTeamId}`, last: 10 },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': this.apiKey
        }
      });

      const h2hData = response.data.response || [];
      
      return {
        totalMatches: h2hData.length,
        homeWins: h2hData.filter(match => match.teams.home.winner).length,
        awayWins: h2hData.filter(match => match.teams.away.winner).length,
        draws: h2hData.filter(match => !match.teams.home.winner && !match.teams.away.winner).length,
        averageGoals: h2hData.length > 0 ? 
          h2hData.reduce((sum, match) => sum + (match.goals.home + match.goals.away), 0) / h2hData.length : 0
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar H2H para fixture ${fixtureId}:`, error.message);
      return null;
    }
  }

  async getTeamRecentFixtures(fixtureId, teamType, limit = 10) {
    try {
      const fixture = await this.getFixtureDetails(fixtureId);
      if (!fixture) return [];

      const teamId = fixture.teams[teamType].id;

      const response = await axios.get(`${this.baseURL}/fixtures`, {
        params: { 
          team: teamId,
          last: limit,
          status: 'FT-AET-PEN'
        },
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': this.apiKey
        }
      });

      return response.data.response || [];
    } catch (error) {
      console.error(`❌ Erro ao buscar fixtures recentes ${teamType} para fixture ${fixtureId}:`, error.message);
      return [];
    }
  }
}

module.exports = new AdvancedAnalysisService();
