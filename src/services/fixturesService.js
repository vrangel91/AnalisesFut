const axios = require('axios');
require('dotenv').config({ path: './config.env' });

class FixturesService {
  constructor() {
    this.baseURL = process.env.API_SPORTS_BASE_URL;
    this.apiKey = process.env.API_SPORTS_KEY;
    this.apiHost = process.env.API_SPORTS_HOST;
  }

  /**
   * Busca fixtures para uma data específica
   */
  async getFixturesByDate(date, options = {}) {
    try {
      console.log(`🔍 Buscando fixtures para a data: ${date}`);
      
      const params = new URLSearchParams();
      params.append('date', date);
      
      // Adicionar parâmetros opcionais
      if (options.status) params.append('status', options.status);
      if (options.timezone) params.append('timezone', options.timezone);
      if (options.league) params.append('league', options.league);
      if (options.season) params.append('season', options.season);
      if (options.team) params.append('team', options.team);
      
      const response = await axios.get(`${this.baseURL}/fixtures?${params.toString()}`, {
        headers: {
          'x-rapidapi-host': this.apiHost,
          'x-rapidapi-key': this.apiKey
        }
      });

      if (response.data.response) {
        console.log(`✅ Encontradas ${response.data.response.length} fixtures para ${date}`);
        return this.processFixturesResponse(response.data);
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar fixtures para ${date}:`, error.message);
      return null;
    }
  }

  /**
   * Busca fixtures de hoje
   */
  async getTodayFixtures(options = {}) {
    const today = new Date().toISOString().split('T')[0];
    return this.getFixturesByDate(today, {
      timezone: 'America/Sao_Paulo',
      ...options
    });
  }

  /**
   * Busca fixtures de amanhã
   */
  async getTomorrowFixtures(options = {}) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    return this.getFixturesByDate(tomorrowStr, {
      timezone: 'America/Sao_Paulo',
      ...options
    });
  }

  /**
   * Busca próximas fixtures (hoje + amanhã)
   */
  async getUpcomingFixtures(options = {}) {
    try {
      console.log('🔍 Buscando próximas fixtures (hoje + amanhã)...');
      
      const [todayFixtures, tomorrowFixtures] = await Promise.all([
        this.getTodayFixtures(options),
        this.getTomorrowFixtures(options)
      ]);

      const upcomingFixtures = {
        today: todayFixtures || { fixtures: [], total: 0 },
        tomorrow: tomorrowFixtures || { fixtures: [], total: 0 },
        total: 0
      };

      // Calcular total
      upcomingFixtures.total = upcomingFixtures.today.total + upcomingFixtures.tomorrow.total;

      console.log(`✅ Total de próximas fixtures: ${upcomingFixtures.total}`);
      return upcomingFixtures;
    } catch (error) {
      console.error('❌ Erro ao buscar próximas fixtures:', error.message);
      return null;
    }
  }

  /**
   * Processa a resposta da API de fixtures
   */
  processFixturesResponse(apiResponse) {
    if (!apiResponse.response) {
      return { fixtures: [], total: 0 };
    }

    const fixtures = apiResponse.response.map(fixture => ({
      id: fixture.fixture?.id,
      date: fixture.fixture?.date,
      timestamp: fixture.fixture?.timestamp,
      status: {
        short: fixture.fixture?.status?.short,
        long: fixture.fixture?.status?.long,
        elapsed: fixture.fixture?.status?.elapsed
      },
      teams: {
        home: {
          id: fixture.teams?.home?.id,
          name: fixture.teams?.home?.name,
          logo: fixture.teams?.home?.logo,
          winner: fixture.teams?.home?.winner
        },
        away: {
          id: fixture.teams?.away?.id,
          name: fixture.teams?.away?.name,
          logo: fixture.teams?.away?.logo,
          winner: fixture.teams?.away?.winner
        }
      },
      goals: {
        home: fixture.goals?.home,
        away: fixture.goals?.away
      },
      score: {
        halftime: fixture.score?.halftime,
        fulltime: fixture.score?.fulltime,
        extratime: fixture.score?.extratime,
        penalty: fixture.score?.penalty
      },
      league: {
        id: fixture.league?.id,
        name: fixture.league?.name,
        country: fixture.league?.country,
        logo: fixture.league?.logo,
        flag: fixture.league?.flag,
        season: fixture.league?.season,
        round: fixture.league?.round
      },
      venue: {
        id: fixture.venue?.id,
        name: fixture.venue?.name,
        city: fixture.venue?.city
      },
      referee: fixture.referee,
      // Informações adicionais para análise
      isLive: this.isFixtureLive(fixture.fixture?.status?.short),
      isFinished: this.isFixtureFinished(fixture.fixture?.status?.short),
      isUpcoming: this.isFixtureUpcoming(fixture.fixture?.status?.short),
      timeUntilStart: this.calculateTimeUntilStart(fixture.fixture?.date)
    }));

    return {
      fixtures: fixtures,
      total: fixtures.length,
      results: apiResponse.results || 0
    };
  }

  /**
   * Verifica se a fixture está ao vivo
   */
  isFixtureLive(status) {
    return status && ['1H', 'HT', '2H', 'ET', 'P'].includes(status);
  }

  /**
   * Verifica se a fixture está finalizada
   */
  isFixtureFinished(status) {
    return status && ['FT', 'AET', 'PEN', 'BT', 'SUSP', 'INT', 'PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status);
  }

  /**
   * Verifica se a fixture está por vir
   */
  isFixtureUpcoming(status) {
    return status && ['NS', 'TBD', 'DELAYED'].includes(status);
  }

  /**
   * Calcula tempo até o início da fixture
   */
  calculateTimeUntilStart(dateString) {
    if (!dateString) return null;
    
    const fixtureDate = new Date(dateString);
    const now = new Date();
    const diff = fixtureDate.getTime() - now.getTime();
    
    if (diff <= 0) return null; // Já começou ou terminou
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Filtra fixtures por status
   */
  filterFixturesByStatus(fixtures, status) {
    if (!fixtures || !fixtures.length) return [];
    
    switch (status) {
      case 'live':
        return fixtures.filter(f => f.isLive);
      case 'upcoming':
        return fixtures.filter(f => f.isUpcoming);
      case 'finished':
        return fixtures.filter(f => f.isFinished);
      case 'today':
        return fixtures.filter(f => f.isUpcoming || f.isLive);
      default:
        return fixtures;
    }
  }

  /**
   * Filtra fixtures por liga
   */
  filterFixturesByLeague(fixtures, leagueName) {
    if (!fixtures || !fixtures.length || !leagueName) return fixtures;
    
    return fixtures.filter(f => 
      f.league?.name?.toLowerCase().includes(leagueName.toLowerCase())
    );
  }

  /**
   * Filtra fixtures por time
   */
  filterFixturesByTeam(fixtures, teamName) {
    if (!fixtures || !fixtures.length || !teamName) return fixtures;
    
    return fixtures.filter(f => 
      f.teams?.home?.name?.toLowerCase().includes(teamName.toLowerCase()) ||
      f.teams?.away?.name?.toLowerCase().includes(teamName.toLowerCase())
    );
  }

  /**
   * Ordena fixtures por data/hora
   */
  sortFixturesByTime(fixtures, ascending = true) {
    if (!fixtures || !fixtures.length) return fixtures;
    
    return [...fixtures].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
}

module.exports = new FixturesService();
