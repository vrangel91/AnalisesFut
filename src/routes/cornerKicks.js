const express = require('express');
const router = express.Router();
const cornerKicksService = require('../services/cornerKicksService');

/**
 * @route   GET /api/corner-kicks/:team1Id/:team2Id
 * @desc    Obtém análise H2H de corner kicks entre dois times
 * @access  Public
 */
router.get('/:team1Id/:team2Id', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.params;
    const { last = '10', season, league, from, to } = req.query;
    
    // Validar IDs dos times
    if (!team1Id || !team2Id || isNaN(parseInt(team1Id)) || isNaN(parseInt(team2Id))) {
      return res.status(400).json({
        success: false,
        error: 'IDs dos times inválidos'
      });
    }

    console.log(`🔍 Requisição de análise H2H de corner kicks: ${team1Id} vs ${team2Id}`);
    
    // Preparar opções
    const options = {
      last: parseInt(last)
    };
    
    if (season) options.season = parseInt(season);
    if (league) options.league = parseInt(league);
    if (from) options.from = from;
    if (to) options.to = to;

    // Buscar análise H2H
    const result = await cornerKicksService.getH2HCornerAnalysis(
      parseInt(team1Id), 
      parseInt(team2Id), 
      options
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
        team1Id: parseInt(team1Id),
        team2Id: parseInt(team2Id)
      });
    }

    res.json({
      success: true,
      data: result.data,
      source: result.source,
      team1Id: parseInt(team1Id),
      team2Id: parseInt(team2Id),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar análise H2H de corner kicks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/corner-kicks/fixture
 * @desc    Obtém análise H2H de corner kicks para dois times específicos
 * @access  Public
 */
router.get('/fixture', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.query;
    
    if (!team1Id || !team2Id) {
      return res.status(400).json({
        success: false,
        error: 'team1Id e team2Id são obrigatórios'
      });
    }

    console.log(`🔍 Analisando H2H de corner kicks para times ${team1Id} vs ${team2Id}`);
    
    const fixture = {
      teams: {
        home: { id: parseInt(team1Id) },
        away: { id: parseInt(team2Id) }
      }
    };

    const analysis = await cornerKicksService.getCompleteH2HCornerAnalysis(fixture);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Análise H2H de corner kicks não disponível para estes times'
      });
    }

    res.json({
      success: true,
      data: analysis,
      team1Id: parseInt(team1Id),
      team2Id: parseInt(team2Id),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao analisar H2H de corner kicks da fixture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/corner-kicks/fixture
 * @desc    Obtém análise H2H de corner kicks para uma fixture específica
 * @access  Public
 */
router.post('/fixture', async (req, res) => {
  try {
    const { fixture } = req.body;
    
    if (!fixture || !fixture.teams) {
      return res.status(400).json({
        success: false,
        error: 'Fixture com times é obrigatória'
      });
    }

    console.log(`🔍 Analisando H2H de corner kicks para fixture`);
    
    const analysis = await cornerKicksService.getCompleteH2HCornerAnalysis(fixture);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Análise H2H de corner kicks não disponível para esta fixture'
      });
    }

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao analisar H2H de corner kicks da fixture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/corner-kicks/health
 * @desc    Verifica a saúde do serviço de corner kicks
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço de Análise de Corner Kicks funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
