const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Estado global
let surebets = [];
let isSearching = true;
let soundEnabled = true;
let lastSurebetCount = 0;

// Função para buscar surebets da API
async function fetchSurebets() {
  try {
    const response = await axios.get('https://zerolossbet.com/api/fetch_surebets/');
    const newSurebets = response.data;
    
    // Verificar se há novos surebets
    const currentSurebetCount = Object.keys(newSurebets).length;
    
    if (currentSurebetCount > lastSurebetCount && soundEnabled) {
      // Enviar notificação para todos os clientes conectados
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_surebet',
            count: currentSurebetCount - lastSurebetCount
          }));
        }
      });
    }
    
    surebets = newSurebets;
    lastSurebetCount = currentSurebetCount;
    
    console.log(`Surebets atualizados: ${currentSurebetCount} encontrados`);
  } catch (error) {
    console.error('Erro ao buscar surebets:', error.message);
  }
}

// Agendar busca de surebets a cada 30 segundos
cron.schedule('*/30 * * * * *', () => {
  if (isSearching) {
    fetchSurebets();
  }
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');
  
  // Enviar estado atual para o novo cliente
  try {
    ws.send(JSON.stringify({
      type: 'initial_state',
      surebets: surebets,
      isSearching: isSearching,
      soundEnabled: soundEnabled
    }));
  } catch (error) {
    console.error('Erro ao enviar estado inicial:', error);
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'toggle_search':
          isSearching = data.isSearching;
          console.log(`Busca ${isSearching ? 'ativada' : 'pausada'}`);
          break;
          
        case 'toggle_sound':
          soundEnabled = data.soundEnabled;
          console.log(`Som ${soundEnabled ? 'ativado' : 'desativado'}`);
          break;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });
  
  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
  
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Rotas da API
app.get('/api/surebets', (req, res) => {
  res.json(surebets);
});

app.get('/api/status', (req, res) => {
  res.json({
    isSearching,
    soundEnabled,
    surebetCount: Object.keys(surebets).length
  });
});

app.post('/api/toggle-search', (req, res) => {
  isSearching = req.body.isSearching;
  res.json({ isSearching });
});

app.post('/api/toggle-sound', (req, res) => {
  soundEnabled = req.body.soundEnabled;
  res.json({ soundEnabled });
});

// Rota para servir o SPA (sempre)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Inicializar busca de surebets
fetchSurebets();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`WebSocket rodando na porta 8080`);
});
