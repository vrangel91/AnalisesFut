const express = require('express');
const router = express.Router();
const apiService = require('../services/apiService');

// GET /api/odds - Listar odds com filtros
router.get('/', async (req, res) => {
  try {
    const { 
      fixture, 
      league, 
      season, 
      date, 
      bookmaker, 
      bet, 
      page = 1 
    } = req.query;

    const params = { page };
    
    if (fixture) params.fixture = fixture;
    if (league) params.league = league;
    if (season) params.season = season;
    if (date) params.date = date;
    if (bookmaker) params.bookmaker = bookmaker;
    if (bet) params.bet = bet;

    const odds = await apiService.getOdds(params);
    
    res.json({
      success: true,
      data: odds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/odds/live - Odds ao vivo
router.get('/live', async (req, res) => {
  try {
    const { fixture, league, bet } = req.query;
    
    const params = {};
    if (fixture) params.fixture = fixture;
    if (league) params.league = league;
    if (bet) params.bet = bet;

    const liveOdds = await apiService.getLiveOdds(params);
    
    res.json({
      success: true,
      data: liveOdds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/odds/fixture/:fixtureId - Odds de um jogo específico
router.get('/fixture/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const odds = await apiService.getOddsByFixture(fixtureId);
    
    res.json({
      success: true,
      data: odds,
      fixture: fixtureId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/odds/league/:leagueId - Odds de uma liga
router.get('/league/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { season } = req.query;
    
    if (!season) {
      return res.status(400).json({
        success: false,
        error: 'Season é obrigatório'
      });
    }
    
    const odds = await apiService.getOddsByLeague(leagueId, season);
    
    res.json({
      success: true,
      data: odds,
      league: leagueId,
      season,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/odds/bookmakers - Listar casas de apostas
router.get('/bookmakers', async (req, res) => {
  try {
    const { id, search } = req.query;
    
    const params = {};
    if (id) params.id = id;
    if (search) params.search = search;

    const bookmakers = await apiService.getBookmakers();
    
    res.json({
      success: true,
      data: bookmakers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/odds/bets - Listar tipos de apostas
router.get('/bets', async (req, res) => {
  try {
    const { id, search } = req.query;
    
    const params = {};
    if (id) params.id = id;
    if (search) params.search = search;

    const bets = await apiService.getBets();
    
    res.json({
      success: true,
      data: bets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/odds/analysis/:fixtureId - Análise de odds para um jogo
router.get('/analysis/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    // Buscar odds do jogo
    const odds = await apiService.getOddsByFixture(fixtureId);
    
    // Buscar informações do jogo
    const fixture = await apiService.getFixtureById(fixtureId);
    
    // Análise básica das odds
    let analysis = {
      fixture: fixtureId,
      averageOdds: {},
      bestOdds: {},
      bookmakerCount: 0,
      confidence: 'medium'
    };
    
    if (odds.response && odds.response.length > 0) {
      const bookmakers = odds.response[0].bookmakers || [];
      analysis.bookmakerCount = bookmakers.length;
      
      // Calcular odds médias e melhores odds
      if (bookmakers.length > 0) {
        const allBets = bookmakers.flatMap(bm => bm.bets || []);
        const matchWinnerBets = allBets.filter(bet => bet.id === 1); // Match Winner
        
        if (matchWinnerBets.length > 0) {
          const values = matchWinnerBets[0].values || [];
          analysis.averageOdds = {
            home: values.find(v => v.value === 'Home')?.odd || 'N/A',
            away: values.find(v => v.value === 'Away')?.odd || 'N/A',
            draw: values.find(v => v.value === 'Draw')?.odd || 'N/A'
          };
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        odds: odds,
        fixture: fixture,
        analysis: analysis
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
