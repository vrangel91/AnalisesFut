const express = require('express');
const router = express.Router();
const fixtureStatisticsService = require('../services/fixtureStatisticsService');

/**
 * GET /api/fixtures/statistics/:fixtureId
 * Busca estatísticas de uma fixture específica
 */
router.get('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { team, half } = req.query;

    console.log(`📊 Rota: Buscando estatísticas para fixture ${fixtureId}`);

    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    const teamId = team ? parseInt(team) : null;
    const includeHalf = half === 'true';

    const statistics = await fixtureStatisticsService.getFixtureStatistics(
      parseInt(fixtureId),
      teamId,
      includeHalf
    );

    if (statistics.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Estatísticas não encontradas para esta fixture',
        fixtureId: parseInt(fixtureId)
      });
    }

    res.json({
      success: true,
      data: {
        fixtureId: parseInt(fixtureId),
        statistics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro na rota de estatísticas de fixture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/fixtures/statistics/:fixtureId/both-teams
 * Busca estatísticas de ambos os times de uma fixture
 */
router.get('/:fixtureId/both-teams', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { homeTeamId, awayTeamId } = req.query;

    console.log(`📊 Rota: Buscando estatísticas de ambos os times para fixture ${fixtureId}`);

    if (!fixtureId || !homeTeamId || !awayTeamId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture e IDs dos times são obrigatórios'
      });
    }

    const statistics = await fixtureStatisticsService.getBothTeamsStatistics(
      parseInt(fixtureId),
      parseInt(homeTeamId),
      parseInt(awayTeamId)
    );

    // Processar estatísticas para formato mais amigável
    const processedStats = {
      fixtureId: parseInt(fixtureId),
      home: statistics.home ? {
        team: statistics.home.team,
        raw: fixtureStatisticsService.extractTeamStatistics(statistics.home),
        attack: fixtureStatisticsService.calculateAttackMetrics(
          fixtureStatisticsService.extractTeamStatistics(statistics.home)
        ),
        defense: fixtureStatisticsService.calculateDefenseMetrics(
          fixtureStatisticsService.extractTeamStatistics(statistics.home)
        ),
        possession: fixtureStatisticsService.calculatePossessionMetrics(
          fixtureStatisticsService.extractTeamStatistics(statistics.home)
        )
      } : null,
      away: statistics.away ? {
        team: statistics.away.team,
        raw: fixtureStatisticsService.extractTeamStatistics(statistics.away),
        attack: fixtureStatisticsService.calculateAttackMetrics(
          fixtureStatisticsService.extractTeamStatistics(statistics.away)
        ),
        defense: fixtureStatisticsService.calculateDefenseMetrics(
          fixtureStatisticsService.extractTeamStatistics(statistics.away)
        ),
        possession: fixtureStatisticsService.calculatePossessionMetrics(
          fixtureStatisticsService.extractTeamStatistics(statistics.away)
        )
      } : null,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: processedStats
    });

  } catch (error) {
    console.error('❌ Erro na rota de estatísticas de ambos os times:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/fixtures/statistics/:fixtureId/team/:teamId
 * Busca estatísticas de um time específico em uma fixture
 */
router.get('/:fixtureId/team/:teamId', async (req, res) => {
  try {
    const { fixtureId, teamId } = req.params;
    const { half } = req.query;

    console.log(`📊 Rota: Buscando estatísticas do time ${teamId} na fixture ${fixtureId}`);

    if (!fixtureId || !teamId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture e ID do time são obrigatórios'
      });
    }

    const includeHalf = half === 'true';
    const statistics = await fixtureStatisticsService.getFixtureStatistics(
      parseInt(fixtureId),
      parseInt(teamId),
      includeHalf
    );

    if (statistics.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Estatísticas não encontradas para este time nesta fixture',
        fixtureId: parseInt(fixtureId),
        teamId: parseInt(teamId)
      });
    }

    const teamStats = statistics[0];
    const processedStats = {
      fixtureId: parseInt(fixtureId),
      teamId: parseInt(teamId),
      team: teamStats.team,
      raw: fixtureStatisticsService.extractTeamStatistics(teamStats),
      attack: fixtureStatisticsService.calculateAttackMetrics(
        fixtureStatisticsService.extractTeamStatistics(teamStats)
      ),
      defense: fixtureStatisticsService.calculateDefenseMetrics(
        fixtureStatisticsService.extractTeamStatistics(teamStats)
      ),
      possession: fixtureStatisticsService.calculatePossessionMetrics(
        fixtureStatisticsService.extractTeamStatistics(teamStats)
      ),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: processedStats
    });

  } catch (error) {
    console.error('❌ Erro na rota de estatísticas de time específico:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
