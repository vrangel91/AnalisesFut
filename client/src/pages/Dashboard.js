import React, { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaChartLine, FaDice, FaEye, FaInfoCircle, FaFire, FaFutbol, FaFlag, FaExclamationTriangle, FaBullseye } from 'react-icons/fa';
import axios from 'axios';

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
      case 'alta': return 'text-green-600 bg-green-100';
      case 'média': return 'text-yellow-600 bg-yellow-100';
      case 'baixa': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
      case 'gols': return <FaFutbol className="text-blue-600 text-xs" />;
      case 'escanteios': return <FaFlag className="text-green-600 text-xs" />;
      case 'finalizações': return <FaBullseye className="text-purple-600 text-xs" />;
      case 'cartões': return <FaExclamationTriangle className="text-red-600 text-xs" />;
      default: return <FaChartLine className="text-gray-600 text-xs" />;
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
        <div key={fixture.fixture.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">{league.name}</span>
                {isLive && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    AO VIVO
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">
                {teams.home.name} vs {teams.away.name}
              </h4>
              <p className="text-xs text-gray-600">
                {formatTime(fixtureData.date)}
              </p>
            </div>
            
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
              <span>{getConfidenceIcon(confidence)}</span>
              {confidence.toUpperCase()}
            </div>
          </div>

          <div className="space-y-2">
            {overUnderAnalysis.map((analysis, index) => (
              <div key={index} className={`p-2 rounded ${getOverUnderColor(analysis.type)}`}>
                <div className="flex items-center gap-1 mb-1">
                  {getOverUnderIcon(analysis.type)}
                  <span className="text-xs font-medium capitalize">{analysis.type}</span>
                </div>
                <p className="text-xs font-semibold">{analysis.prediction}</p>
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
        <div key={fixture.fixture.id} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">{league.name}</span>
                {isLive && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    AO VIVO
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">
                {teams.home.name} vs {teams.away.name}
              </h4>
              <p className="text-xs text-gray-600">
                {formatTime(fixtureData.date)}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {fixtureData.status.short}
              </div>
              {fixtureData.status.elapsed && (
                <div className="text-xs text-red-600 font-semibold">
                  {fixtureData.status.elapsed}'
                </div>
              )}
            </div>
          </div>

          {fixture.goals && (
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Erro ao carregar dados</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Dashboard Over/Under
              </h1>
              <p className="text-gray-600">
                Análises especializadas em gols, escanteios, finalizações e cartões
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Indicadores de Cache */}
              <div className="flex items-center space-x-2 text-sm">
                {cacheInfo.fixtures.fromCache && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center">
                    📦 Cache
                  </span>
                )}
                {cacheInfo.predictions.fromCache && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center">
                    📦 Cache
                  </span>
                )}
              </div>
              {/* Botão de Refresh */}
              <button
                onClick={() => loadDashboardData(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <FaEye className="text-sm" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
          
          {/* Informações de Cache */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Fixtures:</span>
                <span className={cacheInfo.fixtures.fromCache ? 'text-blue-600' : 'text-gray-800'}>
                  {cacheInfo.fixtures.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.fixtures.lastUpdate && (
                  <span className="text-gray-500">
                    ({new Date(cacheInfo.fixtures.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Live:</span>
                <span className={cacheInfo.live.fromCache ? 'text-blue-600' : 'text-gray-800'}>
                  {cacheInfo.live.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.live.lastUpdate && (
                  <span className="text-gray-500">
                    ({new Date(cacheInfo.live.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Predictions:</span>
                <span className={cacheInfo.predictions.fromCache ? 'text-green-600' : 'text-gray-800'}>
                  {cacheInfo.predictions.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.predictions.lastUpdate && (
                  <span className="text-gray-500">
                    ({new Date(cacheInfo.predictions.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Live Pred:</span>
                <span className={cacheInfo.livePredictions.fromCache ? 'text-green-600' : 'text-gray-800'}>
                  {cacheInfo.livePredictions.fromCache ? '📦 Cache' : '🌐 API'}
                </span>
                {cacheInfo.livePredictions.lastUpdate && (
                  <span className="text-gray-500">
                    ({new Date(cacheInfo.livePredictions.lastUpdate).toLocaleTimeString('pt-BR')})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendar className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jogos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFixtures}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaFire className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ao Vivo</p>
                <p className="text-2xl font-bold text-gray-900">{stats.liveFixtures}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaDice className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Análises Over/Under</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPredictions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaEye className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alta Confiança</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highConfidence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Fixtures */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FaFire className="mr-2 text-red-500" />
                Jogos ao Vivo
              </h2>
              <span className="text-sm text-gray-500">{liveFixtures.length} jogos</span>
            </div>
            
            {liveFixtures.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaClock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">Nenhum jogo ao vivo no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveFixtures.slice(0, 5).map(fixture => 
                  renderFixtureCard(fixture, true)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Live Over/Under Analysis */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" />
                Análises Over/Under ao Vivo
              </h2>
              <span className="text-sm text-gray-500">{livePredictions.length} análises</span>
            </div>
            
            {livePredictions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaChartLine className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">Nenhuma análise over/under ao vivo disponível</p>
              </div>
            ) : (
              <div className="space-y-4">
                {livePredictions.slice(0, 5).map(prediction => 
                  renderOverUnderCard(prediction, true)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Today's Fixtures */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FaCalendar className="mr-2 text-green-500" />
                Jogos de Hoje
              </h2>
              <span className="text-sm text-gray-500">{todayFixtures.length} jogos</span>
            </div>
            
            {todayFixtures.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaCalendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">Nenhum jogo programado para hoje</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayFixtures.slice(0, 5).map(fixture => 
                  renderFixtureCard(fixture)
                ).filter(Boolean)}
              </div>
            )}
          </div>

          {/* Today's Over/Under Analysis */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FaDice className="mr-2 text-purple-500" />
                Análises Over/Under de Hoje
              </h2>
              <span className="text-sm text-gray-500">{predictions.length} análises</span>
            </div>
            
            {predictions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FaDice className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">Nenhuma análise over/under disponível para hoje</p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.slice(0, 5).map(prediction => 
                  renderOverUnderCard(prediction)
                ).filter(Boolean)}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Atualizar Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
