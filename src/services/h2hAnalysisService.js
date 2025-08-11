const apiService = require('./apiService');
const moment = require('moment');

class H2HAnalysisService {
  constructor() {
    this.apiService = apiService;
  }

  // Obter dados H2H entre dois times
  async getH2HData(team1Id, team2Id, options = {}) {
    try {
      const { last = 10, league = null, season = null, from = null, to = null } = options;
      
      let params = { last };
      if (league && season) {
        params = { league, season, last };
      }
      if (from && to) {
        params = { ...params, from, to };
      }

      const h2hData = await this.apiService.getHeadToHead(team1Id, team2Id, params);
      
      if (!h2hData.response || h2hData.response.length === 0) {
        return {
          total: 0,
          analysis: null,
          matches: []
        };
      }

      return {
        total: h2hData.response.length,
        analysis: this.analyzeH2HMatches(h2hData.response),
        matches: h2hData.response
      };
    } catch (error) {
      console.error('Erro ao obter dados H2H:', error.message);
      return {
        total: 0,
        analysis: null,
        matches: []
      };
    }
  }

  // Analisar partidas H2H
  analyzeH2HMatches(matches) {
    if (!matches || matches.length === 0) {
      return null;
    }

    const analysis = {
      totalMatches: matches.length,
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      totalGoals: 0,
      homeGoals: 0,
      awayGoals: 0,
      averageGoals: 0,
      over25: 0,
      under25: 0,
      over35: 0,
      under35: 0,
      bothTeamsScored: 0,
      cleanSheets: 0,
      
      // NOVOS CAMPOS PARA OVER/UNDER
      totalCorners: 0,
      averageCorners: 0,
      overCorners85: 0,
      underCorners85: 0,
      overCorners75: 0,
      underCorners75: 0,
      overCorners65: 0,
      underCorners65: 0,
      overCorners55: 0,
      underCorners55: 0,
      overCorners45: 0,
      underCorners45: 0,
      cornerTrends: {
        firstHalf: 0,
        secondHalf: 0,
        balanced: 0,
        homeDominant: 0,
        awayDominant: 0
      },
      
      totalCards: 0,
      averageCards: 0,
      overCards45: 0,
      underCards45: 0,
      overCards35: 0,
      underCards35: 0,
      
      totalShots: 0,
      averageShots: 0,
      overShots115: 0,
      underShots115: 0,
      overShots95: 0,
      underShots95: 0,
      
      recentForm: {
        home: [],
        away: []
      },
      goalTrends: {
        firstHalf: 0,
        secondHalf: 0
      },
      venueAnalysis: {},
      leagueAnalysis: {}
    };

    matches.forEach(match => {
      const { teams, goals, score, fixture, league } = match;
      
      // Análise de resultados
      if (teams.home.winner) {
        analysis.homeWins++;
      } else if (teams.away.winner) {
        analysis.awayWins++;
      } else {
        analysis.draws++;
      }

      // Análise de gols
      const homeGoals = goals.home || 0;
      const awayGoals = goals.away || 0;
      const totalGoals = homeGoals + awayGoals;

      analysis.totalGoals += totalGoals;
      analysis.homeGoals += homeGoals;
      analysis.awayGoals += awayGoals;

      // Over/Under análise
      if (totalGoals > 2.5) {
        analysis.over25++;
      } else {
        analysis.under25++;
      }

      if (totalGoals > 3.5) {
        analysis.over35++;
      } else {
        analysis.under35++;
      }

      // Both teams scored
      if (homeGoals > 0 && awayGoals > 0) {
        analysis.bothTeamsScored++;
      }

      // Clean sheets
      if (homeGoals === 0 || awayGoals === 0) {
        analysis.cleanSheets++;
      }

      // ANÁLISE DE ESCANTEIOS (se disponível)
      if (match.statistics) {
        const homeCorners = parseInt(match.statistics.home?.corners || 0);
        const awayCorners = parseInt(match.statistics.away?.corners || 0);
        const totalCorners = homeCorners + awayCorners;
        
        analysis.totalCorners += totalCorners;
        
        // Over/Under escanteios - múltiplos níveis
        if (totalCorners > 8.5) analysis.overCorners85++;
        else analysis.underCorners85++;
        
        if (totalCorners > 7.5) analysis.overCorners75++;
        else analysis.underCorners75++;
        
        if (totalCorners > 6.5) analysis.overCorners65++;
        else analysis.underCorners65++;
        
        if (totalCorners > 5.5) analysis.overCorners55++;
        else analysis.underCorners55++;
        
        if (totalCorners > 4.5) analysis.overCorners45++;
        else analysis.underCorners45++;
        
        // Análise de distribuição de escanteios
        if (homeCorners > 0 && awayCorners > 0) {
          const difference = Math.abs(homeCorners - awayCorners);
          const total = homeCorners + awayCorners;
          const balanceRatio = difference / total;
          
          if (balanceRatio < 0.3) {
            analysis.cornerTrends.balanced++;
          } else if (homeCorners > awayCorners) {
            analysis.cornerTrends.homeDominant++;
          } else {
            analysis.cornerTrends.awayDominant++;
          }
        }
      }

      // ANÁLISE DE CARTÕES (se disponível)
      if (match.statistics) {
        const homeCards = parseInt(match.statistics.home?.cards || 0);
        const awayCards = parseInt(match.statistics.away?.cards || 0);
        const totalCards = homeCards + awayCards;
        
        analysis.totalCards += totalCards;
        
        // Over/Under cartões
        if (totalCards > 4.5) analysis.overCards45++;
        else analysis.underCards45++;
        
        if (totalCards > 3.5) analysis.overCards35++;
        else analysis.underCards35++;
      }

      // ANÁLISE DE FINALIZAÇÕES (se disponível)
      if (match.statistics) {
        const homeShots = parseInt(match.statistics.home?.shots || 0);
        const awayShots = parseInt(match.statistics.away?.shots || 0);
        const totalShots = homeShots + awayShots;
        
        analysis.totalShots += totalShots;
        
        // Over/Under finalizações
        if (totalShots > 11.5) analysis.overShots115++;
        else analysis.underShots115++;
        
        if (totalShots > 9.5) analysis.overShots95++;
        else analysis.underShots95++;
      }

      // Análise por tempo
      if (score && score.halftime) {
        const firstHalfGoals = (score.halftime.home || 0) + (score.halftime.away || 0);
        const secondHalfGoals = totalGoals - firstHalfGoals;
        
        if (firstHalfGoals > secondHalfGoals) {
          analysis.goalTrends.firstHalf++;
        } else {
          analysis.goalTrends.secondHalf++;
        }
      }

      // Análise por venue
      if (fixture.venue) {
        const venueId = fixture.venue.id;
        if (!analysis.venueAnalysis[venueId]) {
          analysis.venueAnalysis[venueId] = {
            name: fixture.venue.name,
            matches: 0,
            homeWins: 0,
            awayWins: 0,
            draws: 0,
            totalGoals: 0
          };
        }
        
        analysis.venueAnalysis[venueId].matches++;
        analysis.venueAnalysis[venueId].totalGoals += totalGoals;
        
        if (teams.home.winner) {
          analysis.venueAnalysis[venueId].homeWins++;
        } else if (teams.away.winner) {
          analysis.venueAnalysis[venueId].awayWins++;
        } else {
          analysis.venueAnalysis[venueId].draws++;
        }
      }

      // Análise por liga
      if (league) {
        const leagueId = league.id;
        if (!analysis.leagueAnalysis[leagueId]) {
          analysis.leagueAnalysis[leagueId] = {
            name: league.name,
            matches: 0,
            homeWins: 0,
            awayWins: 0,
            draws: 0,
            totalGoals: 0
          };
        }
        
        analysis.leagueAnalysis[leagueId].matches++;
        analysis.leagueAnalysis[leagueId].totalGoals += totalGoals;
        
        if (teams.home.winner) {
          analysis.leagueAnalysis[leagueId].homeWins++;
        } else if (teams.away.winner) {
          analysis.leagueAnalysis[leagueId].awayWins++;
        } else {
          analysis.leagueAnalysis[leagueId].draws++;
        }
      }

      // Forma recente (últimos 5 jogos)
      const matchDate = new Date(fixture.date);
      const isRecent = moment().diff(matchDate, 'months') <= 6;
      
      if (isRecent) {
        if (teams.home.winner) {
          analysis.recentForm.home.push('W');
          analysis.recentForm.away.push('L');
        } else if (teams.away.winner) {
          analysis.recentForm.home.push('L');
          analysis.recentForm.away.push('W');
        } else {
          analysis.recentForm.home.push('D');
          analysis.recentForm.away.push('D');
        }
      }
    });

    // Calcular médias
    analysis.averageGoals = analysis.totalGoals / analysis.totalMatches;
    analysis.homeWinRate = (analysis.homeWins / analysis.totalMatches) * 100;
    analysis.awayWinRate = (analysis.awayWins / analysis.totalMatches) * 100;
    analysis.drawRate = (analysis.draws / analysis.totalMatches) * 100;
    analysis.over25Rate = (analysis.over25 / analysis.totalMatches) * 100;
    analysis.over35Rate = (analysis.over35 / analysis.totalMatches) * 100;
    analysis.bothTeamsScoredRate = (analysis.bothTeamsScored / analysis.totalMatches) * 100;
    
    // Calcular médias dos novos campos
    analysis.averageCorners = analysis.totalCorners / analysis.totalMatches;
    analysis.averageCards = analysis.totalCards / analysis.totalMatches;
    analysis.averageShots = analysis.totalShots / analysis.totalMatches;

    return analysis;
  }

  // Gerar insights baseados no H2H - FOCADO EM OVER/UNDER
  generateH2HInsights(analysis) {
    if (!analysis) {
      return {
        confidence: 'baixa',
        insights: ['Dados H2H insuficientes'],
        recommendations: ['Aguardar mais dados históricos']
      };
    }

    const insights = [];
    const recommendations = [];
    let confidence = 'baixa';

    // Análise de gols - PRIORIDADE MÁXIMA
    if (analysis.averageGoals >= 3.5) {
      insights.push(`Jogos com muitos gols (média: ${analysis.averageGoals.toFixed(1)} gols)`);
      recommendations.push('Over 3.5 gols');
      confidence = 'alta';
    } else if (analysis.averageGoals >= 3.0) {
      insights.push(`Jogos com muitos gols (média: ${analysis.averageGoals.toFixed(1)} gols)`);
      recommendations.push('Over 2.5 gols');
      confidence = 'alta';
    } else if (analysis.averageGoals >= 2.5) {
      insights.push(`Jogos com gols moderados (média: ${analysis.averageGoals.toFixed(1)} gols)`);
      recommendations.push('Over 1.5 gols');
      confidence = 'média';
    } else if (analysis.averageGoals <= 1.5) {
      insights.push(`Jogos com poucos gols (média: ${analysis.averageGoals.toFixed(1)} gols)`);
      recommendations.push('Under 2.5 gols');
      confidence = 'alta';
    } else if (analysis.averageGoals <= 2.0) {
      insights.push(`Jogos com poucos gols (média: ${analysis.averageGoals.toFixed(1)} gols)`);
      recommendations.push('Under 3.5 gols');
      confidence = 'média';
    }

    // Análise de escanteios - PRIORIDADE ALTA
    if (analysis.averageCorners >= 8.5) {
      insights.push(`Muitos escanteios (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Over 8.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCorners >= 7.5) {
      insights.push(`Muitos escanteios (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Over 7.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCorners >= 6.5) {
      insights.push(`Escanteios moderados-altos (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Over 6.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCorners >= 5.5) {
      insights.push(`Escanteios moderados (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Over 5.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCorners >= 4.5) {
      insights.push(`Escanteios moderados-baixos (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Over 4.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCorners <= 4.0) {
      insights.push(`Poucos escanteios (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Under 4.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCorners <= 5.0) {
      insights.push(`Poucos escanteios (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Under 5.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCorners <= 6.0) {
      insights.push(`Escanteios baixos (média: ${analysis.averageCorners.toFixed(1)} escanteios)`);
      recommendations.push('Under 6.5 escanteios');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    }
    
    // Análise de padrões de distribuição de escanteios
    if (analysis.cornerTrends && analysis.totalMatches >= 3) {
      const totalMatches = analysis.totalMatches;
      const balancedRatio = analysis.cornerTrends.balanced / totalMatches;
      const homeDominantRatio = analysis.cornerTrends.homeDominant / totalMatches;
      const awayDominantRatio = analysis.cornerTrends.awayDominant / totalMatches;
      
      if (balancedRatio >= 0.6) {
        insights.push('Padrão equilibrado de escanteios entre os times');
        recommendations.push('Over 5.5 escanteios (distribuição equilibrada)');
      } else if (homeDominantRatio >= 0.5) {
        insights.push('Time da casa domina escanteios');
        recommendations.push('Over 6.5 escanteios (vantagem da casa)');
      } else if (awayDominantRatio >= 0.5) {
        insights.push('Time visitante domina escanteios');
        recommendations.push('Over 6.5 escanteios (pressão do visitante)');
      }
    }

    // Análise de cartões
    if (analysis.averageCards >= 6.0) {
      insights.push(`Muitos cartões (média: ${analysis.averageCards.toFixed(1)} cartões)`);
      recommendations.push('Over 5.5 cartões');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCards >= 5.0) {
      insights.push(`Muitos cartões (média: ${analysis.averageCards.toFixed(1)} cartões)`);
      recommendations.push('Over 4.5 cartões');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCards >= 4.0) {
      insights.push(`Cartões moderados (média: ${analysis.averageCards.toFixed(1)} cartões)`);
      recommendations.push('Over 3.5 cartões');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCards <= 2.5) {
      insights.push(`Poucos cartões (média: ${analysis.averageCards.toFixed(1)} cartões)`);
      recommendations.push('Under 3.5 cartões');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageCards <= 3.5) {
      insights.push(`Poucos cartões (média: ${analysis.averageCards.toFixed(1)} cartões)`);
      recommendations.push('Under 4.5 cartões');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    }

    // Análise de finalizações
    if (analysis.averageShots >= 13.0) {
      insights.push(`Muitas finalizações (média: ${analysis.averageShots.toFixed(1)} finalizações)`);
      recommendations.push('Over 12.5 finalizações');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageShots >= 12.0) {
      insights.push(`Muitas finalizações (média: ${analysis.averageShots.toFixed(1)} finalizações)`);
      recommendations.push('Over 11.5 finalizações');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageShots >= 10.0) {
      insights.push(`Finalizações moderadas (média: ${analysis.averageShots.toFixed(1)} finalizações)`);
      recommendations.push('Over 9.5 finalizações');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageShots <= 8.0) {
      insights.push(`Poucas finalizações (média: ${analysis.averageShots.toFixed(1)} finalizações)`);
      recommendations.push('Under 9.5 finalizações');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    } else if (analysis.averageShots <= 9.0) {
      insights.push(`Poucas finalizações (média: ${analysis.averageShots.toFixed(1)} finalizações)`);
      recommendations.push('Under 10.5 finalizações');
      confidence = confidence === 'baixa' ? 'média' : confidence;
    }

    // Análise de padrões de gols por tempo
    if (analysis.goalTrends.firstHalf > analysis.goalTrends.secondHalf) {
      insights.push('Mais gols no primeiro tempo');
      recommendations.push('Over 0.5 gols 1º tempo');
    } else if (analysis.goalTrends.secondHalf > analysis.goalTrends.firstHalf) {
      insights.push('Mais gols no segundo tempo');
      recommendations.push('Over 0.5 gols 2º tempo');
    }

    // Análise de equilíbrio - apenas para contexto
    if (analysis.homeWinRate >= 40 && analysis.homeWinRate <= 60) {
      insights.push('Jogos equilibrados entre os times');
    }

    // Se não há insights específicos
    if (insights.length === 0) {
      insights.push('Histórico H2H não mostra padrões claros de over/under');
      recommendations.push('Analisar outros fatores');
    }

    return {
      confidence,
      insights,
      recommendations,
      stats: {
        totalMatches: analysis.totalMatches,
        averageGoals: analysis.averageGoals,
        over25Rate: analysis.over25Rate,
        
        // DADOS OVER/UNDER
        averageCorners: analysis.averageCorners,
        averageCards: analysis.averageCards,
        averageShots: analysis.averageShots,
        
        // Taxas de acerto para validação
        overCorners65Rate: analysis.totalMatches > 0 ? (analysis.overCorners65 / analysis.totalMatches) * 100 : 0,
        overCards45Rate: analysis.totalMatches > 0 ? (analysis.overCards45 / analysis.totalMatches) * 100 : 0,
        overShots115Rate: analysis.totalMatches > 0 ? (analysis.overShots115 / analysis.totalMatches) * 100 : 0
      }
    };
  }

  // Análise completa H2H para um jogo
  async getCompleteH2HAnalysis(fixture) {
    try {
      const { teams, league } = fixture;
      const team1Id = teams.home.id;
      const team2Id = teams.away.id;
      
      console.log(`🔍 Analisando H2H: ${teams.home.name} vs ${teams.away.name}`);
      
      // Obter dados H2H
      const h2hData = await this.getH2HData(team1Id, team2Id, {
        last: 10,
        league: league?.id,
        season: league?.season
      });

      console.log(`📊 H2H Data - total: ${h2hData.total}, analysis:`, h2hData.analysis);

      // Gerar insights
      const insights = this.generateH2HInsights(h2hData.analysis);

      console.log(`💡 H2H Insights - confidence: ${insights.confidence}, recommendations:`, insights.recommendations);

      const result = {
        fixture: {
          home: teams.home.name,
          away: teams.away.name,
          league: league?.name || 'N/A'
        },
        h2h: {
          totalMatches: h2hData.total,
          analysis: h2hData.analysis,
          insights: insights,
          recentMatches: h2hData.matches.slice(0, 5) // Últimos 5 jogos
        },
        confidence: insights.confidence,
        recommendations: insights.recommendations,
        stats: insights.stats // Adicionar stats diretamente
      };

      console.log(`✅ H2H Analysis result:`, result);
      return result;
    } catch (error) {
      console.error('Erro na análise H2H completa:', error.message);
      return {
        error: 'Erro ao analisar H2H',
        confidence: 'baixa',
        recommendations: ['Dados H2H indisponíveis']
      };
    }
  }
}

module.exports = H2HAnalysisService;
