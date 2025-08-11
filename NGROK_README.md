# 🚀 Configuração e Uso do Ngrok

Este documento explica como configurar e usar o ngrok no projeto **IA de Apostas de Futebol**.

## 📋 O que é o Ngrok?

O [ngrok](https://ngrok.com/) é uma ferramenta que cria túneis seguros para expor seu servidor local na internet. É muito útil para:

- **Desenvolvimento**: Testar APIs em dispositivos móveis ou outros computadores
- **Demonstrações**: Compartilhar seu projeto com clientes ou colegas
- **Webhooks**: Receber notificações de serviços externos
- **Testes**: Validar integrações que precisam de URLs públicas

## 🛠️ Instalação

O ngrok já foi instalado como dependência de desenvolvimento:

```bash
npm install --save-dev ngrok
```

## ⚙️ Configuração

### 1. Arquivo de Configuração

O projeto inclui um arquivo `ngrok.config.js` com todas as configurações:

```javascript
module.exports = {
  ngrok: {
    port: process.env.PORT || 3001,
    region: 'us', // us, eu, au, ap, sa, jp, in
    bindTls: true,
    log: 'stdout',
    inspect: false,
  },
  // ... outras configurações
};
```

### 2. Variáveis de Ambiente

Adicione estas variáveis ao seu `config.env` (opcional):

```env
# Ngrok Configuration
NGROK_AUTH_TOKEN=seu_token_aqui
NGROK_REGION=us
```

## 🚀 Como Usar

### Método 1: Automático (Recomendado)

O ngrok inicia automaticamente quando você roda o servidor em modo desenvolvimento:

```bash
npm run dev
```

### Método 2: Script Interativo

Use o script interativo para controlar o ngrok:

```bash
npm run ngrok
```

**Opções disponíveis:**
- `1` - Iniciar túnel
- `2` - Parar túnel
- `3` - Reiniciar túnel
- `4` - Status do túnel
- `5` - Verificar saúde
- `6` - Configuração atual
- `0` - Sair

### Método 3: Comandos Diretos

```bash
# Iniciar túnel
npm run ngrok:start

# Parar túnel
npm run ngrok:stop

# Ver status
npm run ngrok:status
```

### Método 4: Via API REST

O projeto inclui endpoints para gerenciar o ngrok:

```bash
# Status do túnel
GET /api/ngrok/status

# Iniciar túnel
POST /api/ngrok/start

# Parar túnel
POST /api/ngrok/stop

# Reiniciar túnel
POST /api/ngrok/restart

# Verificar saúde
GET /api/ngrok/health

# Configuração atual
GET /api/ngrok/config
```

## 🌐 URLs Geradas

Quando o ngrok estiver rodando, você verá algo assim no console:

```
✅ Ngrok iniciado: https://abc123.ngrok.io
📱 Acesse de qualquer dispositivo: https://abc123.ngrok.io
```

**URLs disponíveis:**
- **Local**: `http://localhost:3001`
- **Ngrok**: `https://abc123.ngrok.io` (exemplo)

## 🔒 Segurança

### Configurações de Segurança

O ngrok está configurado com:

- **TLS/SSL**: Conexões criptografadas
- **Rate Limiting**: Proteção contra spam
- **Desenvolvimento apenas**: Só funciona em modo dev
- **CORS configurado**: Para APIs web

### Autenticação (Opcional)

Para contas ngrok pagas, você pode configurar:

```env
NGROK_AUTH_TOKEN=seu_token_aqui
```

## 📱 Testando em Dispositivos

### 1. Inicie o ngrok
```bash
npm run dev
```

### 2. Copie a URL do ngrok do console
```
https://abc123.ngrok.io
```

### 3. Teste em qualquer dispositivo
- **Smartphone**: Abra o navegador e acesse a URL
- **Outro computador**: Use a URL em qualquer navegador
- **Postman/Insomnia**: Use a URL para testar APIs

## 🐛 Solução de Problemas

### Erro: "Porta já em uso"
```bash
# Verifique se o servidor está rodando
npm run ngrok:status

# Pare o túnel se necessário
npm run ngrok:stop
```

### Erro: "Ngrok não conseguiu conectar"
```bash
# Verifique se o servidor está rodando na porta correta
netstat -an | findstr :3001

# Reinicie o túnel
npm run ngrok:restart
```

### Erro: "CORS bloqueado"
- O ngrok já está configurado com CORS adequado
- Verifique se está usando HTTPS (ngrok sempre usa HTTPS)

### Erro: "Rate limit excedido"
- Contas gratuitas do ngrok têm limite de 40 conexões/minuto
- Considere uma conta paga para uso em produção

## 🔧 Configurações Avançadas

### Mudar Região

Edite `ngrok.config.js`:

```javascript
ngrok: {
  region: 'eu', // Europa
  // ... outras configs
}
```

### Subdomínio Personalizado (Conta Paga)

```javascript
ngrok: {
  subdomain: 'boasvindasbotbet',
  // ... outras configs
}
```

### Autenticação Básica

```javascript
ngrok: {
  basicAuth: ['usuario', 'senha'],
  // ... outras configs
}
```

### Proxy Corporativo

```javascript
ngrok: {
  proxy: 'http://proxy:8080',
  // ... outras configs
}
```

## 📊 Monitoramento

### Status em Tempo Real

O console mostra informações em tempo real:

```
🚀 Iniciando ngrok para desenvolvimento...
✅ Ngrok iniciado: https://abc123.ngrok.io
🌐 Acesse de qualquer dispositivo: https://abc123.ngrok.io
```

### Logs Detalhados

Para logs mais detalhados, edite `ngrok.config.js`:

```javascript
ngrok: {
  log: 'stdout',
  inspect: true, // Interface web de inspeção
}
```

## 🚨 Limitações

### Conta Gratuita
- **Conexões**: 40 por minuto
- **Sessões**: 2 simultâneas
- **Subdomínios**: Aleatórios
- **Regiões**: Limitadas

### Conta Paga
- **Conexões**: Ilimitadas
- **Sessões**: Ilimitadas
- **Subdomínios**: Personalizados
- **Regiões**: Todas disponíveis
- **Suporte**: Prioritário

## 📚 Recursos Adicionais

- [Documentação oficial do ngrok](https://ngrok.com/docs)
- [Tutorial de configuração](https://ngrok.com/docs/getting-started)
- [API de gerenciamento](https://ngrok.com/docs/ngrok-agent-api)

## 🤝 Suporte

Se encontrar problemas:

1. Verifique os logs do console
2. Use `npm run ngrok:status` para diagnóstico
3. Consulte a documentação oficial
4. Verifique se o servidor está rodando

---

**Nota**: O ngrok é uma ferramenta de desenvolvimento. Para produção, use serviços como Heroku, Vercel, ou AWS.
