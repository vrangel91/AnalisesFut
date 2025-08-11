const ngrok = require('ngrok');
const config = require('../../ngrok.config');

class NgrokService {
  constructor() {
    this.tunnel = null;
    this.tunnelUrl = null;
    this.isRunning = false;
  }

  /**
   * Inicia o túnel ngrok
   */
  async startTunnel() {
    try {
      if (this.isRunning) {
        console.log('🔄 Túnel ngrok já está rodando');
        return this.tunnelUrl;
      }

      console.log('🚀 Iniciando túnel ngrok...');
      
      const ngrokConfig = {
        addr: config.server.port,
        region: config.ngrok.region,
        bindTls: config.ngrok.bindTls,
        log: config.ngrok.log,
        inspect: config.ngrok.inspect,
      };

      // Adicionar autenticação se configurada
      if (process.env.NGROK_AUTH_TOKEN) {
        ngrokConfig.authtoken = process.env.NGROK_AUTH_TOKEN;
      }

      // Adicionar subdomínio se configurado
      if (config.ngrok.subdomain) {
        ngrokConfig.subdomain = config.ngrok.subdomain;
      }

      this.tunnel = await ngrok.connect(ngrokConfig);
      this.tunnelUrl = this.tunnel;
      this.isRunning = true;

      console.log('✅ Túnel ngrok iniciado com sucesso!');
      console.log(`🌐 URL pública: ${this.tunnelUrl}`);
      console.log(`📱 Acesse de qualquer dispositivo: ${this.tunnelUrl}`);
      
      // Configurar eventos do túnel (compatível com ngrok v5)
      try {
        if (ngrok.getNgrokProcess) {
          ngrok.getNgrokProcess().on('exit', () => {
            console.log('⚠️  Processo ngrok foi encerrado');
            this.isRunning = false;
            this.tunnel = null;
            this.tunnelUrl = null;
          });
        }
      } catch (error) {
        console.log('ℹ️  Eventos do processo ngrok não disponíveis nesta versão');
      }

      return this.tunnelUrl;
    } catch (error) {
      console.error('❌ Erro ao iniciar túnel ngrok:', error.message);
      throw error;
    }
  }

  /**
   * Para o túnel ngrok
   */
  async stopTunnel() {
    try {
      if (!this.isRunning) {
        console.log('⚠️  Túnel ngrok não está rodando');
        return;
      }

      console.log('🛑 Parando túnel ngrok...');
      await ngrok.kill();
      
      this.tunnel = null;
      this.tunnelUrl = null;
      this.isRunning = false;
      
      console.log('✅ Túnel ngrok parado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao parar túnel ngrok:', error.message);
      throw error;
    }
  }

  /**
   * Obtém informações do túnel atual
   */
  getTunnelInfo() {
    return {
      isRunning: this.isRunning,
      tunnelUrl: this.tunnelUrl,
      localPort: config.server.port,
      region: config.ngrok.region,
    };
  }

  /**
   * Obtém estatísticas do túnel (se disponível)
   */
  async getTunnelStats() {
    try {
      if (!this.isRunning) {
        return null;
      }

      // Compatível com ngrok v5
      try {
        if (ngrok.getApi) {
          const api = ngrok.getApi();
          const tunnels = await api.listTunnels();
          
          if (tunnels.tunnels && tunnels.tunnels.length > 0) {
            const tunnel = tunnels.tunnels.find(t => t.public_url === this.tunnelUrl);
            return tunnel || null;
          }
        }
      } catch (apiError) {
        console.log('ℹ️  API de estatísticas não disponível nesta versão do ngrok');
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do túnel:', error.message);
      return null;
    }
  }

  /**
   * Reinicia o túnel ngrok
   */
  async restartTunnel() {
    try {
      console.log('🔄 Reiniciando túnel ngrok...');
      await this.stopTunnel();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1 segundo
      return await this.startTunnel();
    } catch (error) {
      console.error('❌ Erro ao reiniciar túnel ngrok:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se o túnel está funcionando
   */
  async healthCheck() {
    try {
      if (!this.isRunning || !this.tunnelUrl) {
        return false;
      }

      // Tenta fazer uma requisição para o túnel
      const response = await fetch(`${this.tunnelUrl}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new NgrokService();
