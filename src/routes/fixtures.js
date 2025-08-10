const express = require('express');
const router = express.Router();
const cachedApiService = require('../services/cachedApiService');
const moment = require('moment');

// GET /api/fixtures - Listar todos os jogos com filtros
router.get('/', async (req, res) => {
  try {
    const { 
      date, 
      league, 
      season, 
      team, 
      live, 
      status, 
      from, 
      to,
      last,
      next,
      page = 1,
      refresh = false
    } = req.query;

    const params = { page };
    
    if (date) params.date = date;
    if (league) params.league = league;
    if (season) params.season = season;
    if (team) params.team = team;
    if (live) params.live = live;
    if (status) params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;
    if (last) params.last = last;
    if (next) params.next = next;

    const fixtures = await cachedApiService.getFixtures(params, refresh === 'true');
    
    res.json({
      success: true,
      data: fixtures,
      cached: fixtures._cached || false,
      responseTime: fixtures._responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/fixtures/today - Jogos de hoje
router.get('/today', async (req, res) => {
  try {
    const { refresh = false } = req.query;
    const today = moment().format('YYYY-MM-DD');
    const fixtures = await cachedApiService.getFixturesByDate(today, refresh === 'true');
    
    res.json({
      success: true,
      data: fixtures.response || [],
      date: today,
      cached: fixtures._cached || false,
      responseTime: fixtures._responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/fixtures/live - Jogos ao vivo
router.get('/live', async (req, res) => {
  try {
    const { refresh = false } = req.query;
    const fixtures = await cachedApiService.getLiveFixtures(refresh === 'true');
    
    res.json({
      success: true,
      data: fixtures.response || [],
      cached: fixtures._cached || false,
      responseTime: fixtures._responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/fixtures/:id - Jogo específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { refresh = false } = req.query;
    const fixture = await cachedApiService.getFixtureById(id, refresh === 'true');
    
    res.json({
      success: true,
      data: fixture,
      cached: fixture._cached || false,
      responseTime: fixture._responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/fixtures/league/:leagueId - Jogos de uma liga
router.get('/league/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { season, refresh = false } = req.query;
    
    if (!season) {
      return res.status(400).json({
        success: false,
        error: 'Season é obrigatório'
      });
    }
    
    const fixtures = await cachedApiService.getFixturesByLeague(leagueId, season, refresh === 'true');
    
    res.json({
      success: true,
      data: fixtures,
      league: leagueId,
      season,
      cached: fixtures._cached || false,
      responseTime: fixtures._responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/fixtures/team/:teamId - Jogos de um time
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { last, next, refresh = false } = req.query;
    
    const params = { team: teamId };
    if (last) params.last = last;
    if (next) params.next = next;
    
    const fixtures = await cachedApiService.getFixtures(params, refresh === 'true');
    
    res.json({
      success: true,
      data: fixtures,
      team: teamId,
      cached: fixtures._cached || false,
      responseTime: fixtures._responseTime,
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
