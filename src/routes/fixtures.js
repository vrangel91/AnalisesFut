const express = require('express');
const router = express.Router();
const fixturesService = require('../services/fixturesService');
const cacheService = require('../services/cacheService');
// Removido import do h2hCornerAnalysisService para evitar conflitos
// const h2hCornerAnalysisService = require('../services/h2hCornerAnalysisService');

/**
 * @route   GET /api/fixtures/today
 * @desc    Obtém fixtures de hoje
 * @access  Public
 */
router.get('/today', async (req, res) => {
  try {
    const { status, league, team } = req.query;
    
    // Verificar cache primeiro (cache por 30 minutos para fixtures)
    const cacheKey = `fixtures-today:${status || 'all'}:${league || 'all'}:${team || 'all'}`;
    const cachedData = await cacheService.getCache('fixtures-today', { status, league, team });

    if (cachedData) {
      console.log('📦 Retornando fixtures de hoje do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔍 Buscando fixtures de hoje da API');

    const options = {};
    if (status) options.status = status;
    if (league) options.league = league;
    if (team) options.team = team;

    const fixtures = await fixturesService.getTodayFixtures(options);

    if (!fixtures) {
      return res.status(404).json({
        success: false,
        error: 'Fixtures de hoje não disponíveis'
      });
    }

    // Salvar no cache por 30 minutos
    await cacheService.setCache('fixtures-today', { status, league, team }, fixtures);

    res.json({
      success: true,
      data: fixtures,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar fixtures de hoje:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/fixtures/tomorrow
 * @desc    Obtém fixtures de amanhã
 * @access  Public
 */
router.get('/tomorrow', async (req, res) => {
  try {
    const { status, league, team } = req.query;
    
    // Verificar cache primeiro
    const cacheKey = `fixtures-tomorrow:${status || 'all'}:${league || 'all'}:${team || 'all'}`;
    const cachedData = await cacheService.getCache('fixtures-tomorrow', { status, league, team });

    if (cachedData) {
      console.log('📦 Retornando fixtures de amanhã do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔍 Buscando fixtures de amanhã da API');

    const options = {};
    if (status) options.status = status;
    if (league) options.league = league;
    if (team) options.team = team;

    const fixtures = await fixturesService.getTomorrowFixtures(options);

    if (!fixtures) {
      return res.status(404).json({
        success: false,
        error: 'Fixtures de amanhã não disponíveis'
      });
    }

    // Salvar no cache por 30 minutos
    await cacheService.setCache('fixtures-tomorrow', { status, league, team }, fixtures);

    res.json({
      success: true,
      data: fixtures,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar fixtures de amanhã:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/fixtures/upcoming
 * @desc    Obtém próximas fixtures (hoje + amanhã)
 * @access  Public
 */
router.get('/upcoming', async (req, res) => {
  try {
    const { status, league, team } = req.query;
    
    // Verificar cache primeiro
    const cacheKey = `fixtures-upcoming:${status || 'all'}:${league || 'all'}:${team || 'all'}`;
    const cachedData = await cacheService.getCache('fixtures-upcoming', { status, league, team });

    if (cachedData) {
      console.log('📦 Retornando próximas fixtures do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔍 Buscando próximas fixtures da API');

    const options = {};
    if (status) options.status = status;
    if (league) options.league = league;
    if (team) options.team = team;

    const fixtures = await fixturesService.getUpcomingFixtures(options);

    if (!fixtures) {
      return res.status(404).json({
        success: false,
        error: 'Próximas fixtures não disponíveis'
      });
    }

    // Salvar no cache por 30 minutos
    await cacheService.setCache('fixtures-upcoming', { status, league, team }, fixtures);

    res.json({
      success: true,
      data: fixtures,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar próximas fixtures:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/fixtures/date/:date
 * @desc    Obtém fixtures para uma data específica
 * @access  Public
 */
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { status, league, team, timezone } = req.query;
    
    // Verificar cache primeiro
    const cacheKey = `fixtures-date:${date}:${status || 'all'}:${league || 'all'}:${team || 'all'}:${timezone || 'all'}`;
    const cachedData = await cacheService.getCache('fixtures-date', { date, status, league, team, timezone });

    if (cachedData) {
      console.log(`📦 Retornando fixtures de ${date} do cache`);
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Buscando fixtures para a data: ${date}`);

    const options = {};
    if (status) options.status = status;
    if (league) options.league = league;
    if (team) options.team = team;
    if (timezone) options.timezone = timezone;

    const fixtures = await fixturesService.getFixturesByDate(date, options);

    if (!fixtures) {
      return res.status(404).json({
        success: false,
        error: `Fixtures para ${date} não disponíveis`
      });
    }

    // Salvar no cache por 30 minutos
    await cacheService.setCache('fixtures-date', { date, status, league, team, timezone }, fixtures);

    res.json({
      success: true,
      data: fixtures,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Erro ao buscar fixtures para ${req.params.date}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/fixtures/statistics/:fixtureId
 * @desc    Obtém estatísticas completas de uma fixture específica
 * @access  Public
 */
router.get('/statistics/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half, team, type, refresh } = req.query;
    
    console.log(`🔍 Rota /statistics/${fixtureId} chamada`);
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    const options = {};
    if (half) options.half = half;
    if (team) options.team = team;
    if (type) options.type = type;
    if (refresh === 'true') {
      options.forceRefresh = true;
      console.log(`🔄 Forçando atualização das estatísticas para fixture ${fixtureId}`);
    }

    console.log(`📊 Buscando estatísticas completas para fixture ${fixtureId} com opções:`, options);

    const result = await h2hCornerAnalysisService.getFixtureStats(fixtureId, options);

    if (result.success) {
      console.log(`✅ Estatísticas obtidas com sucesso para fixture ${fixtureId}`);
      res.json({
        success: true,
        data: result.data,
        source: result.source,
        fromCache: result.source === 'cache',
        timestamp: result.timestamp
      });
    } else {
      console.log(`⚠️ Estatísticas não disponíveis para fixture ${fixtureId}: ${result.message}`);
      res.status(404).json({
        success: false,
        error: result.message || 'Estatísticas não disponíveis para esta fixture',
        timestamp: result.timestamp
      });
    }

  } catch (error) {
    console.error(`❌ Erro ao buscar estatísticas da fixture ${req.params.fixtureId}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/fixtures/health
 * @desc    Verifica a saúde do serviço de fixtures
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço de fixtures funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
