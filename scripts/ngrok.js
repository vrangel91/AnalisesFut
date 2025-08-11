#!/usr/bin/env node

const ngrokService = require('../src/services/ngrokService');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Gerenciador de Ngrok - IA de Apostas de Futebol');
console.log('==================================================\n');

function showMenu() {
  console.log('\n📋 Menu de Opções:');
  console.log('1. Iniciar túnel ngrok');
  console.log('2. Parar túnel ngrok');
  console.log('3. Reiniciar túnel ngrok');
  console.log('4. Status do túnel');
  console.log('5. Verificar saúde');
  console.log('6. Configuração atual');
  console.log('0. Sair');
  console.log('');
}

async function handleChoice(choice) {
  try {
    switch (choice) {
      case '1':
        console.log('\n🚀 Iniciando túnel ngrok...');
        const tunnelUrl = await ngrokService.startTunnel();
        console.log(`✅ Túnel iniciado: ${tunnelUrl}`);
        break;
        
      case '2':
        console.log('\n🛑 Parando túnel ngrok...');
        await ngrokService.stopTunnel();
        console.log('✅ Túnel parado');
        break;
        
      case '3':
        console.log('\n🔄 Reiniciando túnel ngrok...');
        const newTunnelUrl = await ngrokService.restartTunnel();
        console.log(`✅ Túnel reiniciado: ${newTunnelUrl}`);
        break;
        
      case '4':
        console.log('\n📊 Status do túnel:');
        const info = ngrokService.getTunnelInfo();
        const stats = await ngrokService.getTunnelStats();
        console.log('Informações:', JSON.stringify(info, null, 2));
        if (stats) {
          console.log('Estatísticas:', JSON.stringify(stats, null, 2));
        }
        break;
        
      case '5':
        console.log('\n🏥 Verificando saúde do túnel...');
        const health = await ngrokService.healthCheck();
        console.log(`Saúde: ${health ? '✅ Saudável' : '❌ Não saudável'}`);
        break;
        
      case '6':
        console.log('\n⚙️  Configuração atual:');
        const config = require('../ngrok.config');
        console.log(JSON.stringify(config, null, 2));
        break;
        
      case '0':
        console.log('\n👋 Saindo...');
        if (ngrokService.isRunning) {
          console.log('🛑 Parando túnel ngrok...');
          await ngrokService.stopTunnel();
        }
        rl.close();
        process.exit(0);
        break;
        
      default:
        console.log('\n❌ Opção inválida. Tente novamente.');
    }
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
  
  if (choice !== '0') {
    setTimeout(() => {
      showMenu();
      rl.question('Escolha uma opção: ', handleChoice);
    }, 1000);
  }
}

async function main() {
  try {
    // Verificar status inicial
    const info = ngrokService.getTunnelInfo();
    if (info.isRunning) {
      console.log(`✅ Túnel ngrok já está rodando: ${info.tunnelUrl}`);
    } else {
      console.log('⚠️  Túnel ngrok não está rodando');
    }
    
    showMenu();
    rl.question('Escolha uma opção: ', handleChoice);
    
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error.message);
    process.exit(1);
  }
}

// Tratamento de sinais para graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Recebido SIGINT, fechando...');
  if (ngrokService.isRunning) {
    await ngrokService.stopTunnel();
  }
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Recebido SIGTERM, fechando...');
  if (ngrokService.isRunning) {
    await ngrokService.stopTunnel();
  }
  rl.close();
  process.exit(0);
});

main();
