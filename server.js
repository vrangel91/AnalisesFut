const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config({ path: './config.env' });

// Importar rotas
const fixturesRoutes = require('./src/routes/fixtures');
const oddsRoutes = require('./src/routes/odds');
const statisticsRoutes = require('./src/routes/statistics');
const predictionsRoutes = require('./src/routes/predictions');
const leaguesRoutes = require('./src/routes/leagues');
const teamsRoutes = require('./src/routes/teams');
const h2hRoutes = require('./src/routes/h2h');
const cacheRoutes = require('./src/routes/cache');
const betsRoutes = require('./src/routes/bets');

// Importar serviços
const cacheService = require('./src/services/cacheService');
const cachedApiService = require('./src/services/cachedApiService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Middleware de compressão
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Rotas da API
app.use('/api/fixtures', fixturesRoutes);
app.use('/api/odds', oddsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/leagues', leaguesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/h2h', h2hRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/bets', betsRoutes);

// Rota principal
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IA de Apostas de Futebol funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Socket.IO para atualizações em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Exportar io para uso em outros módulos
app.set('io', io);

// Agendamento de tarefas
const setupCronJobs = () => {
  // Limpar cache expirado a cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('🧹 Executando limpeza automática do cache...');
    try {
      await cacheService.cleanExpiredCache();
      console.log('✅ Limpeza automática concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error);
    }
  });

  // Pré-carregar dados importantes a cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    console.log('🚀 Executando pré-carregamento automático...');
    try {
      await cachedApiService.preloadImportantData();
      console.log('✅ Pré-carregamento automático concluído');
    } catch (error) {
      console.error('❌ Erro no pré-carregamento automático:', error);
    }
  });

  // Atualizar dados ao vivo a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Atualizando dados ao vivo...');
    try {
      const liveFixtures = await cachedApiService.getLiveFixtures(true);
      if (liveFixtures.response && liveFixtures.response.length > 0) {
        io.emit('liveFixturesUpdate', {
          data: liveFixtures.response,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar dados ao vivo:', error);
    }
  });
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 IA de Apostas de Futebol ativa!`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  
  // Inicializar tarefas agendadas
  setupCronJobs();
  
  // Pré-carregar dados importantes na inicialização
  try {
    console.log('🚀 Inicializando pré-carregamento...');
    await cachedApiService.preloadImportantData();
    console.log('✅ Pré-carregamento inicial concluído');
  } catch (error) {
    console.error('❌ Erro no pré-carregamento inicial:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, fechando servidor...');
  cacheService.close();
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, fechando servidor...');
  cacheService.close();
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});
