const express = require('express');
const router = express.Router();
const H2HAnalysisService = require('../services/h2hAnalysisService');

const h2hService = new H2HAnalysisService();

// GET /api/h2h/:team1Id/:team2Id - Análise H2H entre dois times
router.get('/:team1Id/:team2Id', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.params;
    const { last = 10, league, season, from, to } = req.query;
    
    const options = { last: parseInt(last) };
    if (league) options.league = parseInt(league);
    if (season) options.season = parseInt(season);
    if (from) options.from = from;
    if (to) options.to = to;

    const h2hData = await h2hService.getH2HData(team1Id, team2Id, options);
    
    res.json({
      success: true,
      data: h2hData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter dados H2H:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/h2h/analysis/:fixtureId - Análise H2H para um fixture específico
router.get('/analysis/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    // Primeiro obter o fixture
    const apiService = require('../services/apiService');
    const fixture = await apiService.getFixtureById(fixtureId);
    
    if (!fixture.response || fixture.response.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Fixture não encontrado'
      });
    }

    const fixtureData = fixture.response[0];
    const analysis = await h2hService.getCompleteH2HAnalysis(fixtureData);
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter análise H2H:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/h2h/stats/:team1Id/:team2Id - Estatísticas H2H
router.get('/stats/:team1Id/:team2Id', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.params;
    const { last = 10 } = req.query;
    
    const h2hData = await h2hService.getH2HData(team1Id, team2Id, { last: parseInt(last) });
    
    if (!h2hData.analysis) {
      return res.json({
        success: true,
        data: {
          totalMatches: 0,
          message: 'Dados H2H insuficientes'
        },
        timestamp: new Date().toISOString()
      });
    }

    const stats = {
      totalMatches: h2hData.analysis.totalMatches,
      homeWins: h2hData.analysis.homeWins,
      awayWins: h2hData.analysis.awayWins,
      draws: h2hData.analysis.draws,
      homeWinRate: h2hData.analysis.homeWinRate,
      awayWinRate: h2hData.analysis.awayWinRate,
      drawRate: h2hData.analysis.drawRate,
      averageGoals: h2hData.analysis.averageGoals,
      over25Rate: h2hData.analysis.over25Rate,
      over35Rate: h2hData.analysis.over35Rate,
      bothTeamsScoredRate: h2hData.analysis.bothTeamsScoredRate,
      recentForm: h2hData.analysis.recentForm
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas H2H:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/h2h/matches/:team1Id/:team2Id - Últimos jogos H2H
router.get('/matches/:team1Id/:team2Id', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.params;
    const { last = 5 } = req.query;
    
    const h2hData = await h2hService.getH2HData(team1Id, team2Id, { last: parseInt(last) });
    
    res.json({
      success: true,
      data: {
        total: h2hData.total,
        matches: h2hData.matches
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter jogos H2H:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router;
