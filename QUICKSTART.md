# 🚀 Início Rápido - ZEROLOSS Surebets

## Instalação Rápida

### Windows
```bash
# Execute o script de instalação
install.bat
```

### Linux/Mac
```bash
# Torne o script executável e execute
chmod +x install.sh
./install.sh
```

### Instalação Manual
```bash
# 1. Instalar dependências do servidor
npm install

# 2. Instalar dependências do cliente
cd client
npm install
cd ..
```

## 🎯 Iniciar o Projeto

### Desenvolvimento (Recomendado)
```bash
npm run dev
```
- Servidor: http://localhost:3001
- Cliente: http://localhost:3001
- WebSocket: ws://localhost:8080

### Apenas Servidor
```bash
npm run server
```

### Apenas Cliente
```bash
npm run client
```

## 📱 Acessar a Aplicação

1. Abra o navegador
2. Acesse: **http://localhost:3001**
3. O site estará funcionando com:
   - ✅ Busca automática de surebets
   - ✅ Notificações sonoras
   - ✅ Filtros pré-live/live
   - ✅ Controles de pausar/ativar

## 🔧 Configuração do Som

1. Substitua o arquivo `client/public/notification.mp3` por um arquivo de áudio real
2. Ou use um som online (altere a URL no componente SurebetsView.vue)

## 🚨 Solução de Problemas

### Erro de Porta
- Verifique se as portas 3000, 8080 e 8081 estão livres
- Feche outros serviços que possam estar usando essas portas

### Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### WebSocket não conecta
- Verifique se o servidor está rodando
- Confirme se a porta 8080 está livre

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor no terminal
3. Consulte o README.md completo

---

**🎉 Pronto! Seu site de surebets está funcionando!**
