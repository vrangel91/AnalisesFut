const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config({ path: './config.env' });

// Importar rotas
const fixturesRoutes = require('./src/routes/fixtures');
const oddsRoutes = require('./src/routes/odds');
const statisticsRoutes = require('./src/routes/statistics');
const predictionsRoutes = require('./src/routes/predictions');
const leaguesRoutes = require('./src/routes/leagues');
const teamsRoutes = require('./src/routes/teams');
const h2hRoutes = require('./src/routes/h2h');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 IA de Apostas de Futebol ativa!`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});
