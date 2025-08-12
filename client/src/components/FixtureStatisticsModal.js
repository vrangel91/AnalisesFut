import React, { useState, useEffect } from 'react';
import { FaSync } from 'react-icons/fa';
import './FixtureStatisticsModal.scss';

const FixtureStatisticsModal = ({ fixture, isOpen, onClose }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && fixture?.fixture?.id) {
      fetchStatistics();
    }
  }, [isOpen, fixture]);

  const fetchStatistics = async (forceRefresh = false) => {
    if (!fixture?.fixture?.id) return;

    setLoading(true);
    setError(null);
    
    // Se for forçar atualização, limpar dados existentes
    if (forceRefresh) {
      setStatistics(null);
    }

    try {
      // Adicionar parâmetro para forçar atualização se necessário
      const url = forceRefresh 
        ? `/api/fixture-statistics/${fixture.fixture.id}?refresh=true`
        : `/api/fixture-statistics/${fixture.fixture.id}`;
        
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
      } else {
        setError(data.error || 'Erro ao buscar estatísticas');
      }
    } catch (err) {
      setError('Erro de conexão ao buscar estatísticas');
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Atualizando estatísticas...');
    fetchStatistics(true); // Forçar atualização
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string' && value.includes('%')) return value;
    return value.toString();
  };

  const getStatColor = (homeValue, awayValue) => {
    if (homeValue > awayValue) return 'home-win';
    if (awayValue > homeValue) return 'away-win';
    return 'draw';
  };

  const StatRow = ({ label, homeValue, awayValue, unit = '', showComparison = true }) => {
    const colorClass = showComparison ? getStatColor(homeValue, awayValue) : '';
    
    return (
      <div className={`stat-row ${colorClass}`}>
        <div className="stat-label">{label}</div>
        <div className="stat-values">
          <div className="stat-value home">{formatValue(homeValue)}{unit}</div>
          <div className="stat-divider">vs</div>
          <div className="stat-value away">{formatValue(awayValue)}{unit}</div>
        </div>
        {showComparison && (
          <div className="stat-total">
            Total: {formatValue((homeValue || 0) + (awayValue || 0))}{unit}
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, children, className = '' }) => (
    <div className={`stat-card ${className}`}>
      <h3 className="stat-card-title">{title}</h3>
      <div className="stat-card-content">
        {children}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixture-statistics-modal-overlay" onClick={onClose}>
      <div className="fixture-statistics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Estatísticas Completas da Partida</h2>
          <div className="header-actions">
            <button 
              onClick={handleRefresh} 
              className="refresh-button"
              disabled={loading}
              title="Atualizar estatísticas"
            >
              <FaSync className={loading ? 'spinning' : ''} />
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-content">
          {fixture && (
            <div className="fixture-info">
              <div className="teams">
                <div className="team home">
                  <img 
                    src={fixture.teams?.home?.logo || '/default-team-logo.png'} 
                    alt={fixture.teams?.home?.name}
                    onError={(e) => e.target.src = '/default-team-logo.png'}
                  />
                  <span>{fixture.teams?.home?.name}</span>
                </div>
                <div className="vs">vs</div>
                <div className="team away">
                  <img 
                    src={fixture.teams?.away?.logo || '/default-team-logo.png'} 
                    alt={fixture.teams?.away?.name}
                    onError={(e) => e.target.src = '/default-team-logo.png'}
                  />
                  <span>{fixture.teams?.away?.name}</span>
                </div>
              </div>
              {fixture.fixture?.date && (
                <div className="fixture-date">
                  {new Date(fixture.fixture.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando estatísticas...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button onClick={() => fetchStatistics(true)} className="retry-button">
                Tentar Novamente
              </button>
            </div>
          )}

          {statistics && !loading && !error && (
            <div className="statistics-container">
              {/* Estatísticas Principais */}
              <StatCard title="Estatísticas Principais" className="main-stats">
                <StatRow 
                  label="Total de Chutes" 
                  homeValue={statistics.totalShots?.home} 
                  awayValue={statistics.totalShots?.away}
                />
                <StatRow 
                  label="Total de Faltas" 
                  homeValue={statistics.totalFouls?.home} 
                  awayValue={statistics.totalFouls?.away}
                />
                <StatRow 
                  label="Total de Passes" 
                  homeValue={statistics.totalPasses?.home} 
                  awayValue={statistics.totalPasses?.away}
                />
                <StatRow 
                  label="Escanteios" 
                  homeValue={statistics.corners?.home} 
                  awayValue={statistics.corners?.away}
                />
              </StatCard>

              {/* Chutes Detalhados */}
              <StatCard title="Detalhes dos Chutes" className="shots-stats">
                <StatRow 
                  label="Chutes no Gol" 
                  homeValue={statistics.shotsOnGoal?.home} 
                  awayValue={statistics.shotsOnGoal?.away}
                />
                <StatRow 
                  label="Chutes Fora do Gol" 
                  homeValue={statistics.shotsOffGoal?.home} 
                  awayValue={statistics.shotsOffGoal?.away}
                />
                <StatRow 
                  label="Chutes Dentro da Área" 
                  homeValue={statistics.shotsInsideBox?.home} 
                  awayValue={statistics.shotsInsideBox?.away}
                />
                <StatRow 
                  label="Chutes Fora da Área" 
                  homeValue={statistics.shotsOutsideBox?.home} 
                  awayValue={statistics.shotsOutsideBox?.away}
                />
                <StatRow 
                  label="Chutes Bloqueados" 
                  homeValue={statistics.blockedShots?.home} 
                  awayValue={statistics.blockedShots?.away}
                />
              </StatCard>

              {/* Posse de Bola e Passes */}
              <StatCard title="Posse e Passes" className="possession-stats">
                <StatRow 
                  label="Posse de Bola" 
                  homeValue={statistics.ballPossession?.home} 
                  awayValue={statistics.ballPossession?.away}
                  showComparison={false}
                />
                <StatRow 
                  label="Passes Precisos" 
                  homeValue={statistics.passesAccurate?.home} 
                  awayValue={statistics.passesAccurate?.away}
                />
                <StatRow 
                  label="Precisão dos Passes" 
                  homeValue={statistics.passesPercentage?.home} 
                  awayValue={statistics.passesPercentage?.away}
                  showComparison={false}
                />
              </StatCard>

              {/* Cartões e Outros */}
              <StatCard title="Cartões e Outros" className="cards-stats">
                <StatRow 
                  label="Cartões Amarelos" 
                  homeValue={statistics.yellowCards?.home} 
                  awayValue={statistics.yellowCards?.away}
                />
                <StatRow 
                  label="Cartões Vermelhos" 
                  homeValue={statistics.redCards?.home} 
                  awayValue={statistics.redCards?.away}
                />
                <StatRow 
                  label="Impedimentos" 
                  homeValue={statistics.offsides?.home} 
                  awayValue={statistics.offsides?.away}
                />
                <StatRow 
                  label="Defesas do Goleiro" 
                  homeValue={statistics.goalkeeperSaves?.home} 
                  awayValue={statistics.goalkeeperSaves?.away}
                />
              </StatCard>

              {/* Informações do Cache */}
              {statistics.source && (
                <div className="cache-info">
                  <span className="cache-badge">
                    {statistics.source === 'cache' ? '📦 Cache' : '🌐 API'}
                  </span>
                  <span className="cache-timestamp">
                    Última atualização: {new Date(statistics.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixtureStatisticsModal;
