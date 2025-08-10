const apiService = require('./apiService');
const cacheService = require('./cacheService');
const moment = require('moment');

class CachedApiService {
  constructor() {
    this.apiService = apiService;
    this.cacheService = cacheService;
  }

  // Método genérico com cache
  async makeCachedRequest(endpoint, params = {}, forceRefresh = false) {
    const startTime = Date.now();
    
    try {
      // Tentar obter do cache primeiro (se não for force refresh)
      if (!forceRefresh) {
        const cachedData = await this.cacheService.getCache(endpoint, params);
        if (cachedData) {
          return {
            ...cachedData,
            _cached: true,
            _fromCache: true,
            _lastUpdate: cachedData._lastUpdate || new Date().toISOString(),
            _responseTime: Date.now() - startTime
          };
        }
      }

      // Se não estiver no cache, fazer requisição para API
      console.log(`🌐 Fazendo requisição para API: ${endpoint}`);
      const apiData = await this.apiService.makeRequest(endpoint, params);
      
      // Adicionar timestamp de quando foi cacheado
      const dataWithTimestamp = {
        ...apiData,
        _lastUpdate: new Date().toISOString()
      };
      
      // Salvar no cache
      await this.cacheService.setCache(endpoint, params, dataWithTimestamp);
      
      return {
        ...apiData,
        _cached: false,
        _fromCache: false,
        _lastUpdate: new Date().toISOString(),
        _responseTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error(`Erro na requisição cacheada para ${endpoint}:`, error.message);
      throw error;
    }
  }

  // FIXTURES com cache
  async getFixtures(params = {}, forceRefresh = false) {
    return this.makeCachedRequest('/fixtures', params, forceRefresh);
  }

  async getFixtureById(id, forceRefresh = false) {
    return this.makeCachedRequest('/fixtures', { id }, forceRefresh);
  }

  async getFixturesByDate(date, forceRefresh = false) {
    return this.makeCachedRequest('/fixtures', { date }, forceRefresh);
  }

  async getFixturesByLeague(league, season, forceRefresh = false) {
    return this.makeCachedRequest('/fixtures', { league, season }, forceRefresh);
  }

  async getLiveFixtures(forceRefresh = false) {
    return this.makeCachedRequest('/fixtures', { live: 'all' }, forceRefresh);
  }

  // ODDS com cache
  async getOdds(params = {}, forceRefresh = false) {
    return this.makeCachedRequest('/odds', params, forceRefresh);
  }

  async getOddsByFixture(fixtureId, forceRefresh = false) {
    return this.makeCachedRequest('/odds', { fixture: fixtureId }, forceRefresh);
  }

  async getOddsByLeague(league, season, forceRefresh = false) {
    return this.makeCachedRequest('/odds', { league, season }, forceRefresh);
  }

  async getLiveOdds(params = {}, forceRefresh = false) {
    return this.makeCachedRequest('/odds/live', params, forceRefresh);
  }

  async getBookmakers(forceRefresh = false) {
    return this.makeCachedRequest('/odds/bookmakers', {}, forceRefresh);
  }

  async getBets(forceRefresh = false) {
    return this.makeCachedRequest('/odds/bets', {}, forceRefresh);
  }

  // LEAGUES com cache
  async getLeagues(params = {}, forceRefresh = false) {
    return this.makeCachedRequest('/leagues', params, forceRefresh);
  }

  async getLeagueById(id, forceRefresh = false) {
    return this.makeCachedRequest('/leagues', { id }, forceRefresh);
  }

  async getSeasons(forceRefresh = false) {
    return this.makeCachedRequest('/leagues/seasons', {}, forceRefresh);
  }

  // TEAMS com cache
  async getTeams(params = {}, forceRefresh = false) {
    return this.makeCachedRequest('/teams', params, forceRefresh);
  }

  async getTeamById(id, forceRefresh = false) {
    return this.makeCachedRequest('/teams', { id }, forceRefresh);
  }

  async getTeamStatistics(team, league, season, forceRefresh = false) {
    return this.makeCachedRequest('/teams/statistics', { team, league, season }, forceRefresh);
  }

  // STANDINGS com cache
  async getStandings(league, season, forceRefresh = false) {
    return this.makeCachedRequest('/standings', { league, season }, forceRefresh);
  }

  // STATISTICS com cache
  async getFixtureStatistics(fixture, forceRefresh = false) {
    return this.makeCachedRequest('/fixtures/statistics', { fixture }, forceRefresh);
  }

  async getPlayerStatistics(player, season, forceRefresh = false) {
    return this.makeCachedRequest('/players/statistics', { player, season }, forceRefresh);
  }

  // PLAYERS com cache
  async getPlayers(team, season, forceRefresh = false) {
    return this.makeCachedRequest('/players', { team, season }, forceRefresh);
  }

  async getPlayerById(id, forceRefresh = false) {
    return this.makeCachedRequest('/players', { id }, forceRefresh);
  }

  // PREDICTIONS com cache
  async getPredictions(fixture, forceRefresh = false) {
    return this.makeCachedRequest('/predictions', { fixture }, forceRefresh);
  }

  async getPredictionsByLeague(league, season, forceRefresh = false) {
    return this.makeCachedRequest('/predictions', { league, season }, forceRefresh);
  }

  async getPredictionsByDate(date, forceRefresh = false) {
    return this.makeCachedRequest('/predictions', { date }, forceRefresh);
  }

  // HEAD TO HEAD com cache
  async getHeadToHead(team1Id, team2Id, params = {}, forceRefresh = false) {
    const h2h = `${team1Id}-${team2Id}`;
    return this.makeCachedRequest('/fixtures/headtohead', { h2h, ...params }, forceRefresh);
  }
  
  async getHeadToHeadLast(team1Id, team2Id, last = 5, forceRefresh = false) {
    return this.getHeadToHead(team1Id, team2Id, { last }, forceRefresh);
  }
  
  async getHeadToHeadByLeague(team1Id, team2Id, leagueId, season, forceRefresh = false) {
    return this.getHeadToHead(team1Id, team2Id, { league: leagueId, season }, forceRefresh);
  }
  
  async getHeadToHeadByDateRange(team1Id, team2Id, from, to, forceRefresh = false) {
    return this.getHeadToHead(team1Id, team2Id, { from, to }, forceRefresh);
  }

  // COUNTRIES com cache
  async getCountries(forceRefresh = false) {
    return this.makeCachedRequest('/countries', {}, forceRefresh);
  }

  // TIMEZONE com cache
  async getTimezones(forceRefresh = false) {
    return this.makeCachedRequest('/timezone', {}, forceRefresh);
  }

  // STATUS com cache
  async getStatus(forceRefresh = false) {
    return this.makeCachedRequest('/status', {}, forceRefresh);
  }

  // Métodos de gerenciamento de cache
  async getCacheStats() {
    return this.cacheService.getCacheStats();
  }

  async getCacheSize() {
    return this.cacheService.getCacheSize();
  }

  async cleanExpiredCache() {
    return this.cacheService.cleanExpiredCache();
  }

  // Método para forçar refresh de dados específicos
  async refreshData(endpoint, params = {}) {
    console.log(`🔄 Forçando refresh de dados: ${endpoint}`);
    return this.makeCachedRequest(endpoint, params, true);
  }

  // Método para obter dados com fallback para cache
  async getDataWithFallback(endpoint, params = {}) {
    try {
      // Tentar API primeiro
      return await this.makeCachedRequest(endpoint, params, true);
    } catch (error) {
      console.log(`⚠️ API falhou, tentando cache: ${endpoint}`);
      // Se API falhar, tentar cache
      const cachedData = await this.cacheService.getCache(endpoint, params);
      if (cachedData) {
        return {
          ...cachedData,
          _cached: true,
          _fallback: true,
          _error: error.message
        };
      }
      throw error;
    }
  }

  // Método para pré-carregar dados importantes
  async preloadImportantData() {
    console.log('🚀 Pré-carregando dados importantes...');
    
    const preloadTasks = [
      this.getLeagues(),
      this.getCountries(),
      this.getTimezones(),
      this.getSeasons()
    ];

    try {
      await Promise.allSettled(preloadTasks);
      console.log('✅ Pré-carregamento concluído');
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error);
    }
  }
}

module.exports = new CachedApiService();
