const express = require('express');
const router = express.Router();
const cacheService = require('../services/cacheService');
const cachedApiService = require('../services/cachedApiService');

// GET /api/cache/stats - Estatísticas do cache
router.get('/stats', async (req, res) => {
  try {
    const [stats, size] = await Promise.all([
      cacheService.getCacheStats(),
      cacheService.getCacheSize()
    ]);
    
    res.json({
      success: true,
      data: {
        stats,
        totalEntries: size,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/cache/clean - Limpar cache expirado
router.post('/clean', async (req, res) => {
  try {
    await cacheService.cleanExpiredCache();
    
    res.json({
      success: true,
      message: 'Cache expirado limpo com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/cache/refresh/:endpoint - Forçar refresh de dados específicos
router.post('/refresh/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const { params = {} } = req.body;
    
    const data = await cachedApiService.refreshData(endpoint, params);
    
    res.json({
      success: true,
      data,
      message: `Dados de ${endpoint} atualizados com sucesso`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/cache/preload - Pré-carregar dados importantes
router.post('/preload', async (req, res) => {
  try {
    await cachedApiService.preloadImportantData();
    
    res.json({
      success: true,
      message: 'Pré-carregamento concluído com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/cache/status - Status geral do cache
router.get('/status', async (req, res) => {
  try {
    const [stats, size] = await Promise.all([
      cacheService.getCacheStats(),
      cacheService.getCacheSize()
    ]);
    
    const totalRequests = stats.reduce((sum, stat) => sum + (stat.total_accesses || 0), 0);
    const totalHits = stats.reduce((sum, stat) => sum + (stat.cache_hits || 0), 0);
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        totalEntries: size,
        totalRequests,
        totalHits,
        hitRate: `${hitRate}%`,
        stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
