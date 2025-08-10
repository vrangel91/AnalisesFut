const express = require('express');
const router = express.Router();
const apiService = require('../services/apiService');

// GET /api/statistics/fixture/:fixtureId - Estatísticas de um jogo
router.get('/fixture/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const statistics = await apiService.getFixtureStatistics(fixtureId);
    
    res.json({
      success: true,
      data: statistics,
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

// GET /api/statistics/team/:teamId - Estatísticas de um time
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { league, season } = req.query;
    
    if (!league || !season) {
      return res.status(400).json({
        success: false,
        error: 'League e Season são obrigatórios'
      });
    }
    
    const statistics = await apiService.getTeamStatistics(teamId, league, season);
    
    res.json({
      success: true,
      data: statistics,
      team: teamId,
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

// GET /api/statistics/player/:playerId - Estatísticas de um jogador
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { season } = req.query;
    
    if (!season) {
      return res.status(400).json({
        success: false,
        error: 'Season é obrigatório'
      });
    }
    
    const statistics = await apiService.getPlayerStatistics(playerId, season);
    
    res.json({
      success: true,
      data: statistics,
      player: playerId,
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
