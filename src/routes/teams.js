const express = require('express');
const router = express.Router();
const apiService = require('../services/apiService');

// GET /api/teams - Listar times
router.get('/', async (req, res) => {
  try {
    const { league, season, country, search } = req.query;
    
    const params = {};
    if (league) params.league = league;
    if (season) params.season = season;
    if (country) params.country = country;
    if (search) params.search = search;

    const teams = await apiService.getTeams(params);
    
    res.json({
      success: true,
      data: teams,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/teams/:id - Time específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const team = await apiService.getTeamById(id);
    
    res.json({
      success: true,
      data: team,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/teams/:id/statistics - Estatísticas do time
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    const { league, season } = req.query;
    
    if (!league || !season) {
      return res.status(400).json({
        success: false,
        error: 'League e Season são obrigatórios'
      });
    }
    
    const statistics = await apiService.getTeamStatistics(id, league, season);
    
    res.json({
      success: true,
      data: statistics,
      team: id,
      league,
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

// GET /api/teams/:id/players - Jogadores do time
router.get('/:id/players', async (req, res) => {
  try {
    const { id } = req.params;
    const { season } = req.query;
    
    if (!season) {
      return res.status(400).json({
        success: false,
        error: 'Season é obrigatório'
      });
    }
    
    const players = await apiService.getPlayers(id, season);
    
    res.json({
      success: true,
      data: players,
      team: id,
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

module.exports = router;
