const axios = require('axios');
require('dotenv').config({ path: '../../config.env' });

class ApiService {
  constructor() {
    this.baseURL = process.env.API_SPORTS_BASE_URL;
    this.apiKey = process.env.API_SPORTS_KEY;
    this.host = process.env.API_SPORTS_HOST;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.host,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  // Método genérico para fazer requisições
  async makeRequest(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error.message);
      throw new Error(`Falha na requisição: ${error.message}`);
    }
  }

  // FIXTURES
  async getFixtures(params = {}) {
    return this.makeRequest('/fixtures', params);
  }

  async getFixtureById(id) {
    return this.makeRequest('/fixtures', { id });
  }

  async getFixturesByDate(date) {
    return this.makeRequest('/fixtures', { date });
  }

  async getFixturesByLeague(league, season) {
    return this.makeRequest('/fixtures', { league, season });
  }

  async getLiveFixtures() {
    return this.makeRequest('/fixtures', { live: 'all' });
  }

  // ODDS
  async getOdds(params = {}) {
    return this.makeRequest('/odds', params);
  }

  async getOddsByFixture(fixtureId) {
    return this.makeRequest('/odds', { fixture: fixtureId });
  }

  async getOddsByLeague(league, season) {
    return this.makeRequest('/odds', { league, season });
  }

  async getLiveOdds(params = {}) {
    return this.makeRequest('/odds/live', params);
  }

  async getBookmakers() {
    return this.makeRequest('/odds/bookmakers');
  }

  async getBets() {
    return this.makeRequest('/odds/bets');
  }

  // LEAGUES
  async getLeagues(params = {}) {
    return this.makeRequest('/leagues', params);
  }

  async getLeagueById(id) {
    return this.makeRequest('/leagues', { id });
  }

  async getSeasons() {
    return this.makeRequest('/leagues/seasons');
  }

  // TEAMS
  async getTeams(params = {}) {
    return this.makeRequest('/teams', params);
  }

  async getTeamById(id) {
    return this.makeRequest('/teams', { id });
  }

  async getTeamStatistics(team, league, season) {
    return this.makeRequest('/teams/statistics', { team, league, season });
  }

  // STANDINGS
  async getStandings(league, season) {
    return this.makeRequest('/standings', { league, season });
  }

  // STATISTICS
  async getFixtureStatistics(fixture) {
    return this.makeRequest('/fixtures/statistics', { fixture });
  }

  async getPlayerStatistics(player, season) {
    return this.makeRequest('/players/statistics', { player, season });
  }

  // PLAYERS
  async getPlayers(team, season) {
    return this.makeRequest('/players', { team, season });
  }

  async getPlayerById(id) {
    return this.makeRequest('/players', { id });
  }

  // PREDICTIONS
  async getPredictions(fixture) {
    return this.makeRequest('/predictions', { fixture });
  }

  async getPredictionsByLeague(league, season) {
    return this.makeRequest('/predictions', { league, season });
  }

  async getPredictionsByDate(date) {
    return this.makeRequest('/predictions', { date });
  }

  // HEAD TO HEAD
  async getHeadToHead(team1Id, team2Id, params = {}) {
    const h2h = `${team1Id}-${team2Id}`;
    return this.makeRequest('/fixtures/headtohead', { h2h, ...params });
  }
  
  async getHeadToHeadLast(team1Id, team2Id, last = 5) {
    return this.getHeadToHead(team1Id, team2Id, { last });
  }
  
  async getHeadToHeadByLeague(team1Id, team2Id, leagueId, season) {
    return this.getHeadToHead(team1Id, team2Id, { league: leagueId, season });
  }
  
  async getHeadToHeadByDateRange(team1Id, team2Id, from, to) {
    return this.getHeadToHead(team1Id, team2Id, { from, to });
  }

  // COUNTRIES
  async getCountries() {
    return this.makeRequest('/countries');
  }

  // TIMEZONE
  async getTimezones() {
    return this.makeRequest('/timezone');
  }

  // STATUS (para verificar limites da API)
  async getStatus() {
    return this.makeRequest('/status');
  }
}

module.exports = new ApiService();
