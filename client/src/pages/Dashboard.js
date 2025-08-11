import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaChartLine, FaDice, FaEye, FaInfoCircle, FaFire, FaFutbol, FaFlag, FaExclamationTriangle, FaBullseye } from 'react-icons/fa';
import axios from 'axios';
import '../styles/global.css';
import './Dashboard.css';

const Dashboard = () => {
  const [todayFixtures, setTodayFixtures] = useState([]);
  const [liveFixtures, setLiveFixtures] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [livePredictions, setLivePredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFixtures: 0,
    liveFixtures: 0,
    totalPredictions: 0,
    highConfidence: 0
  });
  const [cacheInfo, setCacheInfo] = useState({
    fixtures: { fromCache: false, lastUpdate: null },
    live: { fromCache: false, lastUpdate: null },
    predictions: { fromCache: false, lastUpdate: null },
    livePredictions: { fromCache: false, lastUpdate: null }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando dados do dashboard...');
      
      const [fixturesResponse, liveResponse, predictionsResponse, livePredictionsResponse] = await Promise.all([
        axios.get(`/api/fixtures/today${forceRefresh ? '?refresh=true' : ''}`),
        axios.get(`/api/fixtures/live${forceRefresh ? '?refresh=true' : ''}`),
        axios.get(`/api/predictions/today${forceRefresh ? '?refresh=true' : ''}`),
        axios.get(`/api/predictions/live${forceRefresh ? '?refresh=true' : ''}`)
      ]);

      console.log('📊 Dados recebidos:', {
        fixtures: fixturesResponse.data.data?.length || 0,
        live: liveResponse.data.data?.length || 0,
        predictions: predictionsResponse.data.data?.length || 0,
        livePredictions: livePredictionsResponse.data.data?.length || 0
      });

      setTodayFixtures(fixturesResponse.data.data || []);
      setLiveFixtures(liveResponse.data.data || []);
      setPredictions(predictionsResponse.data.data || []);
      setLivePredictions(livePredictionsResponse.data.data || []);

      // Atualizar informações de cache
      setCacheInfo({
        fixtures: {
          fromCache: fixturesResponse.data.fromCache || false,
          lastUpdate: fixturesResponse.data.lastUpdate
        },
        live: {
          fromCache: liveResponse.data.fromCache || false,
          lastUpdate: liveResponse.data.lastUpdate
        },
        predictions: {
          fromCache: predictionsResponse.data.fromCache || false,
          lastUpdate: predictionsResponse.data.lastUpdate
        },
        livePredictions: {
          fromCache: livePredictionsResponse.data.fromCache || false,
          lastUpdate: livePredictionsResponse.data.lastUpdate
        }
      });

      // Calcular estatísticas
      const highConfidence = predictionsResponse.data.data?.filter(p => p.confidence === 'alta').length || 0;
      setStats({
        totalFixtures: fixturesResponse.data.data?.length || 0,
        liveFixtures: liveResponse.data.data?.length || 0,
        totalPredictions: predictionsResponse.data.data?.length || 0,
        highConfidence
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'N/A';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'alta': return 'badge success';
      case 'média': return 'badge warning';
      case 'baixa': return 'badge danger';
      default: return 'badge info';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'alta': return '🎯';
      case 'média': return '⚖️';
      case 'baixa': return '⚠️';
      default: return '❓';
    }
  };

  const getOverUnderIcon = (type) => {
    switch (type) {
      case 'gols': return <FaFutbol className="text-blue" />;
      case 'escanteios': return <FaFlag className="text-green" />;
      case 'finalizações': return <FaBullseye className="text-gold" />;
      case 'cartões': return <FaExclamationTriangle className="text-danger" />;
      default: return <FaChartLine className="text-muted" />;
    }
  };

  const getOverUnderColor = (type) => {
    switch (type) {
      case 'gols': return 'bg-blue-50 text-blue-800';
      case 'escanteios': return 'bg-green-50 text-green-800';
      case 'finalizações': return 'bg-purple-50 text-purple-800';
      case 'cartões': return 'bg-red-50 text-red-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  const extractOverUnderAnalysis = (prediction) => {
    if (!prediction || !prediction.recommendation) {
      console.log('❌ Sem recomendação:', prediction);
      return [];
    }

    const analysis = [];
    const recommendation = prediction.recommendation.toLowerCase();
    
    console.log('🔍 Analisando recomendação:', recommendation);

    // Análise de gols
    if (recommendation.includes('over') && recommendation.includes('gol')) {
      // Extrair o número específico
      const match = recommendation.match(/over\s+(\d+\.?\d*)\s*gol/);
      const value = match ? match[1] : '2.5';
      analysis.push({
        type: 'gols',
        direction: 'Over',
        value: value,
        prediction: `Over ${value} gols`,
        confidence: prediction.confidence
      });
      console.log('✅ Adicionado Over gols:', value);
    } else if (recommendation.includes('under') && recommendation.includes('gol')) {
      // Extrair o número específico
      const match = recommendation.match(/under\s+(\d+\.?\d*)\s*gol/);
      const value = match ? match[1] : '2.5';
      analysis.push({
        type: 'gols',
        direction: 'Under',
        value: value,
        prediction: `Under ${value} gols`,
        confidence: prediction.confidence
      });
      console.log('✅ Adicionado Under gols:', value);
    }

    // Análise de escanteios
    if (recommendation.includes('escanteio')) {
      if (recommendation.includes('over')) {
        const match = recommendation.match(/over\s+(\d+\.?\d*)\s*escanteio/);
        const value = match ? match[1] : '5.5';
        analysis.push({
          type: 'escanteios',
          direction: 'Over',
          value: value,
          prediction: `Over ${value} escanteios`,
          confidence: prediction.confidence
        });
        console.log('✅ Adicionado Over escanteios:', value);
      } else if (recommendation.includes('under')) {
        const match = recommendation.match(/under\s+(\d+\.?\d*)\s*escanteio/);
        const value = match ? match[1] : '5.5';
        analysis.push({
          type: 'escanteios',
          direction: 'Under',
          value: value,
          prediction: `Under ${value} escanteios`,
          confidence: prediction.confidence
        });
        console.log('✅ Adicionado Under escanteios:', value);
      }
    }

    // Análise de finalizações
    if (recommendation.includes('finalização')) {
      if (recommendation.includes('over')) {
        const match = recommendation.match(/over\s+(\d+\.?\d*)\s*finalização/);
        const value = match ? match[1] : '9.5';
        analysis.push({
          type: 'finalizações',
          direction: 'Over',
          value: value,
          prediction: `Over ${value} finalizações`,
          confidence: prediction.confidence
        });
        console.log('✅ Adicionado Over finalizações:', value);
      } else if (recommendation.includes('under')) {
        const match = recommendation.match(/under\s+(\d+\.?\d*)\s*finalização/);
        const value = match ? match[1] : '9.5';
        analysis.push({
          type: 'finalizações',
          direction: 'Under',
          value: value,
          prediction: `Under ${value} finalizações`,
          confidence: prediction.confidence
        });
        console.log('✅ Adicionado Under finalizações:', value);
      }
    }

    // Análise de cartões
    if (recommendation.includes('cartão')) {
      if (recommendation.includes('over')) {
        const match = recommendation.match(/over\s+(\d+\.?\d*)\s*cartão/);
        const value = match ? match[1] : '3.5';
        analysis.push({
          type: 'cartões',
          direction: 'Over',
          value: value,
          prediction: `Over ${value} cartões`,
          confidence: prediction.confidence
        });
        console.log('✅ Adicionado Over cartões:', value);
      } else if (recommendation.includes('under')) {
        const match = recommendation.match(/under\s+(\d+\.?\d*)\s*cartão/);
        const value = match ? match[1] : '3.5';
        analysis.push({
          type: 'cartões',
          direction: 'Under',
          value: value,
          prediction: `Under ${value} cartões`,
          confidence: prediction.confidence
        });
        console.log('✅ Adicionado Under cartões:', value);
      }
    }

    // Se não encontrou nenhuma análise específica, criar uma análise genérica baseada na confiança
    if (analysis.length === 0 && prediction.confidence) {
      console.log('⚠️ Nenhuma análise específica encontrada, criando análise genérica');
      
      // Análise genérica baseada na confiança
      if (prediction.confidence === 'alta') {
        analysis.push({
          type: 'gols',
          direction: 'Over',
          value: '2.5',
          prediction: 'Over 2.5 gols (Alta confiança)',
          confidence: prediction.confidence
        });
      } else if (prediction.confidence === 'média') {
        analysis.push({
          type: 'gols',
          direction: 'Over',
          value: '1.5',
          prediction: 'Over 1.5 gols (Média confiança)',
          confidence: prediction.confidence
        });
      } else {
        analysis.push({
          type: 'gols',
          direction: 'Under',
          value: '2.5',
          prediction: 'Under 2.5 gols (Baixa confiança)',
          confidence: prediction.confidence
        });
      }
    }

    console.log('📊 Análises extraídas:', analysis.length);
    return analysis;
  };

  const renderOverUnderCard = (prediction, isLive = false) => {
    try {
      if (!prediction || !prediction.fixture) {
        return null;
      }

      const { fixture, confidence, recommendation } = prediction;
      const { teams, league, fixture: fixtureData } = fixture;

      if (!teams || !league || !fixtureData) {
        return null;
      }

      const overUnderAnalysis = extractOverUnderAnalysis(prediction);

      // Sempre mostrar o card, mesmo com análise genérica
      if (overUnderAnalysis.length === 0) {
        console.log('⚠️ Nenhuma análise encontrada para:', prediction.fixture?.teams?.home?.name, 'vs', prediction.fixture?.teams?.away?.name);
      }

      return (
        <div key={fixture.fixture.id} className="card border-left-blue">
          <div className="card-header">
            <div className="card-content">
              <div className="fixture-info">
                <span className="league-name">{league.name}</span>
                {isLive && (
                  <span className="live-badge">
                    AO VIVO
                  </span>
                )}
              </div>
              <h4 className="fixture-title">
                {teams.home.name} vs {teams.away.name}
              </h4>
              <p className="fixture-time">
                {formatTime(fixtureData.date)}
              </p>
            </div>
            
            <div className={`confidence-badge ${getConfidenceColor(confidence)}`}>
              <span>{getConfidenceIcon(confidence)}</span>
              {confidence.toUpperCase()}
            </div>
          </div>

          <div className="analysis-content">
            {overUnderAnalysis.map((analysis, index) => (
              <div key={index} className={`analysis-item ${getOverUnderColor(analysis.type)}`}>
                <div className="analysis-header">
                  {getOverUnderIcon(analysis.type)}
                  <span className="analysis-type">{analysis.type}</span>
                </div>
                <p className="analysis-prediction">{analysis.prediction}</p>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar over/under card:', error);
      return null;
    }
  };

  const renderFixtureCard = (fixture, isLive = false) => {
    try {
      if (!fixture || !fixture.teams || !fixture.league || !fixture.fixture) {
        return null;
      }

      const { teams, league, fixture: fixtureData } = fixture;

      return (
        <div key={fixture.fixture.id} className="card">
          <div className="card-header">
            <div className="card-content">
              <div className="fixture-info">
                <span className="league-name">{league.name}</span>
                {isLive && (
                  <span className="live-badge">
                    AO VIVO
                  </span>
                )}
              </div>
              <h4 className="fixture-title">
                {teams.home.name} vs {teams.away.name}
              </h4>
              <p className="fixture-time">
                {formatTime(fixtureData.date)}
              </p>
            </div>
            
            <div className="fixture-status">
              <div className="status-text">
                {fixtureData.status.short}
              </div>
              {fixtureData.status.elapsed && (
                <div className="elapsed-time">
                  {fixtureData.status.elapsed}'
                </div>
              )}
            </div>
          </div>

          {fixture.goals && (
            <div className="goals-display">
              <div className="goals-score">
                {fixture.goals.home} - {fixture.goals.away}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Erro ao renderizar fixture card:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="error-container">
            <div className="card">
              <div className="error-content">
                <FaExclamationTriangle className="error-icon" />
                <h2 className="error-title">Erro ao carregar dados</h2>
                <p className="error-message">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="btn-primary"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-title">
              <h1>
                <FaBullseye className="header-icon" />
                Dashboard Over/Under
              </h1>
              <p>
                Análises especializadas em gols, escanteios, finalizações e cartões
              </p>
            </div>
            <div className="header-actions">
              {/* Indicadores de Cache */}
              <div className="cache-indicators">
                {cacheInfo.fixtures.fromCache && (
                  <span className="badge info">
                    📦 Cache
                  </span>
                )}
                {cacheInfo.predictions.fromCache && (
                  <span className="badge success">
                    📦 Cache
                  </span>
                )}
              </div>
              {/* Botão de Refresh */}
              <button
                onClick={() => loadDashboardData(true)}
                disabled={loading}
                className="btn-secondary"
              >
                <FaEye className="btn-icon" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
          
          {/* Informações de Cache */}
          <div className="card">
            <div className="cache-grid">
              <div className="cache-item">
                <span className="cache-label">Fixtures:</span>
                <span className={cacheInfo.fixtures.fromCache ? 'badge info' : 'text-primary'}>
                  {cacheInfo.fixtures.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.fixtures.lastUpdate && (
                  <span className="cache-time">
                    ({new Date(cacheInfo.fixtures.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="cache-item">
                <span className="cache-label">Live:</span>
                <span className={cacheInfo.live.fromCache ? 'badge info' : 'text-primary'}>
                  {cacheInfo.live.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.live.lastUpdate && (
                  <span className="cache-time">
                    ({new Date(cacheInfo.live.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="cache-item">
                <span className="cache-label">Predictions:</span>
                <span className={cacheInfo.predictions.fromCache ? 'badge success' : 'text-primary'}>
                  {cacheInfo.predictions.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.predictions.lastUpdate && (
                  <span className="cache-time">
                    ({new Date(cacheInfo.predictions.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="cache-item">
                <span className="cache-label">Live Pred:</span>
                <span className={cacheInfo.livePredictions.fromCache ? 'badge success' : 'text-primary'}>
                  {cacheInfo.livePredictions.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.livePredictions.lastUpdate && (
                  <span className="cache-time">
                    ({new Date(cacheInfo.livePredictions.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon blue">
                <FaCalendar />
              </div>
              <div className="stat-info">
                <p className="stat-label">Jogos Hoje</p>
                <p className="stat-value">{stats.totalFixtures}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon danger">
                <FaFire />
              </div>
              <div className="stat-info">
                <p className="stat-label">Ao Vivo</p>
                <p className="stat-value">{stats.liveFixtures}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon green">
                <FaDice />
              </div>
              <div className="stat-info">
                <p className="stat-label">Análises Over/Under</p>
                <p className="stat-value">{stats.totalPredictions}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-icon gold">
                <FaEye />
              </div>
              <div className="stat-info">
                <p className="stat-label">Alta Confiança</p>
                <p className="stat-value">{stats.highConfidence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Live Fixtures */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <FaFire className="section-icon live" />
                Jogos ao Vivo
              </h2>
              <span className="section-count">{liveFixtures.length} jogos</span>
            </div>
            
            {liveFixtures.length === 0 ? (
              <div className="card empty-state">
                <FaClock className="empty-icon" />
                <p className="empty-text">Nenhum jogo ao vivo no momento</p>
              </div>
            ) : (
              <div className="cards-container">
                {liveFixtures.slice(0, 5).map(fixture => 
                  renderFixtureCard(fixture, true)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Live Over/Under Analysis */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <FaChartLine className="section-icon analysis" />
                Análises Over/Under ao Vivo
              </h2>
              <span className="section-count">{livePredictions.length} análises</span>
            </div>
            
            {livePredictions.length === 0 ? (
              <div className="card empty-state">
                <FaChartLine className="empty-icon" />
                <p className="empty-text">Nenhuma análise over/under ao vivo disponível</p>
              </div>
            ) : (
              <div className="cards-container">
                {livePredictions.slice(0, 5).map(prediction => 
                  renderOverUnderCard(prediction, true)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Today's Fixtures */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <FaCalendar className="section-icon fixtures" />
                Jogos de Hoje
              </h2>
              <span className="section-count">{todayFixtures.length} jogos</span>
            </div>
            
            {todayFixtures.length === 0 ? (
              <div className="card empty-state">
                <FaCalendar className="empty-icon" />
                <p className="empty-text">Nenhum jogo programado para hoje</p>
              </div>
            ) : (
              <div className="cards-container">
                {todayFixtures.slice(0, 5).map(fixture => 
                  renderFixtureCard(fixture)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Today's Over/Under Analysis */}
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">
                <FaDice className="section-icon predictions" />
                Análises Over/Under de Hoje
              </h2>
              <span className="section-count">{predictions.length} análises</span>
            </div>
            
            {predictions.length === 0 ? (
              <div className="card empty-state">
                <FaDice className="empty-icon" />
                <p className="empty-text">Nenhuma análise over/under disponível para hoje</p>
              </div>
            ) : (
              <div className="cards-container">
                {predictions.slice(0, 5).map(prediction => 
                  renderOverUnderCard(prediction)
                ).filter(Boolean)}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="refresh-section">
          <button
            onClick={loadDashboardData}
            className="btn-primary"
          >
            Atualizar Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
