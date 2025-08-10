# 🚀 IA de Apostas de Futebol

Uma aplicação completa de inteligência artificial para análise e predição de apostas de futebol, utilizando a API-SPORTS para dados em tempo real.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

Este projeto é uma plataforma completa de IA para apostas de futebol que combina:

- **Análise de Dados em Tempo Real**: Utiliza a API-SPORTS para obter dados atualizados
- **Predições Inteligentes**: Algoritmos de IA para gerar predições baseadas em múltiplos fatores
- **Interface Moderna**: Frontend React com design responsivo e intuitivo
- **Backend Robusto**: API RESTful com Node.js e Express

## ✨ Funcionalidades

### 🏠 Dashboard
- Visão geral dos jogos do dia
- Jogos ao vivo
- Estatísticas em tempo real
- Predições da IA

### ⚽ Jogos (Fixtures)
- Lista completa de jogos
- Filtros por data, status e busca
- Informações detalhadas de cada partida
- Status em tempo real

### 🧠 Predições da IA
- Análise inteligente de jogos
- Predições com níveis de confiança
- Probabilidades calculadas
- Recomendações personalizadas

### 🎲 Odds e Probabilidades
- Análise de odds das casas de apostas
- Comparação de probabilidades
- Histórico de variações
- Melhores oportunidades

### 📊 Estatísticas
- Estatísticas detalhadas dos times
- Performance de jogadores
- Análise de histórico
- Gráficos e visualizações

### 🏆 Ligas e Times
- Informações completas das ligas
- Dados dos times
- Classificações
- Histórico de confrontos

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Axios** - Cliente HTTP
- **Socket.IO** - Comunicação em tempo real
- **Moment.js** - Manipulação de datas
- **Lodash** - Utilitários JavaScript

### Frontend
- **React.js** - Biblioteca JavaScript
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **React Icons** - Ícones
- **Chart.js** - Gráficos (futuro)

### APIs
- **API-SPORTS** - Dados de futebol em tempo real

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta na API-SPORTS

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/boasvindasbotbet.git
cd boasvindasbotbet
```

2. **Instale as dependências do backend**
```bash
npm install
```

3. **Instale as dependências do frontend**
```bash
cd client
npm install
cd ..
```

## ⚙️ Configuração

1. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de configuração
cp config.env.example config.env

# Edite o arquivo config.env com suas configurações
```

2. **Configure a API-SPORTS**
- Obtenha sua chave de API em: https://rapidapi.com/api-sports/api/api-football/
- Adicione a chave no arquivo `config.env`

Exemplo do arquivo `config.env`:
```env
# API Configuration
API_SPORTS_KEY=sua_chave_aqui
API_SPORTS_HOST=v3.football.api-sports.io
API_SPORTS_BASE_URL=https://v3.football.api-sports.io

# Server Configuration
PORT=5000
NODE_ENV=development

# Cache Configuration
CACHE_DURATION=300000
```

## 🚀 Uso

### Desenvolvimento

1. **Inicie o servidor backend**
```bash
npm run dev
```

2. **Inicie o frontend (em outro terminal)**
```bash
cd client
npm start
```

3. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Produção

1. **Build do frontend**
```bash
cd client
npm run build
cd ..
```

2. **Inicie o servidor**
```bash
npm start
```

## 🔌 API Endpoints

### Fixtures (Jogos)
- `GET /api/fixtures` - Listar jogos
- `GET /api/fixtures/today` - Jogos de hoje
- `GET /api/fixtures/live` - Jogos ao vivo
- `GET /api/fixtures/:id` - Jogo específico

### Predictions (Predições)
- `GET /api/predictions/today` - Predições de hoje
- `GET /api/predictions/fixture/:id` - Predição de jogo específico
- `POST /api/predictions/analyze` - Análise completa

### Odds (Probabilidades)
- `GET /api/odds` - Listar odds
- `GET /api/odds/live` - Odds ao vivo
- `GET /api/odds/fixture/:id` - Odds de jogo específico

### Statistics (Estatísticas)
- `GET /api/statistics/fixture/:id` - Estatísticas de jogo
- `GET /api/statistics/team/:id` - Estatísticas de time

### Leagues (Ligas)
- `GET /api/leagues` - Listar ligas
- `GET /api/leagues/:id` - Liga específica

### Teams (Times)
- `GET /api/teams` - Listar times
- `GET /api/teams/:id` - Time específico

## 📁 Estrutura do Projeto

```
boasvindasbotbet/
├── src/
│   ├── routes/           # Rotas da API
│   │   ├── fixtures.js
│   │   ├── predictions.js
│   │   ├── odds.js
│   │   ├── statistics.js
│   │   ├── leagues.js
│   │   └── teams.js
│   └── services/         # Serviços
│       ├── apiService.js
│       └── predictionService.js
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas
│   │   └── App.js
│   └── public/
├── APIS/                 # Documentação das APIs
├── server.js            # Servidor principal
├── package.json
└── config.env           # Configurações
```

## 🧠 Como Funciona a IA

### Algoritmo de Predição

A IA utiliza múltiplos fatores para gerar predições:

1. **Estatísticas dos Times** (30%)
   - Taxa de vitórias/empates/derrotas
   - Média de gols marcados/sofridos
   - Performance em casa/fora

2. **Análise das Odds** (40%)
   - Probabilidades das casas de apostas
   - Variação das odds
   - Consenso entre bookmakers

3. **Forma Recente** (20%)
   - Últimos resultados
   - Sequência de vitórias/derrotas
   - Momentum da equipe

4. **Fatores Adicionais** (10%)
   - Confrontos diretos
   - Lesões importantes
   - Motivação da equipe

### Níveis de Confiança

- **Alta (High)**: 80%+ de confiança
- **Média (Medium)**: 60-79% de confiança  
- **Baixa (Low)**: <60% de confiança

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ⚠️ Aviso Legal

Este projeto é apenas para fins educacionais e de análise. Não garantimos lucros em apostas. Sempre aposte com responsabilidade e dentro dos seus limites financeiros.

## 📞 Suporte

Para suporte, envie um email para: seu-email@exemplo.com

---

**Desenvolvido com ❤️ para a comunidade de apostas esportivas**
