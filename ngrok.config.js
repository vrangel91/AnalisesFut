module.exports = {
  // Configurações do ngrok
  ngrok: {
    // Porta local que será exposta
    port: process.env.PORT || 3001,
    
    // Região do servidor ngrok (us, eu, au, ap, sa, jp, in)
    region: 'us',
    
    // Subdomínio personalizado (requer conta ngrok paga)
    // subdomain: 'boasvindasbotbet',
    
    // Configurações de autenticação (se tiver conta ngrok)
    // authToken: process.env.NGROK_AUTH_TOKEN,
    
    // Configurações de segurança
    bindTls: true,
    
    // Logs detalhados
    log: 'stdout',
    
    // Configurações de CORS para o ngrok
    inspect: false,
    
    // Configurações de proxy (se necessário)
    // proxy: 'http://proxy:8080',
    
    // Configurações de autenticação básica (opcional)
    // basicAuth: ['usuario', 'senha'],
    
    // Configurações de rate limiting
    // rateLimit: '100/minute',
    
    // Configurações de IP whitelist (opcional)
    // allowHosts: ['localhost', '127.0.0.1'],
    
    // Configurações de SSL
    // cert: '/path/to/cert.pem',
    // key: '/path/to/key.pem',
  },
  
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0',
  },
  
  // Configurações de desenvolvimento
  development: {
    // Habilitar ngrok apenas em desenvolvimento
    enabled: process.env.NODE_ENV === 'development',
    
    // Auto-start do ngrok
    autoStart: true,
    
    // Mostrar URL do ngrok no console
    showUrl: true,
  }
};
