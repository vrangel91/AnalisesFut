import React, { useEffect, useRef, useState } from 'react';
import { FaTimes, FaExternalLinkAlt, FaEye, FaChartLine, FaUsers, FaFutbol, FaRedo, FaBarChart } from 'react-icons/fa';
import './FixtureWidgetModal.scss';
import FixtureStatisticsModal from './FixtureStatisticsModal';

const FixtureWidgetModal = ({ isOpen, onClose, fixture }) => {
  const modalRef = useRef(null);
  const widgetRef = useRef(null);
  const [activeTab, setActiveTab] = useState('statistics');
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const [widgetScript, setWidgetScript] = useState(null);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);

  useEffect(() => {
    if (isOpen && fixture && widgetRef.current) {
      // Limpar widget anterior se existir
      if (widgetRef.current.children.length > 0) {
        widgetRef.current.innerHTML = '';
      }

      setWidgetLoaded(false);
      setWidgetError(false);

      const fixtureId = fixture.id || fixture.fixture?.id;
      const apiKey = '723269d925a86ea56e8311e812380c97';
      
      console.log('🎯 Carregando widget para fixture ID:', fixtureId);
      
      // Criar container do widget
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'wg-api-football-fixture';
      widgetContainer.setAttribute('data-host', 'v3.football.api-sports.io');
      widgetContainer.setAttribute('data-refresh', '15');
      widgetContainer.setAttribute('data-id', fixtureId);
      widgetContainer.setAttribute('data-key', apiKey);
      widgetContainer.setAttribute('data-theme', 'false');
      widgetContainer.setAttribute('data-show-errors', 'false');
      widgetContainer.setAttribute('data-show-logos', 'true');
      widgetContainer.className = 'api_football_loader';
      
      // Adicionar ao DOM
      widgetRef.current.appendChild(widgetContainer);
      
      // Carregar script do widget se não estiver carregado
      if (!widgetScript) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://widgets.api-sports.io/football/2.0.3/widget.js';
        script.onload = () => {
          console.log('✅ Script do widget carregado');
          setWidgetScript(script);
          setWidgetLoaded(true);
        };
        script.onerror = (error) => {
          console.error('❌ Erro ao carregar script do widget:', error);
          setWidgetError(true);
          showErrorMessage('Erro ao carregar script do widget');
        };
        
        document.head.appendChild(script);
      } else {
        setWidgetLoaded(true);
      }
      
      // Timeout de segurança
      setTimeout(() => {
        if (!widgetLoaded && !widgetError) {
          console.log('⏰ Timeout: Widget não carregou em 15 segundos');
          setWidgetError(true);
          showErrorMessage('Timeout ao carregar widget');
        }
      }, 15000);
    }
  }, [isOpen, fixture, widgetScript]);

  const showErrorMessage = (message) => {
    if (widgetRef.current) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'widget-error';
      errorDiv.innerHTML = `
        <div class="error-icon">⚠️</div>
        <h3>Erro ao carregar widget</h3>
        <p>${message}</p>
      `;
      
      const retryBtn = document.createElement('button');
      retryBtn.className = 'retry-btn';
      retryBtn.textContent = '🔄 Tentar novamente';
      retryBtn.onclick = () => {
        setWidgetLoaded(false);
        setWidgetError(false);
        if (widgetRef.current) {
          widgetRef.current.innerHTML = '';
        }
        // Recarregar o modal
        setTimeout(() => {
          if (isOpen && fixture) {
            // Forçar recarregamento
            const event = new Event('resize');
            window.dispatchEvent(event);
          }
        }, 100);
      };
      
      errorDiv.appendChild(retryBtn);
      widgetRef.current.innerHTML = '';
      widgetRef.current.appendChild(errorDiv);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !fixture) return null;

  const fixtureId = fixture.id || fixture.fixture?.id;
  const teams = fixture.teams;
  const league = fixture.league;
  const fixtureData = fixture.fixture || fixture;
  const apiKey = '723269d925a86ea56e8311e812380c97';

  const handleRefreshWidget = () => {
    if (widgetRef.current) {
      console.log('🔄 Recarregando widget...');
      setWidgetLoaded(false);
      setWidgetError(false);
      
      // Mostrar loading novamente
      const loadingElement = widgetRef.current.querySelector('.widget-loading');
      if (loadingElement) {
        loadingElement.style.display = 'block';
      }
      
      // Recarregar widget
      widgetRef.current.innerHTML = '';
      setTimeout(() => {
        if (isOpen && fixture) {
          // Forçar recarregamento
          const event = new Event('resize');
          window.dispatchEvent(event);
        }
      }, 100);
    }
  };

  const handleOpenInNewTab = () => {
    const widgetUrl = `https://widgets.api-sports.io/football/2.0.3/fixture.html?id=${fixtureId}&key=${apiKey}&theme=false&refresh=15&show-errors=false&show-logos=true`;
    window.open(widgetUrl, '_blank');
  };

  return (
    <div className="fixture-widget-modal-overlay">
      <div className="fixture-widget-modal" ref={modalRef}>
        {/* Header do Modal */}
        <div className="modal-header">
          <div className="header-content">
            <div className="fixture-info">
              <div className="league-info">
                <span className="country-flag">🏆</span>
                <span className="league-name">{league?.name}</span>
                <span className="season">2024/25</span>
              </div>
              <div className="teams-info">
                <span className="team home">{teams?.home?.name}</span>
                <span className="vs">vs</span>
                <span className="team away">{teams?.away?.name}</span>
              </div>
              <div className="match-details">
                <span className="date">
                  {new Date(fixtureData.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="time">
                  {new Date(fixtureData.date).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {fixtureData.venue?.name && (
                  <span className="venue">📍 {fixtureData.venue.name}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => setShowStatisticsModal(true)}
              className="statistics-btn"
              title="Estatísticas Completas"
            >
              <FaBarChart />
            </button>
            
            <button
              onClick={handleOpenInNewTab}
              className="external-link-btn"
              title="Abrir em nova aba"
            >
              <FaExternalLinkAlt />
            </button>
            
            <button
              onClick={onClose}
              className="close-btn"
              title="Fechar modal"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <FaChartLine />
            <span>Estatísticas</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <FaFutbol />
            <span>Eventos</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'lineups' ? 'active' : ''}`}
            onClick={() => setActiveTab('lineups')}
          >
            <FaUsers />
            <span>Escalações</span>
          </button>
        </div>

        {/* Conteúdo do Widget */}
        <div className="modal-content">
          <div className="widget-container" ref={widgetRef}>
            {/* Loading State */}
            <div className="widget-loading">
              <div className="loading-spinner"></div>
              <p>Carregando detalhes do jogo...</p>
              <div className="loading-details">
                <span>Fixture ID: {fixtureId}</span>
                <span>API Key: {apiKey ? '✅ Configurada' : '❌ Não configurada'}</span>
                <span>Método: Widget direto (sem iframe)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="modal-footer">
          <div className="footer-info">
            <span className="data-source">
              📊 Dados fornecidos por API-FOOTBALL
            </span>
            <span className="fixture-id">
              ID: {fixtureId}
            </span>
            {widgetLoaded && (
              <span className="widget-status success">
                ✅ Widget carregado
              </span>
            )}
            {widgetError && (
              <span className="widget-status error">
                ❌ Erro no widget
              </span>
            )}
          </div>
          
          <div className="footer-actions">
            <button
              onClick={handleRefreshWidget}
              className="refresh-widget-btn"
              disabled={!widgetLoaded}
            >
              <FaRedo />
              <span>Recarregar</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de Estatísticas Completas */}
      <FixtureStatisticsModal
        fixture={fixture}
        isOpen={showStatisticsModal}
        onClose={() => setShowStatisticsModal(false)}
      />
    </div>
  );
};

export default FixtureWidgetModal;
