import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaChartLine, FaDice, FaEye, FaFire, FaFutbol, FaFlag, FaExclamationTriangle, FaBullseye } from 'react-icons/fa';
import axios from 'axios';
import './Dashboard.scss';

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

  const getOverUnderIcon = (type) => {
    switch (type) {
      case 'gols': return <FaFutbol className="icon" />;
      case 'escanteios': return <FaFlag className="icon" />;
      case 'finalizações': return <FaBullseye className="icon" />;
      case 'cartões': return <FaExclamationTriangle className="icon" />;
      default: return <FaChartLine className="icon" />;
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

      if (overUnderAnalysis.length === 0) {
        console.log('⚠️ Nenhuma análise encontrada para:', prediction.fixture?.teams?.home?.name, 'vs', prediction.fixture?.teams?.away?.name);
      }

      return (
        <div key={fixture.fixture.id} className="fixture-card">
          <div className="card-header">
            <div className="fixture-info">
              <div className="league">
                {league.name}
                {isLive && (
                  <span className="live-badge">
                    AO VIVO
                  </span>
                )}
              </div>
              <div className="teams">
                {teams.home.name} vs {teams.away.name}
              </div>
              <div className="time">
                {formatTime(fixtureData.date)}
              </div>
            </div>
            
            <div className="status-info">
              <div className={`confidence-badge ${confidence}`}>
                <span>{confidence === 'alta' ? '🎯' : confidence === 'média' ? '⚖️' : '⚠️'}</span>
                {confidence.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="analysis-grid">
            {overUnderAnalysis.map((analysis, index) => (
              <div key={index} className={`analysis-item ${analysis.type}`}>
                <div className="analysis-header">
                  {getOverUnderIcon(analysis.type)}
                  <span className="type">{analysis.type}</span>
                </div>
                <div className="prediction">{analysis.prediction}</div>
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
        <div key={fixture.fixture.id} className="fixture-card">
          <div className="card-header">
            <div className="fixture-info">
              <div className="league">
                {league.name}
                {isLive && (
                  <span className="live-badge">
                    AO VIVO
                  </span>
                )}
              </div>
              <div className="teams">
                {teams.home.name} vs {teams.away.name}
              </div>
              <div className="time">
                {formatTime(fixtureData.date)}
              </div>
            </div>
            
            <div className="status-info">
              <div className="status">
                {fixtureData.status.short}
              </div>
              {fixtureData.status.elapsed && (
                <div className="elapsed">
                  {fixtureData.status.elapsed}'
                </div>
              )}
            </div>
          </div>

          {fixture.goals && (
            <div className="score">
              <div className="score-display">
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
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p className="loading-text">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <div className="error-card">
            <div className="error-title">Erro ao carregar dados</div>
            <div className="error-message">{error}</div>
            <button
              onClick={loadDashboardData}
              className="retry-btn"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="title-section">
              <h1>🎯 Dashboard Over/Under</h1>
              <p>Análises especializadas em gols, escanteios, finalizações e cartões</p>
            </div>
            <div className="header-actions">
              {/* Indicadores de Cache */}
              <div className="cache-indicators">
                {cacheInfo.fixtures.fromCache && (
                  <span className="cache-badge fixtures">
                    📦 Cache
                  </span>
                )}
                {cacheInfo.predictions.fromCache && (
                  <span className="cache-badge predictions">
                    📦 Cache
                  </span>
                )}
              </div>
              {/* Botão de Refresh */}
              <button
                onClick={() => loadDashboardData(true)}
                disabled={loading}
                className="refresh-btn"
              >
                <FaEye />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
          
          {/* Informações de Cache */}
          <div className="cache-info">
            <div className="cache-grid">
              <div className="cache-item">
                <span className="label">Fixtures:</span>
                <span className={`status ${cacheInfo.fixtures.fromCache ? 'cache' : 'api'}`}>
                  {cacheInfo.fixtures.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.fixtures.lastUpdate && (
                  <span className="timestamp">
                    ({new Date(cacheInfo.fixtures.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="cache-item">
                <span className="label">Live:</span>
                <span className={`status ${cacheInfo.live.fromCache ? 'cache' : 'api'}`}>
                  {cacheInfo.live.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.live.lastUpdate && (
                  <span className="timestamp">
                    ({new Date(cacheInfo.live.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="cache-item">
                <span className="label">Predictions:</span>
                <span className={`status ${cacheInfo.predictions.fromCache ? 'cache' : 'api'}`}>
                  {cacheInfo.predictions.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.predictions.lastUpdate && (
                  <span className="timestamp">
                    ({new Date(cacheInfo.predictions.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="cache-item">
                <span className="label">Live Pred:</span>
                <span className={`status ${cacheInfo.livePredictions.fromCache ? 'cache' : 'api'}`}>
                  {cacheInfo.livePredictions.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.livePredictions.lastUpdate && (
                  <span className="timestamp">
                    ({new Date(cacheInfo.livePredictions.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="icon-wrapper blue">
                <FaCalendar />
              </div>
              <div className="stat-info">
                <h3>Jogos Hoje</h3>
                <div className="value">{stats.totalFixtures}</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="icon-wrapper red">
                <FaFire />
              </div>
              <div className="stat-info">
                <h3>Ao Vivo</h3>
                <div className="value">{stats.liveFixtures}</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="icon-wrapper green">
                <FaDice />
              </div>
              <div className="stat-info">
                <h3>Análises Over/Under</h3>
                <div className="value">{stats.totalPredictions}</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="icon-wrapper yellow">
                <FaEye />
              </div>
              <div className="stat-info">
                <h3>Alta Confiança</h3>
                <div className="value">{stats.highConfidence}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Live Fixtures */}
          <div className="section-card">
            <div className="section-header">
              <h2>
                <FaFire className="icon live" />
                Jogos ao Vivo
              </h2>
              <span className="count">{liveFixtures.length} jogos</span>
            </div>
            
            {liveFixtures.length === 0 ? (
              <div className="empty-state">
                <FaClock className="icon" />
                <p>Nenhum jogo ao vivo no momento</p>
              </div>
            ) : (
              <div className="items-grid">
                {liveFixtures.slice(0, 5).map(fixture => 
                  renderFixtureCard(fixture, true)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Live Over/Under Analysis */}
          <div className="section-card">
            <div className="section-header">
              <h2>
                <FaChartLine className="icon analysis" />
                Análises Over/Under ao Vivo
              </h2>
              <span className="count">{livePredictions.length} análises</span>
            </div>
            
            {livePredictions.length === 0 ? (
              <div className="empty-state">
                <FaChartLine className="icon" />
                <p>Nenhuma análise over/under ao vivo disponível</p>
              </div>
            ) : (
              <div className="items-grid">
                {livePredictions.slice(0, 5).map(prediction => 
                  renderOverUnderCard(prediction, true)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Today's Fixtures */}
          <div className="section-card">
            <div className="section-header">
              <h2>
                <FaCalendar className="icon calendar" />
                Jogos de Hoje
              </h2>
              <span className="count">{todayFixtures.length} jogos</span>
            </div>
            
            {todayFixtures.length === 0 ? (
              <div className="empty-state">
                <FaCalendar className="icon" />
                <p>Nenhum jogo programado para hoje</p>
              </div>
            ) : (
              <div className="items-grid">
                {todayFixtures.slice(0, 5).map(fixture => 
                  renderFixtureCard(fixture)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Today's Over/Under Analysis */}
          <div className="section-card">
            <div className="section-header">
              <h2>
                <FaDice className="icon dice" />
                Análises Over/Under de Hoje
              </h2>
              <span className="count">{predictions.length} análises</span>
            </div>
            
            {predictions.length === 0 ? (
              <div className="empty-state">
                <FaDice className="icon" />
                <p>Nenhuma análise over/under disponível para hoje</p>
              </div>
            ) : (
              <div className="items-grid">
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
            className="refresh-btn"
          >
            Atualizar Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
