# ZEROLOSS - Site de Surebets

Um site moderno para monitoramento de surebets (apostas de arbitragem) desenvolvido com Vue.js, Node.js e WebSocket para notificações em tempo real.

## 🚀 Funcionalidades

- **Monitoramento em Tempo Real**: Busca automática de surebets a cada 30 segundos
- **Notificações Sonoras**: Som de alerta quando novos surebets são encontrados
- **Filtros Inteligentes**: Separação entre apostas pré-live e ao vivo
- **Interface Moderna**: Design responsivo com tema escuro
- **Controles de Busca**: Pausar/retomar busca e ativar/desativar som
- **WebSocket**: Comunicação em tempo real entre cliente e servidor
- **SPA**: Single Page Application com Vue.js

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **WebSocket** - Comunicação em tempo real
- **Axios** - Cliente HTTP
- **Node-cron** - Agendamento de tarefas

### Frontend
- **Vue.js 3** - Framework JavaScript
- **Vue Router** - Roteamento
- **SCSS** - Pré-processador CSS
- **Axios** - Cliente HTTP

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd boasvindasbotbet
```

2. **Instale as dependências do servidor**
```bash
npm install
```

3. **Instale as dependências do cliente**
```bash
cd client
npm install
cd ..
```

4. **Configure o arquivo de som de notificação**
   - Substitua o arquivo `client/public/notification.mp3` por um arquivo de áudio real
   - Você pode encontrar sons gratuitos em:
     - [Freesound](https://freesound.org/)
     - [Mixkit](https://mixkit.co/free-sound-effects/)
     - [Zapsplat](https://www.zapsplat.com/)

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
# Inicia tanto o servidor quanto o cliente
npm run dev
```

### Produção
```bash
# Constrói o cliente
npm run build

# Inicia apenas o servidor
npm run server
```

### Comandos Individuais
```bash
# Apenas o servidor
npm run server

# Apenas o cliente
npm run client

# Construir para produção
npm run build
```

## 🌐 Acessando a Aplicação

- **Cliente**: http://localhost:3001
- **Servidor API**: http://localhost:3001
- **WebSocket**: ws://localhost:8080

## 📁 Estrutura do Projeto

```
boasvindasbotbet/
├── server.js                 # Servidor Node.js
├── package.json              # Dependências do servidor
├── client/                   # Aplicação Vue.js
│   ├── public/
│   │   ├── index.html
│   │   └── notification.mp3  # Som de notificação
│   ├── src/
│   │   ├── components/
│   │   │   └── SurebetCard.vue
│   │   ├── views/
│   │   │   └── SurebetsView.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── assets/
│   │   │   └── styles/
│   │   │       └── main.scss
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vue.config.js
└── README.md
```

## 🔧 Configuração da API

O projeto está configurado para usar a API da ZEROLOSS:
- **URL**: https://zerolossbet.com/api/fetch_surebets/
- **Frequência**: Busca a cada 30 segundos
- **Formato**: JSON com dados de surebets

### Estrutura dos Dados da API

```json
{
  "surebet_record_id": [
    {
      "anchorh1": "url_da_aposta_1",
      "chance": 1.11,
      "date": "2025-08-18",
      "hour": "23:00",
      "house": "Bet365",
      "market": "AH1(+1)",
      "match": "Time A vs Time B",
      "minutes": 0,
      "profit": 4.17,
      "sport": "Futebol",
      "tournament": "Liga X",
      "url_redirect": "url_para_apostar"
    },
    {
      "anchorh2": "url_da_aposta_2",
      // ... dados da segunda aposta
    }
  ]
}
```

## 🎨 Personalização

### Cores
As cores principais podem ser alteradas no arquivo `client/src/assets/styles/main.scss`:

```scss
$primary-color: #00ff88;      // Verde principal
$secondary-color: #2a2a2a;    // Cinza escuro
$background-dark: #1a1a1a;    // Fundo escuro
$background-card: #2d2d2d;    // Fundo dos cards
```

### Som de Notificação
Para alterar o som de notificação:
1. Substitua o arquivo `client/public/notification.mp3`
2. Ou altere a referência no componente `SurebetsView.vue`

## 🔍 Funcionalidades Principais

### 1. Monitoramento Automático
- Busca automática de surebets a cada 30 segundos
- Atualização em tempo real via WebSocket
- Indicador visual de status da busca

### 2. Filtros
- **Pré-live**: Apostas antes do início do jogo
- **Live**: Apostas durante o jogo
- Contador dinâmico de surebets encontrados

### 3. Controles
- **Pausar/Retomar**: Controla a busca automática
- **Som On/Off**: Ativa/desativa notificações sonoras
- **Filtros**: Alterna entre pré-live e live

### 4. Cards de Surebet
- Exibição clara do lucro percentual
- Informações completas do jogo
- Opções de aposta com odds
- Botões diretos para apostar

## 🚨 Notificações

O sistema inclui:
- **Notificações Sonoras**: Som automático para novos surebets
- **WebSocket**: Comunicação em tempo real
- **Indicadores Visuais**: Status da busca e conexão

## 📱 Responsividade

O site é totalmente responsivo e funciona em:
- Desktop (recomendado)
- Tablet
- Mobile

## 🔧 Desenvolvimento

### Adicionando Novos Componentes
1. Crie o componente em `client/src/components/`
2. Importe no componente pai
3. Adicione os estilos necessários

### Modificando a API
1. Altere a URL em `server.js` (linha 25)
2. Ajuste o processamento dos dados conforme necessário
3. Atualize os componentes que consomem os dados

## 🐛 Solução de Problemas

### Erro de Conexão WebSocket
- Verifique se a porta 8080 está livre
- Confirme se o servidor está rodando

### Erro de API
- Verifique a conectividade com a API externa
- Confirme se a URL da API está correta

### Som não toca
- Verifique se o arquivo `notification.mp3` existe
- Confirme se o navegador permite reprodução de áudio

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato através do email: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ para a comunidade de apostas esportivas**
