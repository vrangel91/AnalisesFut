const express = require('express');
const router = express.Router();
const apiService = require('../services/apiService');

// GET /api/leagues - Listar todas as ligas
router.get('/', async (req, res) => {
  try {
    const { country, season, type, current } = req.query;
    
    const params = {};
    if (country) params.country = country;
    if (season) params.season = season;
    if (type) params.type = type;
    if (current) params.current = current;

    const leagues = await apiService.getLeagues(params);
    
    res.json({
      success: true,
      data: leagues,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/leagues/:id - Liga específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const league = await apiService.getLeagueById(id);
    
    res.json({
      success: true,
      data: league,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/leagues/seasons - Listar temporadas
router.get('/seasons', async (req, res) => {
  try {
    const seasons = await apiService.getSeasons();
    
    res.json({
      success: true,
      data: seasons,
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
