import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaChartLine, FaDice, FaEye, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import AddBetButton from '../components/AddBetButton';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [livePredictions, setLivePredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('today');
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const [todayResponse, liveResponse] = await Promise.all([
        axios.get('/api/predictions/today'),
        axios.get('/api/predictions/live')
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

  const filterPredictions = (predictionList) => {
    return predictionList.filter(prediction => {
      const matchesSearch = searchTerm === '' || 
        prediction.fixture.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prediction.fixture.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prediction.fixture.league.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesConfidence = confidenceFilter === 'all' || 
        prediction.confidence === confidenceFilter;

      return matchesSearch && matchesConfidence;
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

  const renderPredictionCard = (prediction, isLive = false) => {
    const { fixture, prediction: predData, confidence, recommendation } = prediction;
    const { teams, league, fixture: fixtureData } = fixture;

    return (
      <div key={fixture.fixture.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">{league.name}</span>
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
          
          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
              <span>{getConfidenceIcon(confidence)}</span>
              {confidence.toUpperCase()}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por time ou liga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Confidence Filter */}
            <div className="sm:w-48">
              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as confianças</option>
                <option value="alta">Alta confiança</option>
                <option value="média">Média confiança</option>
                <option value="baixa">Baixa confiança</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadPredictions}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Atualizar
            </button>
          </div>
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
              Tente ajustar os filtros ou aguarde novos jogos.
            </p>
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
