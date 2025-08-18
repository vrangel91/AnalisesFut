<template>
  <div class="surebets-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo e Header -->
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">👑</span>
          <h1 v-show="!sidebarCollapsed">ZEROLOSS</h1>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span v-if="sidebarCollapsed">▶️</span>
          <span v-else>◀️</span>
        </button>
      </div>

      <!-- Perfil do Usuário -->
      <div class="user-profile">
        <div class="user-info">
          <div class="user-avatar">👤</div>
          <div class="user-details" v-show="!sidebarCollapsed">
            <p class="user-greeting">Olá, viniciius@live.com</p>
            <div class="user-status">
              <span class="status-dot"></span>
              <span class="status-text">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu de Navegação -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item active">
            <a href="#" class="nav-link" :title="sidebarCollapsed ? 'Dashboard' : ''">
              <span class="nav-icon">🏠</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :title="sidebarCollapsed ? 'Relatórios' : ''">
              <span class="nav-icon">📊</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Relatórios</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" :title="sidebarCollapsed ? 'Configurações' : ''">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text" v-show="!sidebarCollapsed">Configurações</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Conteúdo Principal -->
    <main class="main-content">
      <!-- Header do Conteúdo -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Surebets</h2>
          <p class="page-subtitle">Encontre as melhores oportunidades de arbitragem</p>
        </div>
        
        <div class="header-right">
          <!-- Controles de Busca -->
          <div class="search-controls">
            <button 
              class="control-btn" 
              :class="{ active: isSearching }"
              @click="toggleSearch"
            >
              <span class="control-icon">{{ isSearching ? '⏸️' : '▶️' }}</span>
              <span class="control-text">{{ isSearching ? 'Pausar' : 'Retomar' }}</span>
            </button>
            
            <button 
              class="control-btn" 
              :class="{ active: soundEnabled }"
              @click="toggleSound"
            >
              <span class="control-icon">{{ soundEnabled ? '🔊' : '🔇' }}</span>
              <span class="control-text">{{ soundEnabled ? 'Som On' : 'Som Off' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Filtros -->
      <div class="filters">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'all' }"
            @click="setFilter('all')"
          >
            Todas ({{ totalSurebets }})
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'prelive' }"
            @click="setFilter('prelive')"
          >
            Pré-live ({{ preliveCount }})
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'live' }"
            @click="setFilter('live')"
          >
            Live ({{ liveCount }})
          </button>
        </div>
      </div>

      <!-- Lista de Surebets -->
      <div class="surebets-list">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Carregando surebets...</p>
        </div>
        
        <div v-else-if="filteredSurebets.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Nenhum surebet encontrado</h3>
          <p>Tente ajustar os filtros ou aguarde novas oportunidades</p>
        </div>
        
        <div v-else class="surebets-grid">
          <SurebetCard 
            v-for="(surebet, index) in filteredSurebets" 
            :key="index"
            :surebet="surebet"
          />
        </div>
      </div>
    </main>

    <!-- Áudio para Notificações -->
    <audio ref="notificationSound" preload="auto">
      <source src="/notification.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script>
import SurebetCard from '../components/SurebetCard.vue'

export default {
  name: 'SurebetsView',
  components: {
    SurebetCard
  },
  data() {
    return {
      surebets: {},
      isSearching: true,
      soundEnabled: true,
      activeFilter: 'all',
      loading: true,
      ws: null,
      sidebarCollapsed: false
    }
  },
  computed: {
    totalSurebets() {
      return Object.keys(this.surebets).length
    },
    preliveCount() {
      return Object.values(this.surebets).filter(surebet => 
        surebet[0]?.minutes === 0
      ).length
    },
    liveCount() {
      return Object.values(this.surebets).filter(surebet => 
        surebet[0]?.minutes > 0
      ).length
    },
    filteredSurebets() {
      const surebetsArray = Object.values(this.surebets)
      
      switch (this.activeFilter) {
        case 'prelive':
          return surebetsArray.filter(surebet => surebet[0]?.minutes === 0)
        case 'live':
          return surebetsArray.filter(surebet => surebet[0]?.minutes > 0)
        default:
          return surebetsArray
      }
    }
  },
  mounted() {
    this.initWebSocket()
    this.fetchSurebets()
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close()
    }
  },
  methods: {
    initWebSocket() {
      this.ws = new WebSocket('ws://localhost:8080')
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado')
      }
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'initial_state':
            this.surebets = data.surebets
            this.isSearching = data.isSearching
            this.soundEnabled = data.soundEnabled
            this.loading = false
            break
            
          case 'new_surebet':
            this.surebets = data.surebets
            if (this.soundEnabled) {
              this.playNotificationSound()
            }
            break
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error)
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket desconectado')
      }
    },
    
    async fetchSurebets() {
      try {
        const response = await fetch('/api/surebets')
        const data = await response.json()
        this.surebets = data
        this.loading = false
      } catch (error) {
        console.error('Erro ao buscar surebets:', error)
        this.loading = false
      }
    },
    
    toggleSearch() {
      this.isSearching = !this.isSearching
      this.sendWebSocketMessage('toggle_search', { isSearching: this.isSearching })
    },
    
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.sendWebSocketMessage('toggle_sound', { soundEnabled: this.soundEnabled })
    },
    
    setFilter(filter) {
      this.activeFilter = filter
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    
    sendWebSocketMessage(type, data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, ...data }))
      }
    },
    
    playNotificationSound() {
      if (this.$refs.notificationSound) {
        this.$refs.notificationSound.play().catch(error => {
          console.log('Erro ao tocar som:', error)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.surebets-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #1a1a1a;
  color: #ffffff;
}

.sidebar {
  width: 280px;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #404040;
  flex-shrink: 0;
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 80px;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #404040;
  
  .sidebar.collapsed & {
    justify-content: center;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .logo-icon {
    font-size: 24px;
  }
  
  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #404040;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    background: #00ff88;
    color: #1a1a1a;
  }
}

.user-profile {
  padding: 20px;
  border-bottom: 1px solid #404040;
  
  .sidebar.collapsed & {
    padding: 20px 10px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #00ff88;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.user-details {
  flex: 1;
}

.user-greeting {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 4px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
}

.status-text {
  font-size: 12px;
  color: #b0b0b0;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #b0b0b0;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
  
  .sidebar.collapsed & {
    justify-content: center;
    padding: 12px 10px;
  }
}

.nav-item.active .nav-link {
  background: #00ff88;
  color: #1a1a1a;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #404040;
}

.header-left {
  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 4px;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: #b0b0b0;
  }
}

.search-controls {
  display: flex;
  gap: 12px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #404040;
  }
  
  &.active {
    background: #00ff88;
    color: #1a1a1a;
    border-color: #00ff88;
  }
}

.control-icon {
  font-size: 16px;
}

.control-text {
  font-size: 14px;
  font-weight: 500;
}

.filters {
  padding: 20px 32px;
  border-bottom: 1px solid #404040;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 6px;
  color: #b0b0b0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #404040;
    color: #ffffff;
  }
  
  &.active {
    background: #00ff88;
    color: #1a1a1a;
    border-color: #00ff88;
  }
}

.surebets-list {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #b0b0b0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #404040;
  border-top: 3px solid #00ff88;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #b0b0b0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 8px;
}

.surebets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    
    &.open {
      left: 0;
    }
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .surebets-grid {
    grid-template-columns: 1fr;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .search-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

