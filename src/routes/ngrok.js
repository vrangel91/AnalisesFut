const express = require('express');
const router = express.Router();
const ngrokService = require('../services/ngrokService');

// Middleware para verificar se está em desenvolvimento
const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Ngrok só está disponível em modo desenvolvimento'
    });
  }
  next();
};

/**
 * @route   GET /api/ngrok/status
 * @desc    Obtém o status atual do túnel ngrok
 * @access  Public
 */
router.get('/status', devOnly, async (req, res) => {
  try {
    const info = ngrokService.getTunnelInfo();
    const stats = await ngrokService.getTunnelStats();
    const health = await ngrokService.healthCheck();
    
    res.json({
      success: true,
      data: {
        ...info,
        stats,
        health,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao obter status do ngrok',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ngrok/start
 * @desc    Inicia o túnel ngrok
 * @access  Public
 */
router.post('/start', devOnly, async (req, res) => {
  try {
    const tunnelUrl = await ngrokService.startTunnel();
    
    res.json({
      success: true,
      message: 'Túnel ngrok iniciado com sucesso',
      data: {
        tunnelUrl,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao iniciar túnel ngrok',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ngrok/stop
 * @desc    Para o túnel ngrok
 * @access  Public
 */
router.post('/stop', devOnly, async (req, res) => {
  try {
    await ngrokService.stopTunnel();
    
    res.json({
      success: true,
      message: 'Túnel ngrok parado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao parar túnel ngrok',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/ngrok/restart
 * @desc    Reinicia o túnel ngrok
 * @access  Public
 */
router.post('/restart', devOnly, async (req, res) => {
  try {
    const tunnelUrl = await ngrokService.restartTunnel();
    
    res.json({
      success: true,
      message: 'Túnel ngrok reiniciado com sucesso',
      data: {
        tunnelUrl,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao reiniciar túnel ngrok',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/ngrok/health
 * @desc    Verifica a saúde do túnel ngrok
 * @access  Public
 */
router.get('/health', devOnly, async (req, res) => {
  try {
    const health = await ngrokService.healthCheck();
    
    res.json({
      success: true,
      data: {
        healthy: health,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar saúde do ngrok',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/ngrok/config
 * @desc    Obtém a configuração atual do ngrok
 * @access  Public
 */
router.get('/config', devOnly, (req, res) => {
  try {
    const config = require('../../ngrok.config');
    
    res.json({
      success: true,
      data: {
        ngrok: {
          port: config.ngrok.port,
          region: config.ngrok.region,
          bindTls: config.ngrok.bindTls,
          log: config.ngrok.log,
          inspect: config.ngrok.inspect,
        },
        server: config.server,
        development: config.development,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao obter configuração do ngrok',
      details: error.message
    });
  }
});

module.exports = router;
