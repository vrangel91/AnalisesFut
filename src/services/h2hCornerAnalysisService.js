const axios = require('axios');
require('dotenv').config({ path: './config.env' });
const cacheService = require('./cacheService');

class H2HCornerAnalysisService {
  constructor() {
    this.baseURL = process.env.API_SPORTS_BASE_URL;
    this.apiKey = process.env.API_SPORTS_KEY;
    this.apiHost = process.env.API_SPORTS_HOST;
  }

  /**
   * Busca estatísticas gerais de um time em uma liga específica
   */
  async getTeamStatistics(teamId, leagueId, season) {
    try {
      console.log(`🔍 Buscando estatísticas do time ${teamId} na liga ${leagueId} temporada ${season}`);
      
      const response = await axios.get(`${this.baseURL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, {
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey
        }
      });

      if (response.data.response) {
        const stats = response.data.response;
        
        console.log(`✅ Estatísticas encontradas para ${stats.team?.name} em ${stats.league?.name}`);
        
        return {
          team: stats.team,
          league: stats.league,
          form: stats.form,
          fixtures: stats.fixtures,
          goals: stats.goals,
          biggest: stats.biggest,
          clean_sheet: stats.clean_sheet,
          failed_to_score: stats.failed_to_score,
          penalty: stats.penalty,
          lineups: stats.lineups,
          cards: stats.cards,
          available: true
        };
      }
      
      console.log(`⚠️ Nenhuma estatística encontrada para time ${teamId}`);
      return { available: false };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas do time ${teamId}:`, error.message);
      return { available: false };
    }
  }

  /**
   * Busca estatísticas de escanteios para uma partida específica
   */
  async getFixtureCornerStats(fixtureId) {
    try {
      console.log(`🔍 Buscando estatísticas de escanteios para fixture ${fixtureId}`);
      
      const response = await axios.get(`${this.baseURL}/fixtures/statistics?fixture=${fixtureId}`, {
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey
        }
      });

      if (response.data.response && response.data.response.length > 0) {
        const stats = response.data.response;
        
        // Encontrar estatísticas de corner kicks
        let homeCorners = 0;
        let awayCorners = 0;
        
        stats.forEach(teamStats => {
          const cornerStat = teamStats.statistics?.find(stat => 
            stat.type === 'Corner Kicks' || stat.type === 'Corner kicks'
          );
          
          if (cornerStat) {
            const cornerValue = parseInt(cornerStat.value) || 0;
            
            // Determinar se é home ou away baseado na estrutura da resposta
            if (teamStats.team && teamStats.team.id) {
              // Assumir que o primeiro time é home e o segundo é away
              if (stats.indexOf(teamStats) === 0) {
                homeCorners = cornerValue;
              } else {
                awayCorners = cornerValue;
              }
            }
          }
        });
        
        const totalCorners = homeCorners + awayCorners;
        
        console.log(`✅ Estatísticas de escanteios encontradas: ${homeCorners}-${awayCorners} (Total: ${totalCorners})`);
        
        return {
          homeCorners,
          awayCorners,
          totalCorners,
          available: true
        };
      }
      
      console.log(`⚠️ Nenhuma estatística encontrada para fixture ${fixtureId}`);
      return { homeCorners: 0, awayCorners: 0, totalCorners: 0, available: false };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas de escanteios para fixture ${fixtureId}:`, error.message);
      return { homeCorners: 0, awayCorners: 0, totalCorners: 0, available: false };
    }
  }

  /**
   * Busca dados H2H com foco em corner kicks
   */
  async getH2HCornerData(team1Id, team2Id, options = {}) {
    try {
      console.log(`🔍 Buscando dados H2H reais da API para times ${team1Id} vs ${team2Id}`);
      
      // Sempre tentar usar a API real primeiro
      console.log('🌐 Fazendo requisição para API-SPORTS Head to Head...');
      
      const params = new URLSearchParams();
      params.append('h2h', `${team1Id}-${team2Id}`);
      
      // Adicionar parâmetros opcionais
      if (options.last) params.append('last', options.last);
      if (options.season) params.append('season', options.season);
      if (options.league) params.append('league', options.league);
      if (options.from) params.append('from', options.from);
      if (options.to) params.append('to', options.to);
      
      // Buscar partidas sem especificar temporada para obter mais resultados
      params.append('last', '20'); // Limitar a 20 partidas mais recentes
      
      console.log(`📡 Parâmetros enviados para API: ${params.toString()}`);
      console.log(`🔗 URL completa: ${this.baseURL}/fixtures/headtohead?${params.toString()}`);
      
      const response = await axios.get(`${this.baseURL}/fixtures/headtohead?${params.toString()}`, {
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey
        }
      });

      console.log(`📊 Resposta da API:`, {
        status: response.status,
        results: response.data.results,
        responseLength: response.data.response?.length || 0,
        errors: response.data.errors
      });

      if (response.data.response && response.data.response.length > 0) {
        console.log(`✅ API retornou ${response.data.response.length} partidas`);
        console.log(`🔍 Chamando analyzeH2HCornerPatterns...`);
        const result = await this.analyzeH2HCornerPatterns(response.data.response, team1Id, team2Id);
        console.log(`📊 Resultado da análise:`, {
          totalMatches: result?.totalMatches,
          homeWins: result?.h2hAnalysis?.homeWins,
          awayWins: result?.h2hAnalysis?.awayWins,
          draws: result?.h2hAnalysis?.draws,
          cornersAvailable: result?.cornerStats?.cornersAvailable
        });
        return result;
      }

      console.log('⚠️ API não retornou partidas');
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar dados H2H de corner kicks:`, error.message);
      
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Dados:`, error.response.data);
      }
      
      // Em caso de erro da API, retornar análise padrão em vez de dados fictícios
      console.log('⚠️ Retornando análise padrão devido ao erro da API');
      return this.generateDefaultH2HAnalysis();
    }
  }

  /**
   * Analisa padrões de corner kicks no H2H
   */
  async analyzeH2HCornerPatterns(matches, team1Id, team2Id) {
    if (!matches || matches.length === 0) {
      return this.generateDefaultH2HAnalysis();
    }

    console.log(`📊 Analisando ${matches.length} partidas H2H reais da API...`);

    const analysis = {
      totalMatches: matches.length,
      // Análise de resultados (vitórias, empates, derrotas)
      h2hAnalysis: {
        totalMatches: matches.length,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalGoals: 0,
        homeGoals: 0,
        awayGoals: 0,
        averageGoals: 0,
        // Novos campos para análise mais profunda
        goalTrends: {
          firstHalf: 0,
          secondHalf: 0,
          balanced: 0
        },
        venueAnalysis: {
          homeVenue: 0,
          awayVenue: 0,
          neutralVenue: 0
        },
        seasonAnalysis: {
          recent: 0,
          historical: 0
        }
      },
      cornerStats: {
        totalCorners: 0,
        averageCorners: 0,
        homeTeamCorners: 0,
        awayTeamCorners: 0,
        cornersAvailable: 0, // Contador de partidas com dados de escanteios
        overUnder: {
          over85: 0, under85: 0,
          over75: 0, under75: 0,
          over65: 0, under65: 0,
          over55: 0, under55: 0,
          over45: 0, under45: 0
        },
        distribution: {
          balanced: 0,
          homeDominant: 0,
          awayDominant: 0,
          veryBalanced: 0
        },
        trends: {
          increasing: 0,
          decreasing: 0,
          stable: 0
        }
      },
      // Novas estatísticas dos times
      teamStats: {
        homeTeam: null,
        awayTeam: null,
        available: false
      },
      matchDetails: [],
      recommendations: [],
      confidence: 'baixa',
      // Análise de ligas e temporadas
      leagueAnalysis: {
        totalLeagues: 0,
        leagues: {},
        seasons: {}
      }
    };

    // Buscar estatísticas dos times se houver partidas
    if (matches.length > 0) {
      // Usar a temporada da primeira partida em vez da temporada atual
      const firstMatch = matches[0];
      const leagueId = firstMatch.league?.id;
      const season = firstMatch.league?.season;
      
      if (leagueId && season) {
        console.log(`📊 Buscando estatísticas dos times na liga ${leagueId} temporada ${season}`);
        
        try {
          // Buscar estatísticas do time da casa
          const homeTeamStats = await this.getTeamStatistics(team1Id, leagueId, season);
          
          // Buscar estatísticas do time visitante
          const awayTeamStats = await this.getTeamStatistics(team2Id, leagueId, season);
          
          if (homeTeamStats.available || awayTeamStats.available) {
            analysis.teamStats = {
              homeTeam: homeTeamStats.available ? homeTeamStats : null,
              awayTeam: awayTeamStats.available ? awayTeamStats : null,
              available: true
            };
            
            console.log(`✅ Estatísticas dos times obtidas: ${homeTeamStats.available ? 'Casa' : 'N/A'} vs ${awayTeamStats.available ? 'Visitante' : 'N/A'}`);
          } else {
            console.log(`⚠️ Nenhuma estatística de time encontrada para temporada ${season}`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar estatísticas dos times: ${error.message}`);
        }
      } else {
        console.log(`⚠️ Liga ID ou temporada não encontrados: leagueId=${leagueId}, season=${season}`);
      }
    }

    // Analisar cada partida
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchAnalysis = await this.analyzeSingleMatch(match, team1Id, team2Id);
      analysis.matchDetails.push(matchAnalysis);
      
      // Acumular estatísticas de resultados (vitórias, empates, derrotas)
      if (matchAnalysis.result === 'home') {
        analysis.h2hAnalysis.homeWins++;
      } else if (matchAnalysis.result === 'away') {
        analysis.h2hAnalysis.awayWins++;
      } else {
        analysis.h2hAnalysis.draws++;
      }
      
      // Acumular estatísticas de gols
      analysis.h2hAnalysis.totalGoals += matchAnalysis.totalGoals;
      analysis.h2hAnalysis.homeGoals += matchAnalysis.homeGoals;
      analysis.h2hAnalysis.awayGoals += matchAnalysis.awayGoals;
      
      // Acumular estatísticas de escanteios (se disponíveis)
      if (matchAnalysis.cornersAvailable) {
        analysis.cornerStats.totalCorners += matchAnalysis.totalCorners;
        analysis.cornerStats.homeTeamCorners += matchAnalysis.homeCorners;
        analysis.cornerStats.awayTeamCorners += matchAnalysis.awayCorners;
        analysis.cornerStats.cornersAvailable++;
        
        // Atualizar estatísticas de over/under
        this.updateOverUnderStats(analysis.cornerStats.overUnder, matchAnalysis.totalCorners);
        
        // Atualizar estatísticas de distribuição
        this.updateDistributionStats(analysis.cornerStats.distribution, matchAnalysis);
      }
      
      // Análise de tendências de gols por tempo
      if (matchAnalysis.score) {
        const { halftime, fulltime } = matchAnalysis.score;
        if (halftime && fulltime) {
          const firstHalfGoals = (halftime.home || 0) + (halftime.away || 0);
          const secondHalfGoals = (fulltime.home || 0) + (fulltime.away || 0) - firstHalfGoals;
          
          if (firstHalfGoals > secondHalfGoals) {
            analysis.h2hAnalysis.goalTrends.firstHalf++;
          } else if (secondHalfGoals > firstHalfGoals) {
            analysis.h2hAnalysis.goalTrends.secondHalf++;
          } else {
            analysis.h2hAnalysis.goalTrends.balanced++;
          }
        }
      }
      
      // Análise de local
      if (matchAnalysis.venue) {
        if (matchAnalysis.venue.type === 'home') {
          analysis.h2hAnalysis.venueAnalysis.homeVenue++;
        } else if (matchAnalysis.venue.type === 'away') {
          analysis.h2hAnalysis.venueAnalysis.awayVenue++;
        } else {
          analysis.h2hAnalysis.venueAnalysis.neutralVenue++;
        }
      }
      
      // Análise de temporada
      if (matchAnalysis.league) {
        const currentYear = new Date().getFullYear();
        if (matchAnalysis.league.season >= currentYear - 1) {
          analysis.h2hAnalysis.seasonAnalysis.recent++;
        } else {
          analysis.h2hAnalysis.seasonAnalysis.historical++;
        }
      }
      
      // Análise de ligas
      if (matchAnalysis.league) {
        const leagueId = matchAnalysis.league.id;
        const leagueName = matchAnalysis.league.name;
        
        if (!analysis.leagueAnalysis.leagues[leagueId]) {
          analysis.leagueAnalysis.leagues[leagueId] = {
            name: leagueName,
            matches: 0,
            homeWins: 0,
            awayWins: 0,
            draws: 0,
            totalGoals: 0
          };
        }
        
        analysis.leagueAnalysis.leagues[leagueId].matches++;
        if (matchAnalysis.result === 'home') {
          analysis.leagueAnalysis.leagues[leagueId].homeWins++;
        } else if (matchAnalysis.result === 'away') {
          analysis.leagueAnalysis.leagues[leagueId].awayWins++;
        } else {
          analysis.leagueAnalysis.leagues[leagueId].draws++;
        }
        analysis.leagueAnalysis.leagues[leagueId].totalGoals += matchAnalysis.totalGoals;
      }
    }

    // Calcular médias e tendências
    this.calculateAveragesAndTrends(analysis);
    
    // Calcular média de gols
    if (analysis.h2hAnalysis.totalMatches > 0) {
      analysis.h2hAnalysis.averageGoals = analysis.h2hAnalysis.totalGoals / analysis.h2hAnalysis.totalMatches;
    }
    
    // Calcular estatísticas de ligas
    analysis.leagueAnalysis.totalLeagues = Object.keys(analysis.leagueAnalysis.leagues).length;
    
    // Log das estatísticas calculadas
    console.log('📊 Estatísticas H2H calculadas:', {
      totalMatches: analysis.totalMatches,
      homeWins: analysis.h2hAnalysis.homeWins,
      awayWins: analysis.h2hAnalysis.awayWins,
      draws: analysis.h2hAnalysis.draws,
      averageGoals: analysis.h2hAnalysis.averageGoals?.toFixed(2),
      totalLeagues: analysis.leagueAnalysis.totalLeagues,
      cornersAvailable: analysis.cornerStats.cornersAvailable,
      averageCorners: analysis.cornerStats.averageCorners?.toFixed(2)
    });
    
    // Gerar recomendações
    analysis.recommendations = this.generateCornerRecommendations(analysis);
    
    // Determinar confiança
    analysis.confidence = this.calculateConfidence(analysis);

    return analysis;
  }

  /**
   * Analisa uma partida individual
   */
  async analyzeSingleMatch(match, team1Id, team2Id) {
    const { teams, goals, score, fixture, league, venue } = match;
    
    // Determinar qual time é home/away baseado nos IDs
    const isTeam1Home = teams.home.id === team1Id;
    const homeTeam = isTeam1Home ? teams.home : teams.away;
    const awayTeam = isTeam1Home ? teams.away : teams.home;
    
    // Buscar estatísticas reais de escanteios da API
    let homeCorners = 0;
    let awayCorners = 0;
    let totalCorners = 0;
    let cornersAvailable = false;
    
    try {
      const cornerStats = await this.getFixtureCornerStats(fixture.id);
      if (cornerStats.available) {
        homeCorners = cornerStats.homeCorners;
        awayCorners = cornerStats.awayCorners;
        totalCorners = cornerStats.totalCorners;
        cornersAvailable = true;
      }
    } catch (error) {
      console.log(`⚠️ Não foi possível buscar estatísticas de escanteios para fixture ${fixture.id}`);
    }
    
    // Como a API não retorna estatísticas de corner kicks para H2H,
    // vamos focar nos dados disponíveis: resultados e gols
    const homeGoals = goals?.home || 0;
    const awayGoals = goals?.away || 0;
    const totalGoals = homeGoals + awayGoals;
    
    // Determinar resultado da partida
    const result = this.getMatchResult(teams);
    
    // Determinar tipo de local
    let venueType = 'neutral';
    if (venue) {
      if (venue.id === fixture.venue?.id) {
        venueType = 'home';
      } else {
        venueType = 'away';
      }
    }

    // Determinar distribuição de escanteios
    let distribution = 'balanced';
    if (cornersAvailable && totalCorners > 0) {
      const homeRatio = homeCorners / totalCorners;
      const awayRatio = awayCorners / totalCorners;
      
      if (homeRatio >= 0.7) {
        distribution = 'homeDominant';
      } else if (awayRatio >= 0.7) {
        distribution = 'awayDominant';
      } else if (Math.abs(homeRatio - awayRatio) <= 0.1) {
        distribution = 'veryBalanced';
      } else {
        distribution = 'balanced';
      }
    }

    return {
      fixtureId: fixture.id,
      date: fixture.date,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      // Corner kicks agora buscados da API de Statistics
      homeCorners: homeCorners,
      awayCorners: awayCorners,
      totalCorners: totalCorners,
      cornersAvailable: cornersAvailable,
      distribution: distribution,
      homeGoals: homeGoals,
      awayGoals: awayGoals,
      totalGoals: totalGoals,
      result: result,
      league: {
        id: league?.id,
        name: league?.name || 'N/A',
        country: league?.country,
        season: league?.season
      },
      venue: {
        id: venue?.id,
        name: venue?.name,
        city: venue?.city,
        type: venueType
      },
      score: score,
      referee: fixture.referee,
      timezone: fixture.timezone,
      timestamp: fixture.timestamp
    };
  }

  /**
   * Atualiza estatísticas de Over/Under
   */
  updateOverUnderStats(overUnder, totalCorners) {
    if (totalCorners > 8.5) overUnder.over85++;
    else overUnder.under85++;
    
    if (totalCorners > 7.5) overUnder.over75++;
    else overUnder.under75++;
    
    if (totalCorners > 6.5) overUnder.over65++;
    else overUnder.under65++;
    
    if (totalCorners > 5.5) overUnder.over55++;
    else overUnder.under55++;
    
    if (totalCorners > 4.5) overUnder.over45++;
    else overUnder.under45++;
  }

  /**
   * Atualiza estatísticas de distribuição
   */
  updateDistributionStats(distribution, matchAnalysis) {
    switch (matchAnalysis.distribution) {
      case 'veryBalanced':
        distribution.veryBalanced++;
        break;
      case 'balanced':
        distribution.balanced++;
        break;
      case 'homeDominant':
        distribution.homeDominant++;
        break;
      case 'awayDominant':
        distribution.awayDominant++;
        break;
    }
  }

  /**
   * Calcula médias e tendências
   */
  calculateAveragesAndTrends(analysis) {
    const { cornerStats, totalMatches } = analysis;
    
    // Calcular médias de escanteios apenas para partidas com dados disponíveis
    if (cornerStats.cornersAvailable > 0) {
      cornerStats.averageCorners = cornerStats.totalCorners / cornerStats.cornersAvailable;
      cornerStats.homeTeamCorners = cornerStats.homeTeamCorners / cornerStats.cornersAvailable;
      cornerStats.awayTeamCorners = cornerStats.awayTeamCorners / cornerStats.cornersAvailable;
    } else {
      cornerStats.averageCorners = 0;
      cornerStats.homeTeamCorners = 0;
      cornerStats.awayTeamCorners = 0;
    }
    
    // Calcular tendências baseadas nos últimos jogos com dados de escanteios
    if (cornerStats.cornersAvailable >= 3) {
      const recentMatches = analysis.matchDetails
        .filter(match => match.cornersAvailable)
        .slice(-3);
      
      if (recentMatches.length >= 3) {
        const recentAverage = recentMatches.reduce((sum, match) => sum + match.totalCorners, 0) / 3;
        
        if (recentAverage > cornerStats.averageCorners * 1.2) {
          cornerStats.trends.increasing = 1;
        } else if (recentAverage < cornerStats.averageCorners * 0.8) {
          cornerStats.trends.decreasing = 1;
        } else {
          cornerStats.trends.stable = 1;
        }
      }
    }
  }

  /**
   * Aplica margem de segurança aos valores de over/under
   * @param {string} market - Mercado original (ex: "Over 8.5", "Under 5.5")
   * @param {string} type - Tipo de recomendação ("over" ou "under")
   * @returns {string} - Mercado com margem de segurança aplicada
   */
  applySafetyMargin(market, type) {
    // Extrair o valor numérico do mercado
    const match = market.match(/(\d+\.?\d*)/);
    if (!match) return market;
    
    const originalValue = parseFloat(match[1]);
    let adjustedValue;
    
    if (type === 'over') {
      // Para Over: subtrair 1 para ser mais conservador
      adjustedValue = Math.max(0.5, originalValue - 1);
    } else if (type === 'under') {
      // Para Under: adicionar 1 para ser mais conservador
      adjustedValue = originalValue + 1;
    } else {
      return market; // Manter original se não for over/under
    }
    
    // Formatar o valor ajustado
    const formattedValue = adjustedValue % 1 === 0 ? adjustedValue.toFixed(0) : adjustedValue.toFixed(1);
    
    // Substituir o valor no mercado original
    return market.replace(/(\d+\.?\d*)/, formattedValue);
  }

  /**
   * Gera recomendações baseadas em dados reais da API
   */
  generateCornerRecommendations(analysis) {
    const { cornerStats, totalMatches, h2hAnalysis, leagueAnalysis } = analysis;
    const recommendations = [];
    
    // Verificar se há dados suficientes de escanteios
    if (cornerStats.cornersAvailable < 2) {
      recommendations.push({
        type: 'warning',
        message: `Dados de escanteios insuficientes para análise (${cornerStats.cornersAvailable}/${totalMatches} partidas com dados)`,
        confidence: 'baixa'
      });
      
      // Se não há dados de escanteios, focar apenas em recomendações baseadas em gols e resultados
      return this.generateGoalsBasedRecommendations(analysis);
    }

    console.log(`🎯 Gerando recomendações baseadas em ${cornerStats.cornersAvailable} jogos com dados de escanteios...`);

    // Recomendações baseadas na média de escanteios (prioridade alta)
    if (cornerStats.averageCorners >= 9.0) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 9.5 escanteios', 'over'),
        confidence: 'alta',
        reasoning: `Média H2H extremamente alta: ${cornerStats.averageCorners.toFixed(1)} escanteios (margem de segurança aplicada)`,
        stats: `${cornerStats.overUnder.over85}/${cornerStats.cornersAvailable} jogos acima de 8.5`
      });
    } else if (cornerStats.averageCorners >= 8.0) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 8.5 escanteios', 'over'),
        confidence: 'alta',
        reasoning: `Média H2H muito alta: ${cornerStats.averageCorners.toFixed(1)} escanteios (margem de segurança aplicada)`,
        stats: `${cornerStats.overUnder.over85}/${cornerStats.cornersAvailable} jogos acima de 8.5`
      });
    } else if (cornerStats.averageCorners >= 7.0) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 7.5 escanteios', 'over'),
        confidence: 'alta',
        reasoning: `Média H2H alta: ${cornerStats.averageCorners.toFixed(1)} escanteios (margem de segurança aplicada)`,
        stats: `${cornerStats.overUnder.over75}/${cornerStats.cornersAvailable} jogos acima de 7.5`
      });
    } else if (cornerStats.averageCorners >= 6.0) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 6.5 escanteios', 'over'),
        confidence: 'média',
        reasoning: `Média H2H moderada-alta: ${cornerStats.averageCorners.toFixed(1)} escanteios (margem de segurança aplicada)`,
        stats: `${cornerStats.overUnder.over65}/${cornerStats.cornersAvailable} jogos acima de 6.5`
      });
    } else if (cornerStats.averageCorners <= 3.5) {
      recommendations.push({
        type: 'under',
        market: this.applySafetyMargin('Under 4.5 escanteios', 'under'),
        confidence: 'alta',
        reasoning: `Média H2H extremamente baixa: ${cornerStats.averageCorners.toFixed(1)} escanteios (margem de segurança aplicada)`,
        stats: `${cornerStats.overUnder.under45}/${cornerStats.cornersAvailable} jogos abaixo de 4.5`
      });
    } else if (cornerStats.averageCorners <= 4.5) {
      recommendations.push({
        type: 'under',
        market: this.applySafetyMargin('Under 5.5 escanteios', 'under'),
        confidence: 'alta',
        reasoning: `Média H2H muito baixa: ${cornerStats.averageCorners.toFixed(1)} escanteios (margem de segurança aplicada)`,
        stats: `${cornerStats.overUnder.under55}/${cornerStats.cornersAvailable} jogos abaixo de 5.5`
      });
    } else if (cornerStats.averageCorners <= 5.5) {
      recommendations.push({
        type: 'under',
        market: this.applySafetyMargin('Under 6.5 escanteios', 'under'),
        confidence: 'média',
        reasoning: `Média H2H baixa: ${cornerStats.averageCorners.toFixed(1)} escanteios (margem de segurança aplicada)`,
        stats: `${cornerStats.overUnder.under65}/${cornerStats.cornersAvailable} jogos abaixo de 6.5`
      });
    }

    // Recomendações baseadas na distribuição (prioridade média)
    const balancedRatio = (cornerStats.distribution.balanced + cornerStats.distribution.veryBalanced) / cornerStats.cornersAvailable;
    const homeDominantRatio = cornerStats.distribution.homeDominant / cornerStats.cornersAvailable;
    const awayDominantRatio = cornerStats.distribution.awayDominant / cornerStats.cornersAvailable;

    if (balancedRatio >= 0.7) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 5.5 escanteios', 'over'),
        confidence: 'média',
        reasoning: 'Distribuição muito equilibrada de escanteios entre os times (margem de segurança aplicada)',
        stats: `${cornerStats.distribution.balanced + cornerStats.distribution.veryBalanced}/${cornerStats.cornersAvailable} jogos equilibrados`
      });
    } else if (balancedRatio >= 0.5) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 6.5 escanteios', 'over'),
        confidence: 'média',
        reasoning: 'Distribuição equilibrada de escanteios entre os times (margem de segurança aplicada)',
        stats: `${cornerStats.distribution.balanced + cornerStats.distribution.veryBalanced}/${cornerStats.cornersAvailable} jogos equilibrados`
      });
    } else if (homeDominantRatio >= 0.6) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 7.5 escanteios', 'over'),
        confidence: 'média',
        reasoning: 'Time da casa domina escanteios no H2H (margem de segurança aplicada)',
        stats: `${cornerStats.distribution.homeDominant}/${cornerStats.cornersAvailable} jogos com domínio da casa`
      });
    } else if (awayDominantRatio >= 0.6) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 7.5 escanteios', 'over'),
        confidence: 'média',
        reasoning: 'Time visitante domina escanteios no H2H (margem de segurança aplicada)',
        stats: `${cornerStats.distribution.awayDominant}/${cornerStats.cornersAvailable} jogos com pressão do visitante`
      });
    }

    // Recomendações baseadas em tendências (prioridade baixa)
    if (cornerStats.trends.increasing) {
      recommendations.push({
        type: 'trend',
        market: 'Over (tendência crescente)',
        confidence: 'média',
        reasoning: 'Tendência crescente de escanteios nos últimos confrontos',
        stats: 'Últimos 3 jogos acima da média histórica'
      });
    } else if (cornerStats.trends.decreasing) {
      recommendations.push({
        type: 'trend',
        market: 'Under (tendência decrescente)',
        confidence: 'média',
        reasoning: 'Tendência decrescente de escanteios nos últimos confrontos',
        stats: 'Últimos 3 jogos abaixo da média histórica'
      });
    }

    // Recomendações baseadas em padrões específicos
    if (cornerStats.overUnder.over85 >= cornerStats.cornersAvailable * 0.7) {
      recommendations.push({
        type: 'over',
        market: this.applySafetyMargin('Over 8.5 escanteios', 'over'),
        confidence: 'alta',
        reasoning: 'Alta frequência de jogos com muitos escanteios (margem de segurança aplicada)',
        stats: `${cornerStats.overUnder.over85}/${cornerStats.cornersAvailable} jogos acima de 8.5`
      });
    } else if (cornerStats.overUnder.under45 >= cornerStats.cornersAvailable * 0.7) {
      recommendations.push({
        type: 'under',
        market: this.applySafetyMargin('Under 4.5 escanteios', 'under'),
        confidence: 'alta',
        reasoning: 'Alta frequência de jogos com poucos escanteios (margem de segurança aplicada)',
        stats: `${cornerStats.overUnder.under45}/${cornerStats.cornersAvailable} jogos abaixo de 4.5`
      });
    }

    // Adicionar recomendações baseadas em gols e resultados
    const goalsRecommendations = this.generateGoalsBasedRecommendations(analysis);
    recommendations.push(...goalsRecommendations);

    // Adicionar recomendações baseadas nas estatísticas dos times
    const teamRecommendations = this.generateTeamBasedRecommendations(analysis);
    recommendations.push(...teamRecommendations);

    return recommendations;
  }

  /**
   * Gera recomendações baseadas nas estatísticas dos times
   */
  generateTeamBasedRecommendations(analysis) {
    const { teamStats, totalMatches } = analysis;
    const recommendations = [];
    
    if (!teamStats.available) {
      return recommendations;
    }
    
    const homeStats = teamStats.homeTeam;
    const awayStats = teamStats.awayTeam;
    
    // Recomendações baseadas na forma atual dos times
    if (homeStats && homeStats.form) {
      const recentForm = homeStats.form.slice(-5); // Últimos 5 jogos
      const wins = (recentForm.match(/W/g) || []).length;
      const draws = (recentForm.match(/D/g) || []).length;
      const losses = (recentForm.match(/L/g) || []).length;
      
      if (wins >= 3) {
        recommendations.push({
          type: 'form',
          market: 'Vencedor: Time Casa',
          confidence: 'média',
          reasoning: `Time da casa em boa forma: ${wins} vitórias nos últimos 5 jogos`,
          stats: `Forma recente: ${recentForm} (${wins}V-${draws}E-${losses}D)`
        });
      } else if (losses >= 3) {
        recommendations.push({
          type: 'form',
          market: 'Vencedor: Time Visitante',
          confidence: 'média',
          reasoning: `Time da casa em má forma: ${losses} derrotas nos últimos 5 jogos`,
          stats: `Forma recente: ${recentForm} (${wins}V-${draws}E-${losses}D)`
        });
      }
    }
    
    if (awayStats && awayStats.form) {
      const recentForm = awayStats.form.slice(-5);
      const wins = (recentForm.match(/W/g) || []).length;
      const draws = (recentForm.match(/D/g) || []).length;
      const losses = (recentForm.match(/L/g) || []).length;
      
      if (wins >= 3) {
        recommendations.push({
          type: 'form',
          market: 'Vencedor: Time Visitante',
          confidence: 'média',
          reasoning: `Time visitante em boa forma: ${wins} vitórias nos últimos 5 jogos`,
          stats: `Forma recente: ${recentForm} (${wins}V-${draws}E-${losses}D)`
        });
      }
    }
    
    // Recomendações baseadas em gols marcados/sofridos
    if (homeStats && homeStats.goals) {
      const homeGoalsFor = parseFloat(homeStats.goals.for.average.total) || 0;
      const homeGoalsAgainst = parseFloat(homeStats.goals.against.average.total) || 0;
      
      if (homeGoalsFor >= 2.0) {
        recommendations.push({
          type: 'goals',
          market: 'Over 2.5 gols',
          confidence: 'média',
          reasoning: `Time da casa marca muitos gols: ${homeGoalsFor.toFixed(1)} gols por jogo`,
          stats: `${homeStats.goals.for.total.total} gols marcados em ${homeStats.fixtures.played.total} jogos`
        });
      }
      
      if (homeGoalsAgainst <= 0.8) {
        recommendations.push({
          type: 'defense',
          market: 'Under 2.5 gols',
          confidence: 'média',
          reasoning: `Time da casa tem boa defesa: ${homeGoalsAgainst.toFixed(1)} gols sofridos por jogo`,
          stats: `${homeStats.clean_sheet.total} jogos sem sofrer gols`
        });
      }
    }
    
    if (awayStats && awayStats.goals) {
      const awayGoalsFor = parseFloat(awayStats.goals.for.average.total) || 0;
      const awayGoalsAgainst = parseFloat(awayStats.goals.against.average.total) || 0;
      
      if (awayGoalsFor >= 1.5) {
        recommendations.push({
          type: 'goals',
          market: 'Over 2.5 gols',
          confidence: 'média',
          reasoning: `Time visitante marca bem fora: ${awayGoalsFor.toFixed(1)} gols por jogo`,
          stats: `${awayStats.goals.for.total.total} gols marcados em ${awayStats.fixtures.played.total} jogos`
        });
      }
    }
    
    // Recomendações baseadas em tendências de gols por tempo
    if (homeStats && homeStats.goals && homeStats.goals.for.minute) {
      const firstHalfGoals = (homeStats.goals.for.minute['0-15']?.total || 0) + 
                            (homeStats.goals.for.minute['16-30']?.total || 0) + 
                            (homeStats.goals.for.minute['31-45']?.total || 0);
      const secondHalfGoals = (homeStats.goals.for.minute['46-60']?.total || 0) + 
                             (homeStats.goals.for.minute['61-75']?.total || 0) + 
                             (homeStats.goals.for.minute['76-90']?.total || 0);
      
      if (firstHalfGoals > secondHalfGoals) {
        recommendations.push({
          type: 'timing',
          market: 'Mais gols no 1º tempo',
          confidence: 'média',
          reasoning: `Time da casa marca mais no primeiro tempo`,
          stats: `${firstHalfGoals} vs ${secondHalfGoals} gols (1º vs 2º tempo)`
        });
      } else if (secondHalfGoals > firstHalfGoals) {
        recommendations.push({
          type: 'timing',
          market: 'Mais gols no 2º tempo',
          confidence: 'média',
          reasoning: `Time da casa marca mais no segundo tempo`,
          stats: `${secondHalfGoals} vs ${firstHalfGoals} gols (2º vs 1º tempo)`
        });
      }
    }
    
    // Recomendações baseadas em over/under
    if (homeStats && homeStats.goals && homeStats.goals.for.under_over) {
      const over25 = homeStats.goals.for.under_over['2.5']?.over || 0;
      const totalGames = homeStats.fixtures.played.total || 0;
      
      if (totalGames > 0) {
        const over25Rate = over25 / totalGames;
        
        if (over25Rate >= 0.6) {
          recommendations.push({
            type: 'over_under',
            market: 'Over 2.5 gols',
            confidence: 'média',
            reasoning: `Time da casa joga muitos jogos com mais de 2.5 gols`,
            stats: `${over25}/${totalGames} jogos acima de 2.5 gols (${(over25Rate * 100).toFixed(0)}%)`
          });
        } else if (over25Rate <= 0.3) {
          recommendations.push({
            type: 'over_under',
            market: 'Under 2.5 gols',
            confidence: 'média',
            reasoning: `Time da casa joga poucos jogos com mais de 2.5 gols`,
            stats: `${over25}/${totalGames} jogos acima de 2.5 gols (${(over25Rate * 100).toFixed(0)}%)`
          });
        }
      }
    }
    
    return recommendations;
  }

  /**
   * Gera recomendações baseadas em gols e resultados (quando não há dados de escanteios)
   */
  generateGoalsBasedRecommendations(analysis) {
    const { totalMatches, h2hAnalysis, leagueAnalysis } = analysis;
    const recommendations = [];
    
    // Recomendações baseadas em resultados H2H
    const homeWinRate = h2hAnalysis.homeWins / totalMatches;
    const awayWinRate = h2hAnalysis.awayWins / totalMatches;
    const drawRate = h2hAnalysis.draws / totalMatches;
    
    if (homeWinRate >= 0.6) {
      recommendations.push({
        type: 'winner',
        market: 'Vencedor: Time Casa',
        confidence: 'alta',
        reasoning: `Time da casa domina o H2H com ${(homeWinRate * 100).toFixed(0)}% de vitórias`,
        stats: `${h2hAnalysis.homeWins}/${totalMatches} vitórias da casa`
      });
    } else if (awayWinRate >= 0.6) {
      recommendations.push({
        type: 'winner',
        market: 'Vencedor: Time Visitante',
        confidence: 'alta',
        reasoning: `Time visitante domina o H2H com ${(awayWinRate * 100).toFixed(0)}% de vitórias`,
        stats: `${h2hAnalysis.awayWins}/${totalMatches} vitórias do visitante`
      });
    } else if (drawRate >= 0.4) {
      recommendations.push({
        type: 'draw',
        market: 'Empate',
        confidence: 'média',
        reasoning: `Alta frequência de empates no H2H: ${(drawRate * 100).toFixed(0)}%`,
        stats: `${h2hAnalysis.draws}/${totalMatches} empates`
      });
    }

    // Recomendações baseadas em gols
    if (h2hAnalysis.averageGoals >= 3.0) {
      recommendations.push({
        type: 'over',
        market: 'Over 2.5 gols',
        confidence: 'alta',
        reasoning: `Média alta de gols no H2H: ${h2hAnalysis.averageGoals.toFixed(1)} gols por jogo`,
        stats: `${h2hAnalysis.totalGoals} gols em ${totalMatches} jogos`
      });
    } else if (h2hAnalysis.averageGoals <= 1.5) {
      recommendations.push({
        type: 'under',
        market: 'Under 2.5 gols',
        confidence: 'alta',
        reasoning: `Média baixa de gols no H2H: ${h2hAnalysis.averageGoals.toFixed(1)} gols por jogo`,
        stats: `${h2hAnalysis.totalGoals} gols em ${totalMatches} jogos`
      });
    }

    // Recomendações baseadas em tendências de tempo
    if (h2hAnalysis.goalTrends.firstHalf > h2hAnalysis.goalTrends.secondHalf) {
      recommendations.push({
        type: 'trend',
        market: 'Mais gols no 1º tempo',
        confidence: 'média',
        reasoning: 'Tendência de mais gols no primeiro tempo no H2H',
        stats: `${h2hAnalysis.goalTrends.firstHalf} vs ${h2hAnalysis.goalTrends.secondHalf} jogos`
      });
    } else if (h2hAnalysis.goalTrends.secondHalf > h2hAnalysis.goalTrends.firstHalf) {
      recommendations.push({
        type: 'trend',
        market: 'Mais gols no 2º tempo',
        confidence: 'média',
        reasoning: 'Tendência de mais gols no segundo tempo no H2H',
        stats: `${h2hAnalysis.goalTrends.secondHalf} vs ${h2hAnalysis.goalTrends.firstHalf} jogos`
      });
    }

    // Recomendações baseadas em ligas específicas
    Object.keys(leagueAnalysis.leagues).forEach(leagueId => {
      const league = leagueAnalysis.leagues[leagueId];
      if (league.matches >= 3) {
        const leagueHomeWinRate = league.homeWins / league.matches;
        const leagueAwayWinRate = league.awayWins / league.matches;
        
        if (leagueHomeWinRate >= 0.7) {
          recommendations.push({
            type: 'league_specific',
            market: `Vencedor Casa - ${league.name}`,
            confidence: 'média',
            reasoning: `Time da casa domina especificamente na ${league.name}`,
            stats: `${league.homeWins}/${league.matches} vitórias da casa na liga`
          });
        } else if (leagueAwayWinRate >= 0.7) {
          recommendations.push({
            type: 'league_specific',
            market: `Vencedor Visitante - ${league.name}`,
            confidence: 'média',
            reasoning: `Time visitante domina especificamente na ${league.name}`,
            stats: `${league.awayWins}/${league.matches} vitórias do visitante na liga`
          });
        }
      }
    });

    // Adicionar recomendações baseadas nas estatísticas dos times
    const teamRecommendations = this.generateTeamBasedRecommendations(analysis);
    recommendations.push(...teamRecommendations);

    return recommendations;
  }

  /**
   * Calcula nível de confiança da análise baseada em dados reais
   */
  calculateConfidence(analysis) {
    const { totalMatches, h2hAnalysis, cornerStats } = analysis;
    
    let confidence = 'baixa';
    let score = 0;
    
    // Pontuação baseada no número de jogos
    if (totalMatches >= 10) score += 3;
    else if (totalMatches >= 7) score += 2;
    else if (totalMatches >= 5) score += 1;
    else if (totalMatches >= 3) score += 0.5;
    
    // Pontuação baseada na qualidade dos dados H2H
    if (h2hAnalysis.totalMatches >= 5) score += 2;
    if (h2hAnalysis.averageGoals > 0) score += 1;
    
    // Pontuação baseada na diversidade de ligas
    const leagueCount = Object.keys(analysis.leagueAnalysis.leagues).length;
    if (leagueCount >= 3) score += 1;
    else if (leagueCount >= 2) score += 0.5;
    
    // Pontuação baseada na recência dos dados
    if (h2hAnalysis.seasonAnalysis.recent > h2hAnalysis.seasonAnalysis.historical) score += 1;
    
    // Determinar confiança baseada na pontuação
    if (score >= 6) confidence = 'alta';
    else if (score >= 4) confidence = 'média';
    else confidence = 'baixa';
    
    console.log(`📊 Confiança calculada: ${confidence} (score: ${score})`);
    return confidence;
  }

  /**
   * Obtém resultado da partida
   */
  getMatchResult(teams) {
    // A API H2H retorna o campo 'winner' dentro de teams
    if (teams.home.winner) return 'home';
    if (teams.away.winner) return 'away';
    return 'draw';
  }

  /**
   * Gera análise padrão quando não há dados
   */
  generateDefaultH2HAnalysis() {
    return {
      totalMatches: 0,
      h2hAnalysis: {
        totalMatches: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalGoals: 0,
        homeGoals: 0,
        awayGoals: 0,
        averageGoals: 0,
        goalTrends: {
          firstHalf: 0,
          secondHalf: 0,
          balanced: 0
        },
        venueAnalysis: {
          homeVenue: 0,
          awayVenue: 0,
          neutralVenue: 0
        },
        seasonAnalysis: {
          recent: 0,
          historical: 0
        }
      },
      cornerStats: {
        totalCorners: 0,
        averageCorners: 0,
        homeTeamCorners: 0,
        awayTeamCorners: 0,
        cornersAvailable: 0, // Contador de partidas com dados de escanteios
        overUnder: {
          over85: 0, under85: 0,
          over75: 0, under75: 0,
          over65: 0, under65: 0,
          over55: 0, under55: 0,
          over45: 0, under45: 0
        },
        distribution: {
          balanced: 0,
          homeDominant: 0,
          awayDominant: 0,
          veryBalanced: 0
        },
        trends: {
          increasing: 0,
          decreasing: 0,
          stable: 0
        }
      },
      // Novas estatísticas dos times
      teamStats: {
        homeTeam: null,
        awayTeam: null,
        available: false
      },
      matchDetails: [],
      recommendations: [{
        type: 'warning',
        message: 'Dados H2H insuficientes para análise (API não retornou dados)',
        confidence: 'baixa'
      }],
      confidence: 'baixa',
      leagueAnalysis: {
        totalLeagues: 0,
        leagues: {},
        seasons: {}
      }
    };
  }

  /**
   * Gera dados fictícios para testes (DEPRECATED - não usado mais)
   */
  generateMockH2HData(team1Id, team2Id) {
    console.log('⚠️ Função generateMockH2HData está deprecated - usando dados reais da API');
    return this.generateDefaultH2HAnalysis();
  }



  /**
   * Busca análise H2H completa com corner kicks
   */
  async getCompleteH2HCornerAnalysis(fixture) {
    try {
      console.log('🔍 getCompleteH2HCornerAnalysis - fixture:', JSON.stringify(fixture, null, 2));
      
      // Extrair IDs dos times de forma mais robusta
      let team1Id, team2Id;
      
      if (fixture.teams) {
        // Estrutura: { teams: { home: { id: X }, away: { id: Y } } }
        team1Id = fixture.teams.home?.id;
        team2Id = fixture.teams.away?.id;
      } else if (fixture.home && fixture.away) {
        // Estrutura: { home: { id: X }, away: { id: Y } }
        team1Id = fixture.home?.id;
        team2Id = fixture.away?.id;
      } else {
        // Estrutura: { home: X, away: Y } (onde X e Y são IDs diretos)
        team1Id = fixture.home;
        team2Id = fixture.away;
      }
      
      console.log('🔍 team1Id:', team1Id, 'team2Id:', team2Id);
      
      if (!team1Id || !team2Id) {
        console.log('⚠️ IDs dos times não encontrados, usando valores padrão');
        const defaultTeam1Id = 33;
        const defaultTeam2Id = 34;
        
        const h2hAnalysis = await this.getH2HCornerData(defaultTeam1Id, defaultTeam2Id, {
          // Removido 'last: 10' para obter todas as partidas disponíveis
          season: new Date().getFullYear()
        });
        
        // Se não conseguiu dados da API, usar análise padrão
        const finalAnalysis = h2hAnalysis || this.generateDefaultH2HAnalysis();
        
        return {
          fixture: {
            id: fixture.fixture?.id || fixture.id || 'default',
            home: fixture.teams?.home?.name || fixture.home?.name || 'Team A',
            away: fixture.teams?.away?.name || fixture.away?.name || 'Team B'
          },
          h2hAnalysis: finalAnalysis,  // Manter estrutura original
          timestamp: new Date().toISOString()
        };
      }
      
      // Buscar dados H2H reais da API com parâmetros simples e eficientes
      const h2hAnalysis = await this.getH2HCornerData(team1Id, team2Id, {
        // Removido 'last: 10' para obter todas as partidas disponíveis
        // Removido filtro 'season' que pode estar filtrando demais
        // Removidos filtros 'from' e 'to' que estavam filtrando demais os resultados
      });
      
      // Se não conseguiu dados da API, usar análise padrão
      const finalAnalysis = h2hAnalysis || this.generateDefaultH2HAnalysis();
      
      console.log('✅ Análise H2H completa obtida da API:', {
        totalMatches: finalAnalysis?.totalMatches || 0,
        homeWins: finalAnalysis?.h2hAnalysis?.homeWins || 0,
        awayWins: finalAnalysis?.h2hAnalysis?.awayWins || 0,
        draws: finalAnalysis?.h2hAnalysis?.draws || 0,
        averageGoals: finalAnalysis?.h2hAnalysis?.averageGoals || 0
      });
      
      return {
        fixture: {
          id: fixture.fixture?.id || fixture.id,
          home: fixture.teams?.home?.name || fixture.home?.name || 'Team A',
          away: fixture.teams?.away?.name || fixture.away?.name || 'Team B'
        },
        h2hAnalysis: finalAnalysis,  // Manter estrutura original
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro na análise H2H completa de corner kicks:', error.message);
      return null;
    }
  }
}

module.exports = new H2HCornerAnalysisService();
