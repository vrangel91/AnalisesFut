const express = require('express');
const router = express.Router();
const predictionsService = require('../services/predictionsService');
const axios = require('axios');
const cacheService = require('../services/cacheService');

// Função auxiliar para formatar predições no formato esperado pelo frontend
const formatPredictionsForFrontend = (predictions) => {
  console.log('🔍 Debug formatPredictionsForFrontend:');
  console.log('   Tipo de predictions:', typeof predictions);
  console.log('   É array:', Array.isArray(predictions));
  console.log('   É objeto:', typeof predictions === 'object' && predictions !== null);
  console.log('   Keys:', Object.keys(predictions));
  
  if (Object.keys(predictions).length > 0) {
    const firstKey = Object.keys(predictions)[0];
    const firstPrediction = predictions[firstKey];
    console.log('   Primeira chave:', firstKey);
    console.log('   Tipo da primeira chave:', typeof firstKey);
    console.log('   Primeira predição success:', firstPrediction?.success);
    console.log('   Primeira predição data keys:', Object.keys(firstPrediction?.data || {}));
    console.log('   Fixture ID no data:', firstPrediction?.data?.fixture?.fixture?.id);
    console.log('   Tipo do Fixture ID no data:', typeof firstPrediction?.data?.fixture?.fixture?.id);
  }
  
  return Object.entries(predictions)
    .filter(([fixtureId, prediction]) => prediction.success && prediction.data)
    .map(([fixtureId, prediction]) => {
      const { data } = prediction;
      
      console.log(`🔍 Processando fixture ${fixtureId}:`);
      console.log('   Data keys:', Object.keys(data));
      console.log('   Data fixture:', data.fixture);
      
      // O fixtureId já é um número (vem do getMultipleFixturePredictions)
      const numericFixtureId = Number(fixtureId);
      
      // Se não há fixture ID válido, pular esta predição
      if (!numericFixtureId || isNaN(numericFixtureId)) {
        console.warn('⚠️ Predição sem fixture ID válido:', fixtureId, data);
        return null;
      }
      
      return {
        fixture: {
          fixture: {
            id: numericFixtureId, // Usar o ID numérico real da API
            date: data.fixture?.fixture?.date || new Date().toISOString(),
            status: data.fixture?.fixture?.status || 'NS'
          },
          teams: data.teams || {
            home: { name: 'Time Casa', id: 1 },
            away: { name: 'Time Visitante', id: 2 }
          },
          league: data.league || {
            name: 'Liga',
            id: 1,
            country: 'País'
          }
        },
        prediction: data.predictions || {},
        confidence: data.analysis?.confidence || 'Média',
        riskLevel: data.analysis?.riskLevel || 'Médio',
        recommendation: data.analysis?.recommendedBets?.[0] || null,
        analysis: data.analysis || {}, // 🚀 ADICIONADO: Incluir análise completa
        // 🚀 ADICIONADO: Incluir dados necessários para análise avançada
        comparison: data.comparison || {},
        teams: data.teams || {},
        predictions: data.predictions || {}
      };
    })
    .filter(prediction => prediction !== null); // Remover predições inválidas
};

// ===== ROTAS ESPECÍFICAS (DEVEM VIR ANTES DAS ROTAS GENÉRICAS) =====

/**
 * @route   GET /api/predictions/health
 * @desc    Verifica a saúde do serviço de predições
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço de predições funcionando',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/predictions/today
 * @desc    Obtém predições para jogos de hoje (compatibilidade)
 * @access  Public
 */
router.get('/today', async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    // Se for force refresh, limpar cache primeiro
    if (forceRefresh) {
      console.log('🔄 Force refresh: limpando cache de predições de hoje');
      await cacheService.clearCacheByEndpoint('predictions');
    }
    
    // Verificar cache primeiro (se não for force refresh)
    if (!forceRefresh) {
      const cachedData = await cacheService.getCache('predictions', { type: 'today' });
      if (cachedData) {
        console.log('📦 Retornando predições de hoje do cache');
        return res.json({
          success: true,
          data: cachedData,
          fromCache: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('🔮 Buscando predições de hoje da API');
    
    // Buscar fixtures de hoje
    const fixturesResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/fixtures`, {
      params: { 
        date: new Date().toISOString().split('T')[0],
        status: 'NS-LIVE-FT'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_SPORTS_KEY
      }
    });

    if (!fixturesResponse.data.response || fixturesResponse.data.response.length === 0) {
      const emptyData = [];
      // Salvar no cache mesmo sendo vazio
      await cacheService.setCache('predictions', { type: 'today' }, emptyData);
      
      return res.json({
        success: true,
        data: emptyData,
        fromCache: false,
        timestamp: new Date().toISOString()
      });
    }

    // Buscar predições para as primeiras 5 fixtures
    const fixtureIds = fixturesResponse.data.response.slice(0, 5).map(f => f.fixture.id);
    console.log('🔍 Fixture IDs obtidos:', fixtureIds);
    
    // Se for force refresh, limpar cache de cada fixture individualmente
    if (forceRefresh) {
      console.log('🔄 Force refresh: limpando cache de cada fixture...');
      for (const fixtureId of fixtureIds) {
        await cacheService.deleteCache('predictions', { fixtureId });
      }
    }
    
    const predictions = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    // Formatar dados no formato esperado pelo frontend
    console.log('🔍 Antes de formatPredictionsForFrontend:');
    console.log('   Tipo de predictions:', typeof predictions);
    console.log('   Keys:', Object.keys(predictions));
    
    const formattedPredictions = formatPredictionsForFrontend(predictions);
    
    console.log('🔍 Após formatPredictionsForFrontend:');
    console.log('   Número de predições formatadas:', formattedPredictions.length);
    if (formattedPredictions.length > 0) {
      console.log('   Primeira predição ID:', formattedPredictions[0].fixture?.fixture?.id);
      console.log('   Tipo do ID:', typeof formattedPredictions[0].fixture?.fixture?.id);
    }

    // Salvar no cache por 1 hora
    await cacheService.setCache('predictions', { type: 'today' }, formattedPredictions);

    res.json({
      success: true,
      data: formattedPredictions,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições de hoje:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar predições de hoje',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/predictions/live
 * @desc    Obtém predições para jogos ao vivo (compatibilidade)
 * @access  Public
 */
router.get('/live', async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    // Se for force refresh, limpar cache primeiro
    if (forceRefresh) {
      console.log('🔄 Force refresh: limpando cache de predições ao vivo');
      await cacheService.clearCacheByEndpoint('predictions');
    }
    
    // Verificar cache primeiro (se não for force refresh)
    if (!forceRefresh) {
      const cachedData = await cacheService.getCache('predictions', { type: 'live' });
      if (cachedData) {
        console.log('📦 Retornando predições ao vivo do cache');
        return res.json({
          success: true,
          data: cachedData,
          fromCache: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('🔮 Buscando predições ao vivo da API');
    
    // Buscar fixtures ao vivo
    const fixturesResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/fixtures`, {
      params: { 
        status: 'LIVE'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_SPORTS_KEY
      }
    });

    if (!fixturesResponse.data.response || fixturesResponse.data.response.length === 0) {
      const emptyData = [];
      // Salvar no cache mesmo sendo vazio (por 5 minutos para jogos ao vivo)
      await cacheService.setCache('predictions', { type: 'live' }, emptyData);
      
      return res.json({
        success: true,
        data: emptyData,
        fromCache: false,
        timestamp: new Date().toISOString()
      });
    }

    // Buscar predições para as primeiras 5 fixtures
    const fixtureIds = fixturesResponse.data.response.slice(0, 5).map(f => f.fixture.id);
    const predictions = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    // Formatar dados no formato esperado pelo frontend
    const formattedPredictions = formatPredictionsForFrontend(predictions);

    // Salvar no cache por 5 minutos (jogos ao vivo mudam rapidamente)
    await cacheService.setCache('predictions', { type: 'live' }, formattedPredictions);

    res.json({
      success: true,
      data: formattedPredictions,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições ao vivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar predições ao vivo',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/predictions/finished
 * @desc    Obtém predições para jogos finalizados (compatibilidade)
 * @access  Public
 */
router.get('/finished', async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    // Se for force refresh, limpar cache primeiro
    if (forceRefresh) {
      console.log('🔄 Force refresh: limpando cache de predições finalizadas');
      await cacheService.clearCacheByEndpoint('predictions');
    }
    
    // Verificar cache primeiro (se não for force refresh)
    if (!forceRefresh) {
      const cachedData = await cacheService.getCache('predictions', { type: 'finished' });
      if (cachedData) {
        console.log('📦 Retornando predições finalizadas do cache');
        return res.json({
          success: true,
          data: cachedData,
          fromCache: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log('🔮 Buscando predições finalizadas da API');
    
    // Buscar fixtures finalizadas de hoje
    const fixturesResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/fixtures`, {
      params: { 
        date: new Date().toISOString().split('T')[0],
        status: 'FT-AET-PEN'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_SPORTS_KEY
      }
    });

    if (!fixturesResponse.data.response || fixturesResponse.data.response.length === 0) {
      const emptyData = [];
      // Salvar no cache mesmo sendo vazio
      await cacheService.setCache('predictions', { type: 'finished' }, emptyData);
      
      return res.json({
        success: true,
        data: emptyData,
        fromCache: false,
        timestamp: new Date().toISOString()
      });
    }

    // Buscar predições para as primeiras 5 fixtures
    const fixtureIds = fixturesResponse.data.response.slice(0, 5).map(f => f.fixture.id);
    const predictions = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    // Formatar dados no formato esperado pelo frontend
    const formattedPredictions = formatPredictionsForFrontend(predictions);

    // Salvar no cache por 1 hora (jogos finalizados não mudam)
    await cacheService.setCache('predictions', { type: 'finished' }, formattedPredictions);

    res.json({
      success: true,
      data: formattedPredictions,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições finalizadas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar predições finalizadas',
      details: error.message
    });
  }
});

/**
 * 🚀 NOVA: @route   GET /api/predictions/advanced/:fixtureId
 * @desc    Obtém análise avançada completa de uma fixture
 * @access  Public
 */
router.get('/advanced/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { refresh } = req.query;
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    console.log(`🔍 Iniciando análise avançada para fixture ${fixtureId}`);

    const forceRefresh = refresh === 'true';
    const result = await predictionsService.getAdvancedFixtureAnalysis(parseInt(fixtureId), forceRefresh);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao buscar análise avançada:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ===== ROTAS GENÉRICAS (DEVEM VIR DEPOIS DAS ROTAS ESPECÍFICAS) =====

/**
 * @route   GET /api/predictions/:fixtureId
 * @desc    Obtém predições para uma fixture específica
 * @access  Public
 */
router.get('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { refresh } = req.query;
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    const forceRefresh = refresh === 'true';
    const result = await predictionsService.getFixturePredictions(parseInt(fixtureId), forceRefresh);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao buscar predições:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/predictions/refresh/:fixtureId
 * @desc    Força atualização das predições para uma fixture
 * @access  Public
 */
router.post('/refresh/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    console.log(`🔄 Forçando atualização das predições para fixture ${fixtureId}`);
    
    const result = await predictionsService.getFixturePredictions(parseInt(fixtureId), true);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao atualizar predições:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/predictions/multiple
 * @desc    Obtém predições para múltiplas fixtures
 * @access  Public
 */
router.post('/multiple', async (req, res) => {
  try {
    const { fixtureIds } = req.body;
    
    if (!fixtureIds || !Array.isArray(fixtureIds) || fixtureIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array de IDs das fixtures é obrigatório'
      });
    }

    if (fixtureIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Máximo de 10 fixtures por requisição'
      });
    }

    console.log(`🔮 Buscando predições para ${fixtureIds.length} fixtures`);
    
    const results = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições múltiplas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/predictions/clear-cache
 * @desc    Limpa todo o cache de predições
 * @access  Public
 */
router.post('/clear-cache', async (req, res) => {
  try {
    console.log('🗑️ Limpando cache de predições...');
    
    // Limpar cache de predições específico
    await cacheService.clearCacheByEndpoint('predictions');
    
    res.json({
      success: true,
      message: 'Cache de predições limpo com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao limpar cache de predições:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/predictions/cache/:fixtureId
 * @desc    Limpa cache de predições para uma fixture
 * @access  Public
 */
router.delete('/cache/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    const success = await predictionsService.clearPredictionCache(parseInt(fixtureId));

    if (success) {
      res.json({
        success: true,
        message: `Cache de predições limpo para fixture ${fixtureId}`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao limpar cache'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao limpar cache de predições:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
