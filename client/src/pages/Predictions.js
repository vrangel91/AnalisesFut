import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaChartLine, FaDice, FaEye, FaInfoCircle, FaTrophy, FaBars } from 'react-icons/fa';
import axios from 'axios';
import AddBetButton from '../components/AddBetButton';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [livePredictions, setLivePredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('today');
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availableLeagues, setAvailableLeagues] = useState([]);

  useEffect(() => {
    loadPredictions();
  }, []);

  // Extrair ligas únicas quando os dados são carregados
  useEffect(() => {
    const allPredictions = [...predictions, ...livePredictions];
    const leagues = [...new Set(allPredictions.map(p => p.fixture.league.name))];
    setAvailableLeagues(leagues.sort());
  }, [predictions, livePredictions]);

  const loadPredictions = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const [todayResponse, liveResponse] = await Promise.all([
        axios.get(`/api/predictions/today${forceRefresh ? '?refresh=true' : ''}`),
        axios.get(`/api/predictions/live${forceRefresh ? '?refresh=true' : ''}`)
      ]);

      setPredictions(todayResponse.data.data || []);
      setLivePredictions(liveResponse.data.data || []);
      
      // Verificar se os dados vieram do cache
      const fromCacheToday = todayResponse.data.fromCache;
      const fromCacheLive = liveResponse.data.fromCache;
      setFromCache(fromCacheToday || fromCacheLive);
      setLastUpdate(todayResponse.data.timestamp || liveResponse.data.timestamp);
    } catch (error) {
      console.error('Erro ao carregar predições:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para detectar tipo de mercado baseado na predição
  const getMarketType = (prediction) => {
    const predText = prediction.prediction?.under_over || prediction.prediction?.advice || '';
    const text = predText.toString().toLowerCase();
    
    if (text.includes('over') || text.includes('acima') || text.includes('mais')) {
      return 'over';
    } else if (text.includes('under') || text.includes('abaixo') || text.includes('menos')) {
      return 'under';
    } else if (text.includes('winner') || text.includes('vencedor') || text.includes('casa') || text.includes('fora')) {
      return 'winner';
    } else if (text.includes('draw') || text.includes('empate')) {
      return 'draw';
    } else if (text.includes('both') || text.includes('ambos') || text.includes('yes')) {
      return 'both_teams';
    }
    return 'other';
  };

  const filterPredictions = (predictionList) => {
    return predictionList.filter(prediction => {
      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        prediction.fixture.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prediction.fixture.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prediction.fixture.league.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de confiança
      const matchesConfidence = confidenceFilter === 'all' || 
        prediction.confidence === confidenceFilter;

      // Filtro de liga
      const matchesLeague = leagueFilter === 'all' || 
        prediction.fixture.league.name === leagueFilter;

      // Filtro de mercado
      const matchesMarket = marketFilter === 'all' || 
        getMarketType(prediction) === marketFilter;

      return matchesSearch && matchesConfidence && matchesLeague && matchesMarket;
    });
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

  const getMarketTypeColor = (marketType) => {
    switch (marketType) {
      case 'over': return 'text-green-600 bg-green-100';
      case 'under': return 'text-red-600 bg-red-100';
      case 'winner': return 'text-blue-600 bg-blue-100';
      case 'draw': return 'text-yellow-600 bg-yellow-100';
      case 'both_teams': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMarketTypeLabel = (marketType) => {
    switch (marketType) {
      case 'over': return 'Over';
      case 'under': return 'Under';
      case 'winner': return 'Vencedor';
      case 'draw': return 'Empate';
      case 'both_teams': return 'Ambos Marcam';
      default: return 'Outro';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearCache = async () => {
    try {
      await axios.post('/api/predictions/clear-cache');
      alert('Cache limpo com sucesso!');
      loadPredictions(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setConfidenceFilter('all');
    setLeagueFilter('all');
    setMarketFilter('all');
  };

  const renderPredictionCard = (prediction, isLive = false) => {
    const { fixture, prediction: predData, confidence, recommendation } = prediction;
    const { teams, league, fixture: fixtureData } = fixture;
    const marketType = getMarketType(prediction);

    return (
      <div key={fixture.fixture.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FaTrophy className="text-yellow-500" />
              <span className="text-sm text-gray-500 font-medium">{league.name}</span>
              {isLive && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  AO VIVO
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {teams.home.name} vs {teams.away.name}
            </h3>
            <p className="text-sm text-gray-600">
              {formatTime(fixtureData.date)}
            </p>
          </div>
          
          <div className="text-right space-y-2">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
              <span>{getConfidenceIcon(confidence)}</span>
              {confidence.toUpperCase()}
            </div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getMarketTypeColor(marketType)}`}>
              <span>{getMarketTypeLabel(marketType)}</span>
            </div>
          </div>
        </div>

        {/* Prediction Details */}
        {predData && (
          <div className="space-y-3">
            {/* Winner Prediction */}
            {predData.winner && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaDice className="text-blue-600" />
                  <span className="font-medium text-blue-800">Vencedor Previsto</span>
                </div>
                <p className="text-blue-700">
                  <strong>{predData.winner.name}</strong>
                  {predData.winner.comment && (
                    <span className="text-sm ml-2">({predData.winner.comment})</span>
                  )}
                </p>
              </div>
            )}

            {/* Percentages */}
            {predData.percent && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Casa</div>
                  <div className="font-bold text-gray-800">{predData.percent.home}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Empate</div>
                  <div className="font-bold text-gray-800">{predData.percent.draw}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Fora</div>
                  <div className="font-bold text-gray-800">{predData.percent.away}</div>
                </div>
              </div>
            )}

            {/* Goals Prediction */}
            {predData.under_over && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaChartLine className="text-green-600" />
                  <span className="font-medium text-green-800">Previsão de Gols</span>
                </div>
                <p className="text-green-700 font-semibold">{predData.under_over}</p>
              </div>
            )}

            {/* Advice */}
            {predData.advice && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaInfoCircle className="text-purple-600" />
                  <span className="font-medium text-purple-800">Recomendação</span>
                </div>
                <p className="text-purple-700 text-sm">{predData.advice}</p>
              </div>
            )}

            {/* Recommendation */}
            {recommendation && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaEye className="text-orange-600" />
                  <span className="font-medium text-orange-800">Análise IA</span>
                </div>
                <p className="text-orange-700 text-sm">{recommendation}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <AddBetButton 
              prediction={prediction} 
              onBetAdded={() => {
                // Callback opcional para atualizar algo após adicionar a aposta
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const currentPredictions = activeTab === 'today' ? predictions : livePredictions;
  const filteredPredictions = filterPredictions(currentPredictions);

  // Contadores para estatísticas
  const totalPredictions = currentPredictions.length;
  const filteredCount = filteredPredictions.length;
  const activeFilters = [searchTerm, confidenceFilter, leagueFilter, marketFilter].filter(f => f !== 'all').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 predictions-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Predições IA
              </h1>
              <p className="text-gray-600">
                Análises inteligentes baseadas em algoritmos avançados da API-SPORTS
              </p>
              {fromCache && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    📦 Dados do cache
                  </span>
                  {lastUpdate && (
                    <span className="text-sm text-gray-500">
                      Última atualização: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadPredictions(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                title="Forçar atualização da API"
              >
                <FaEye className="text-sm" />
                Atualizar
              </button>
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                title="Limpar cache e recarregar dados"
              >
                🗑️ Limpar Cache
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'today'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hoje ({predictions.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ao Vivo ({livePredictions.length})
          </button>
        </div>

        {/* Filtros Avançados */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Header dos Filtros */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-blue-500" />
              <h3 className="font-medium text-gray-900">Filtros Avançados</h3>
              {activeFilters > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {activeFilters} ativo{activeFilters > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <FaBars />
                {showFilters ? 'Ocultar' : 'Mostrar'}
              </button>
              {activeFilters > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="text-sm text-gray-600 mb-4">
            Mostrando {filteredCount} de {totalPredictions} predições
            {activeFilters > 0 && ` (${totalPredictions - filteredCount} ocultadas pelos filtros)`}
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Time ou liga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-input"
                  />
                </div>
              </div>

              {/* Filtro de Confiança */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confiança
                </label>
                <select
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todas as confianças</option>
                  <option value="alta" style={{ color: '#111827', backgroundColor: 'white' }}>Alta confiança</option>
                  <option value="média" style={{ color: '#111827', backgroundColor: 'white' }}>Média confiança</option>
                  <option value="baixa" style={{ color: '#111827', backgroundColor: 'white' }}>Baixa confiança</option>
                </select>
              </div>

              {/* Filtro de Liga */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campeonato
                </label>
                <select
                  value={leagueFilter}
                  onChange={(e) => setLeagueFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todos os campeonatos</option>
                  {availableLeagues.map(league => (
                    <option key={league} value={league} style={{ color: '#111827', backgroundColor: 'white' }}>{league}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Mercado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mercado
                </label>
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todos os mercados</option>
                  <option value="over" style={{ color: '#111827', backgroundColor: 'white' }}>Over</option>
                  <option value="under" style={{ color: '#111827', backgroundColor: 'white' }}>Under</option>
                  <option value="winner" style={{ color: '#111827', backgroundColor: 'white' }}>Vencedor</option>
                  <option value="draw" style={{ color: '#111827', backgroundColor: 'white' }}>Empate</option>
                  <option value="both_teams" style={{ color: '#111827', backgroundColor: 'white' }}>Ambos Marcam</option>
                  <option value="other" style={{ color: '#111827', backgroundColor: 'white' }}>Outros</option>
                </select>
              </div>
            </div>
          )}

          {/* Filtros Rápidos */}
          {!showFilters && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por time ou liga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-input"
                  />
                </div>
              </div>

              <div className="sm:w-48">
                <select
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent modal-select"
                  style={{ color: '#111827', backgroundColor: 'white' }}
                >
                  <option value="all" style={{ color: '#111827', backgroundColor: 'white' }}>Todas as confianças</option>
                  <option value="alta" style={{ color: '#111827', backgroundColor: 'white' }}>Alta confiança</option>
                  <option value="média" style={{ color: '#111827', backgroundColor: 'white' }}>Média confiança</option>
                  <option value="baixa" style={{ color: '#111827', backgroundColor: 'white' }}>Baixa confiança</option>
                </select>
              </div>

              <button
                onClick={loadPredictions}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Atualizar
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando predições...</p>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="text-center py-12">
            <FaFilter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma predição encontrada</h3>
            <p className="mt-2 text-gray-600">
              {activeFilters > 0 
                ? 'Tente ajustar os filtros aplicados.' 
                : 'Aguarde novos jogos ou tente atualizar os dados.'
              }
            </p>
            {activeFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Limpar Todos os Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPredictions.map(prediction => 
              renderPredictionCard(prediction, activeTab === 'live')
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
