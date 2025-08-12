const axios = require('axios');
const cacheService = require('./cacheService');

class CornerKicksService {
  constructor() {
    this.apiKey = process.env.API_SPORTS_KEY;
    this.apiHost = 'v3.football.api-sports.io';
    this.baseURL = 'https://v3.football.api-sports.io';
  }

  /**
   * Busca dados H2H com foco em corner kicks
   * @param {number} team1Id - ID do primeiro time
   * @param {number} team2Id - ID do segundo time
   * @param {Object} options - Opções de busca
   * @returns {Object} Análise H2H de corner kicks
   */
  async getH2HCornerData(team1Id, team2Id, options = {}) {
    try {
      console.log(`🔍 Buscando dados H2H de corner kicks para times ${team1Id} vs ${team2Id}`);
      
      // Verificar cache primeiro
      const cacheKey = `h2h-corners:${team1Id}:${team2Id}:${options.last || '10'}:${options.season || 'current'}`;
      const cachedData = await cacheService.getCache('h2h-corners', { 
        team1Id, 
        team2Id, 
        last: options.last || '10', 
        season: options.season || 'current' 
      });
      
      if (cachedData) {
        console.log('📦 Retornando análise H2H de corner kicks do cache');
        return {
          ...cachedData,
          source: 'cache'
        };
      }

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

      if (response.data.errors && response.data.errors.length > 0) {
        console.error('❌ Erros da API:', response.data.errors);
        throw new Error(`API Errors: ${response.data.errors.join(', ')}`);
      }

      if (!response.data.response || response.data.response.length === 0) {
        console.log('⚠️ Nenhuma partida H2H encontrada');
        return null;
      }

      // Processar dados H2H focando em corner kicks
      const analysis = this.processH2HCornerData(response.data.response, team1Id, team2Id);
      
      // Salvar no cache por 1 hora (dados H2H mudam pouco)
      await cacheService.setCache('h2h-corners', { 
        team1Id, 
        team2Id, 
        last: options.last || '10', 
        season: options.season || 'current' 
      }, analysis);

      return {
        ...analysis,
        source: 'api'
      };

    } catch (error) {
      console.error('❌ Erro ao buscar dados H2H de corner kicks:', error.message);
      throw error;
    }
  }

  /**
   * Processa dados H2H focando em corner kicks
   * @param {Array} matches - Lista de partidas
   * @param {number} team1Id - ID do primeiro time
   * @param {number} team2Id - ID do segundo time
   * @returns {Object} Análise processada
   */
  processH2HCornerData(matches, team1Id, team2Id) {
    try {
      let team1Corners = 0;
      let team2Corners = 0;
      let totalMatches = 0;
      let team1Wins = 0;
      let team2Wins = 0;
      let draws = 0;
      let over25Corners = 0;
      let under25Corners = 0;
      let over35Corners = 0;
      let under35Corners = 0;

      const matchDetails = [];

      matches.forEach(match => {
        const homeTeam = match.teams?.home;
        const awayTeam = match.teams?.away;
        const goals = match.goals;
        const score = match.score;

        if (!homeTeam || !awayTeam || !goals) {
          return;
        }

        // Determinar qual time é qual
        const isTeam1Home = homeTeam.id === team1Id;
        const isTeam2Home = homeTeam.id === team2Id;
        
        if (!isTeam1Home && !isTeam2Home) {
          return; // Pular se nenhum dos times está nesta partida
        }

        totalMatches++;

        // Contar corner kicks (se disponível)
        const homeCorners = match.statistics?.home?.corners || 0;
        const awayCorners = match.statistics?.away?.corners || 0;
        const totalCorners = homeCorners + awayCorners;

        // Atualizar contadores de corner kicks
        if (isTeam1Home) {
          team1Corners += homeCorners;
          team2Corners += awayCorners;
        } else {
          team1Corners += awayCorners;
          team2Corners += homeCorners;
        }

        // Análise de Over/Under
        if (totalCorners > 2.5) over25Corners++;
        else under25Corners++;

        if (totalCorners > 3.5) over35Corners++;
        else under35Corners++;

        // Análise de resultados
        const homeGoals = goals.home || 0;
        const awayGoals = goals.away || 0;

        if (isTeam1Home) {
          if (homeGoals > awayGoals) team1Wins++;
          else if (awayGoals > homeGoals) team2Wins++;
          else draws++;
        } else {
          if (awayGoals > homeGoals) team1Wins++;
          else if (homeGoals > awayGoals) team2Wins++;
          else draws++;
        }

        // Detalhes da partida
        matchDetails.push({
          date: match.fixture?.date,
          home: homeTeam.name,
          away: awayTeam.name,
          score: `${homeGoals}-${awayGoals}`,
          corners: {
            home: homeCorners,
            away: awayCorners,
            total: totalCorners
          },
          result: homeGoals > awayGoals ? 'home' : awayGoals > homeGoals ? 'away' : 'draw'
        });
      });

      if (totalMatches === 0) {
        return null;
      }

      return {
        teams: {
          team1: { id: team1Id, corners: team1Corners },
          team2: { id: team2Id, corners: team2Corners }
        },
        summary: {
          totalMatches,
          team1Corners,
          team2Corners,
          averageCornersPerMatch: Math.round(((team1Corners + team2Corners) / totalMatches) * 10) / 10,
          team1AverageCorners: Math.round((team1Corners / totalMatches) * 10) / 10,
          team2AverageCorners: Math.round((team2Corners / totalMatches) * 10) / 10
        },
        results: {
          team1Wins,
          team2Wins,
          draws,
          team1WinRate: Math.round((team1Wins / totalMatches) * 100),
          team2WinRate: Math.round((team2Wins / totalMatches) * 100),
          drawRate: Math.round((draws / totalMatches) * 100)
        },
        cornerAnalysis: {
          over25: {
            count: over25Corners,
            percentage: Math.round((over25Corners / totalMatches) * 100)
          },
          under25: {
            count: under25Corners,
            percentage: Math.round((under25Corners / totalMatches) * 100)
          },
          over35: {
            count: over35Corners,
            percentage: Math.round((over35Corners / totalMatches) * 100)
          },
          under35: {
            count: under35Corners,
            percentage: Math.round((under35Corners / totalMatches) * 100)
          }
        },
        matches: matchDetails,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro ao processar dados H2H de corner kicks:', error.message);
      throw error;
    }
  }

  /**
   * Busca análise H2H completa com corner kicks para uma fixture
   * @param {Object} fixture - Dados da fixture
   * @returns {Object} Análise completa
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
          season: new Date().getFullYear()
        });
        
        return {
          fixture: {
            id: fixture.fixture?.id || fixture.id || 'default',
            home: fixture.teams?.home?.name || fixture.home?.name || 'Team A',
            away: fixture.teams?.away?.name || fixture.away?.name || 'Team B'
          },
          h2hAnalysis: h2hAnalysis,
          timestamp: new Date().toISOString()
        };
      }

      const h2hAnalysis = await this.getH2HCornerData(team1Id, team2Id, {
        season: new Date().getFullYear()
      });

      return {
        fixture: {
          id: fixture.fixture?.id || fixture.id,
          home: fixture.teams?.home?.name || fixture.home?.name,
          away: fixture.teams?.away?.name || fixture.away?.name
        },
        h2hAnalysis: h2hAnalysis,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erro ao obter análise H2H completa de corner kicks:', error.message);
      throw error;
    }
  }

  /**
   * Método público para obter análise H2H de corner kicks
   * @param {number} team1Id - ID do primeiro time
   * @param {number} team2Id - ID do segundo time
   * @param {Object} options - Opções de busca
   * @returns {Object} Resposta padronizada
   */
  async getH2HCornerAnalysis(team1Id, team2Id, options = {}) {
    try {
      const analysis = await this.getH2HCornerData(team1Id, team2Id, options);
      
      if (!analysis) {
        return {
          success: false,
          error: 'Análise H2H de corner kicks não disponível para estes times',
          team1Id,
          team2Id
        };
      }

      return {
        success: true,
        data: analysis,
        source: analysis.source,
        team1Id,
        team2Id
      };

    } catch (error) {
      console.error('❌ Erro ao obter análise H2H de corner kicks:', error.message);
      return {
        success: false,
        error: 'Erro ao buscar análise H2H de corner kicks',
        details: error.message,
        team1Id,
        team2Id
      };
    }
  }
}

module.exports = new CornerKicksService();
