const statisticsService = require('./statisticsService');

class CornerAnalysisService {
  constructor() {
    this.thresholds = {
      highVolume: 8,      // Alto volume de escanteios
      mediumVolume: 6,    // Volume médio
      lowVolume: 4,       // Baixo volume
      veryLowVolume: 2    // Volume muito baixo
    };
    
    this.confidenceLevels = {
      alta: 0.8,      // 80% de confiança
      média: 0.6,     // 60% de confiança
      baixa: 0.4      // 40% de confiança
    };
  }

  /**
   * Analisa padrões de escanteios com IA
   */
  async analyzeCornerPatterns(fixtureId, historicalData = []) {
    try {
      console.log(`🔍 Analisando padrões de escanteios com IA para fixture ${fixtureId}`);
      
      // Buscar estatísticas atuais
      const currentStats = await statisticsService.getCornerKicksStatistics(fixtureId);
      if (!currentStats) {
        return this.generateDefaultAnalysis(fixtureId);
      }

      // Análise baseada em dados atuais
      const currentAnalysis = this.analyzeCurrentCornerStats(currentStats);
      
      // Análise baseada em dados históricos
      const historicalAnalysis = this.analyzeHistoricalCornerData(historicalData);
      
      // Análise de tendências
      const trendAnalysis = this.analyzeCornerTrends(currentStats, historicalData);
      
      // Análise de padrões de jogo
      const gamePatternAnalysis = this.analyzeGamePatterns(currentStats, historicalData);
      
      // Combinar todas as análises
      const combinedAnalysis = this.combineAnalyses(
        currentAnalysis,
        historicalAnalysis,
        trendAnalysis,
        gamePatternAnalysis
      );

      // Gerar recomendação final
      const finalRecommendation = this.generateFinalRecommendation(combinedAnalysis);
      
      return {
        fixtureId,
        timestamp: new Date().toISOString(),
        currentStats: currentStats,
        analysis: combinedAnalysis,
        recommendation: finalRecommendation,
        confidence: finalRecommendation.confidence,
        reasoning: finalRecommendation.reasoning,
        insights: finalRecommendation.insights
      };

    } catch (error) {
      console.error(`❌ Erro na análise de IA para escanteios:`, error.message);
      return this.generateDefaultAnalysis(fixtureId);
    }
  }

  /**
   * Analisa estatísticas atuais de escanteios
   */
  analyzeCurrentCornerStats(currentStats) {
    const analysis = {
      totalCorners: currentStats.totalCornerKicks,
      averagePerTeam: currentStats.totalCornerKicks / 2,
      volumeCategory: this.categorizeCornerVolume(currentStats.totalCornerKicks),
      teamDistribution: this.analyzeTeamDistribution(currentStats.teamStats),
      confidence: 'baixa'
    };

    // Determinar confiança baseada no volume
    if (currentStats.totalCornerKicks >= this.thresholds.highVolume) {
      analysis.confidence = 'alta';
      analysis.insight = 'Alto volume de escanteios indica jogo ofensivo e pressão constante';
    } else if (currentStats.totalCornerKicks >= this.thresholds.mediumVolume) {
      analysis.confidence = 'média';
      analysis.insight = 'Volume moderado sugere jogo equilibrado com oportunidades';
    } else if (currentStats.totalCornerKicks <= this.thresholds.lowVolume) {
      analysis.confidence = 'média';
      analysis.insight = 'Baixo volume indica jogo defensivo ou poucas finalizações';
    }

    return analysis;
  }

  /**
   * Analisa dados históricos de escanteios
   */
  analyzeHistoricalCornerData(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        hasHistoricalData: false,
        averageCorners: 0,
        trend: 'estável',
        confidence: 'baixa'
      };
    }

    const totalCorners = historicalData.reduce((sum, match) => sum + (match.cornerKicks || 0), 0);
    const averageCorners = totalCorners / historicalData.length;
    
    // Calcular tendência
    const recentMatches = historicalData.slice(-5); // Últimos 5 jogos
    const recentAverage = recentMatches.reduce((sum, match) => sum + (match.cornerKicks || 0), 0) / recentMatches.length;
    
    let trend = 'estável';
    if (recentAverage > averageCorners * 1.2) trend = 'crescente';
    else if (recentAverage < averageCorners * 0.8) trend = 'decrescente';

    return {
      hasHistoricalData: true,
      totalMatches: historicalData.length,
      averageCorners: averageCorners,
      recentAverage: recentAverage,
      trend: trend,
      confidence: historicalData.length >= 5 ? 'média' : 'baixa'
    };
  }

  /**
   * Analisa tendências de escanteios
   */
  analyzeCornerTrends(currentStats, historicalData) {
    const analysis = {
      currentTrend: 'estável',
      momentum: 'neutro',
      prediction: 'manutenção'
    };

    if (historicalData && historicalData.length >= 3) {
      const recentMatches = historicalData.slice(-3);
      const recentAverage = recentMatches.reduce((sum, match) => sum + (match.cornerKicks || 0), 0) / recentMatches.length;
      
      if (currentStats.totalCornerKicks > recentAverage * 1.3) {
        analysis.currentTrend = 'crescente';
        analysis.momentum = 'positivo';
        analysis.prediction = 'aumento';
      } else if (currentStats.totalCornerKicks < recentAverage * 0.7) {
        analysis.currentTrend = 'decrescente';
        analysis.momentum = 'negativo';
        analysis.prediction = 'diminuição';
      }
    }

    return analysis;
  }

  /**
   * Analisa padrões de jogo
   */
  analyzeGamePatterns(currentStats, historicalData) {
    const patterns = {
      offensiveStyle: 'equilibrado',
      defensiveStyle: 'equilibrado',
      tempo: 'moderado',
      pressure: 'média'
    };

    // Determinar estilo ofensivo baseado em escanteios
    if (currentStats.totalCornerKicks >= this.thresholds.highVolume) {
      patterns.offensiveStyle = 'agressivo';
      patterns.tempo = 'alto';
      patterns.pressure = 'alta';
    } else if (currentStats.totalCornerKicks <= this.thresholds.lowVolume) {
      patterns.offensiveStyle = 'conservador';
      patterns.tempo = 'baixo';
      patterns.pressure = 'baixa';
    }

    return patterns;
  }

  /**
   * Combina todas as análises
   */
  combineAnalyses(current, historical, trends, patterns) {
    const combined = {
      current: current,
      historical: historical,
      trends: trends,
      patterns: patterns,
      overallConfidence: 'baixa',
      keyInsights: []
    };

    // Determinar confiança geral
    const confidences = [current.confidence, historical.confidence];
    const highConfidenceCount = confidences.filter(c => c === 'alta').length;
    const mediumConfidenceCount = confidences.filter(c => c === 'média').length;

    if (highConfidenceCount >= 1) {
      combined.overallConfidence = 'alta';
    } else if (mediumConfidenceCount >= 1) {
      combined.overallConfidence = 'média';
    }

    // Gerar insights chave
    if (current.insight) combined.keyInsights.push(current.insight);
    if (historical.trend !== 'estável') {
      combined.keyInsights.push(`Tendência histórica: ${historical.trend}`);
    }
    if (trends.momentum !== 'neutro') {
      combined.keyInsights.push(`Momentum atual: ${trends.momentum}`);
    }
    if (patterns.offensiveStyle !== 'equilibrado') {
      combined.keyInsights.push(`Estilo ofensivo: ${patterns.offensiveStyle}`);
    }

    return combined;
  }

  /**
   * Gera recomendação final
   */
  generateFinalRecommendation(combinedAnalysis) {
    const recommendation = {
      overUnder: null,
      confidence: combinedAnalysis.overallConfidence,
      reasoning: [],
      insights: combinedAnalysis.keyInsights,
      marketRecommendation: null
    };

    const currentCorners = combinedAnalysis.current.totalCorners;
    
    // Lógica de recomendação baseada em volume atual
    if (currentCorners >= this.thresholds.highVolume) {
      recommendation.overUnder = 'Over 7.5 escanteios';
      recommendation.marketRecommendation = 'Over 7.5';
      recommendation.reasoning.push('Volume atual muito alto');
      recommendation.reasoning.push('Padrão ofensivo estabelecido');
    } else if (currentCorners >= this.thresholds.mediumVolume) {
      recommendation.overUnder = 'Over 5.5 escanteios';
      recommendation.marketRecommendation = 'Over 5.5';
      recommendation.reasoning.push('Volume atual moderado-alto');
      recommendation.reasoning.push('Potencial para crescimento');
    } else if (currentCorners <= this.thresholds.veryLowVolume) {
      recommendation.overUnder = 'Under 5.5 escanteios';
      recommendation.marketRecommendation = 'Under 5.5';
      recommendation.reasoning.push('Volume atual muito baixo');
      recommendation.reasoning.push('Padrão defensivo estabelecido');
    } else {
      recommendation.overUnder = 'Under 7.5 escanteios';
      recommendation.marketRecommendation = 'Under 7.5';
      recommendation.reasoning.push('Volume atual baixo-moderado');
      recommendation.reasoning.push('Tendência para Under');
    }

    // Ajustar baseado em dados históricos
    if (combinedAnalysis.historical.hasHistoricalData) {
      if (combinedAnalysis.historical.trend === 'crescente') {
        if (recommendation.marketRecommendation.includes('Under')) {
          recommendation.marketRecommendation = recommendation.marketRecommendation.replace('Under', 'Over');
          recommendation.reasoning.push('Tendência histórica crescente');
        }
      } else if (combinedAnalysis.historical.trend === 'decrescente') {
        if (recommendation.marketRecommendation.includes('Over')) {
          recommendation.marketRecommendation = recommendation.marketRecommendation.replace('Over', 'Under');
          recommendation.reasoning.push('Tendência histórica decrescente');
        }
      }
    }

    // Ajustar confiança baseada em consistência
    if (combinedAnalysis.keyInsights.length >= 3) {
      if (recommendation.confidence === 'baixa') recommendation.confidence = 'média';
    }

    return recommendation;
  }

  /**
   * Categoriza volume de escanteios
   */
  categorizeCornerVolume(totalCorners) {
    if (totalCorners >= this.thresholds.highVolume) return 'alto';
    if (totalCorners >= this.thresholds.mediumVolume) return 'médio-alto';
    if (totalCorners >= this.thresholds.lowVolume) return 'médio-baixo';
    if (totalCorners >= this.thresholds.veryLowVolume) return 'baixo';
    return 'muito baixo';
  }

  /**
   * Analisa distribuição entre times
   */
  analyzeTeamDistribution(teamStats) {
    if (!teamStats || teamStats.length < 2) return { balanced: true, dominantTeam: null };

    const homeCorners = teamStats[0]?.cornerKicks || 0;
    const awayCorners = teamStats[1]?.cornerKicks || 0;
    
    const difference = Math.abs(homeCorners - awayCorners);
    const total = homeCorners + awayCorners;
    const balanceRatio = difference / total;

    return {
      balanced: balanceRatio < 0.3,
      dominantTeam: homeCorners > awayCorners ? 'home' : 'away',
      balanceRatio: balanceRatio,
      homeAdvantage: homeCorners > awayCorners
    };
  }

  /**
   * Gera análise padrão quando não há dados
   */
  generateDefaultAnalysis(fixtureId) {
    return {
      fixtureId,
      timestamp: new Date().toISOString(),
      currentStats: null,
      analysis: {
        overallConfidence: 'baixa',
        keyInsights: ['Dados insuficientes para análise']
      },
      recommendation: {
        overUnder: 'Under 7.5 escanteios',
        confidence: 'baixa',
        reasoning: ['Dados limitados'],
        insights: ['Análise baseada em padrões gerais']
      },
      confidence: 'baixa',
      reasoning: ['Dados insuficientes'],
      insights: ['Análise limitada']
    };
  }
}

module.exports = new CornerAnalysisService();
