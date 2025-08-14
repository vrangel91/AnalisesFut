const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const fs = require('fs');
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
const ngrokRoutes = require('./src/routes/ngrok');
const h2hCornersRoutes = require('./src/routes/h2hCorners');

// Importar novas rotas separadas
const fixtureStatisticsRoutes = require('./src/routes/fixtureStatistics');
const cornerKicksRoutes = require('./src/routes/cornerKicks');
const cornerKicksStatisticsRoutes = require('./src/routes/cornerKicksStatistics');
const apiPredictionsRoutes = require('./src/routes/predictions');

// Importar serviços
const cacheService = require('./src/services/cacheService');
const cachedApiService = require('./src/services/cachedApiService');
const ngrokService = require('./src/services/ngrokService');

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

// Verificar se o diretório build existe
const buildPath = path.join(__dirname, 'client/build');
const buildExists = fs.existsSync(buildPath);

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos apenas se o build existir
if (buildExists) {
  app.use(express.static(buildPath));
  console.log('✅ Servindo arquivos estáticos do build de produção');
} else {
  console.log('⚠️  Diretório build não encontrado - modo desenvolvimento');
}

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
app.use('/api/ngrok', ngrokRoutes);
app.use('/api/h2h-corners', h2hCornersRoutes);

// Novas rotas separadas
app.use('/api/fixture-statistics', fixtureStatisticsRoutes);
app.use('/api/fixtures/statistics', fixtureStatisticsRoutes);
app.use('/api/corner-kicks', cornerKicksRoutes);
app.use('/api/corner-kicks-statistics', cornerKicksStatisticsRoutes);
app.use('/api/api-predictions', apiPredictionsRoutes);

// Rota principal
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IA de Apostas de Futebol funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para servir o frontend (deve vir DEPOIS das rotas da API)
app.get('*', (req, res) => {
  if (buildExists) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.json({ 
      message: 'Frontend não compilado. Execute "npm run build" no diretório client primeiro.',
      development: true,
      buildPath: buildPath
    });
  }
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
  
  // Iniciar ngrok em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('🚀 Iniciando ngrok para desenvolvimento...');
      const tunnelUrl = await ngrokService.startTunnel();
      console.log(`✅ Ngrok iniciado: ${tunnelUrl}`);
    } catch (error) {
      console.error('❌ Erro ao iniciar ngrok:', error.message);
      console.log('⚠️  Servidor continuará funcionando sem ngrok');
    }
  }
  
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
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, fechando servidor...');
  
  // Parar ngrok se estiver rodando
  if (process.env.NODE_ENV === 'development') {
    try {
      await ngrokService.stopTunnel();
    } catch (error) {
      console.error('❌ Erro ao parar ngrok:', error.message);
    }
  }
  
  cacheService.close();
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, fechando servidor...');
  
  // Parar ngrok se estiver rodando
  if (process.env.NODE_ENV === 'development') {
    try {
      await ngrokService.stopTunnel();
    } catch (error) {
      console.error('❌ Erro ao parar ngrok:', error.message);
    }
  }
  
  cacheService.close();
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});
