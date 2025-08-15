import React from 'react';
import { FaEye, FaChartLine, FaDice, FaInfoCircle, FaTrophy, FaCoins, FaBrain, FaClock, FaUsers, FaBullseye } from 'react-icons/fa';
import AddBetButton from './AddBetButton';
import H2hCornerAnalysisSection from './H2hCornerAnalysisSection';

const PredictionCard = ({
  prediction,
  isLive = false,
  oddsData,
  loadingOdds,
  loadOddsForFixture,
  h2hCornerAnalysis,
  loadingH2hCorners,
  loadH2hCornerAnalysis,
  openApiPredictionsModal,
  openAdvancedAnalysisModal
}) => {
  // Verificar se prediction e fixture existem
  if (!prediction || !prediction.fixture || !prediction.fixture.fixture || !prediction.fixture.fixture.id) {
    console.warn('⚠️ Prediction inválida no PredictionCard:', prediction);
    return null; // Não renderizar nada
  }
  
  // Funções auxiliares (definidas antes do uso)
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

  const getFixtureStatus = (fixture) => {
    const status = fixture.fixture?.status?.short;
    const elapsed = fixture.fixture?.status?.elapsed;
    
    if (!status) return { label: 'Desconhecido', color: 'text-gray-500' };
    
    switch (status) {
      case 'NS': return { label: 'Não Iniciado', color: 'text-blue-600' };
      case '1H': return { label: `1º Tempo (${elapsed}')`, color: 'text-green-600' };
      case 'HT': return { label: 'Intervalo', color: 'text-yellow-600' };
      case '2H': return { label: `2º Tempo (${elapsed}')`, color: 'text-green-600' };
      case 'ET': return { label: 'Prorrogação', color: 'text-orange-600' };
      case 'P': return { label: 'Pênaltis', color: 'text-purple-600' };
      case 'FT': return { label: 'Finalizado', color: 'text-red-600' };
      case 'AET': return { label: 'Finalizado (Prorrogação)', color: 'text-red-600' };
      case 'PEN': return { label: 'Finalizado (Pênaltis)', color: 'text-red-600' };
      default: return { label: status, color: 'text-gray-500' };
    }
  };

  const isFixtureActive = (fixture) => {
    const status = fixture.fixture?.status?.short;
    return status && status !== 'FT' && status !== 'AET' && status !== 'PEN';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'alta': return 'text-green-600 bg-green-100 border-green-200';
      case 'média': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'baixa': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'baixo': return 'text-green-600 bg-green-100 border-green-200';
      case 'médio': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'alto': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'baixo': return '🟢';
      case 'médio': return '🟡';
      case 'alto': return '🔴';
      default: return '⚪';
    }
  };

  const getMarketTypeColor = (marketType) => {
    switch (marketType) {
      case 'over': return 'text-green-600 bg-green-100 border-green-200';
      case 'under': return 'text-red-600 bg-red-100 border-red-200';
      case 'winner': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'draw': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'both_teams': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getMarketTypeLabel = (marketType) => {
    switch (marketType) {
      case 'over': return 'Over/Under';
      case 'under': return 'Over/Under';
      case 'winner': return 'Vencedor';
      case 'draw': return 'Empate';
      case 'both_teams': return 'Ambos Marcam';
      default: return 'Mercado';
    }
  };

  // Agora usar as funções
  const { fixture, prediction: predData, confidence } = prediction;
  const { teams, league, fixture: fixtureData } = fixture;
  const marketType = getMarketType(prediction);
  const fixtureStatus = getFixtureStatus(fixture);
  const isActive = isFixtureActive(fixture);

  // Função para renderizar seção de odds
  const renderOddsSection = (fixtureId, marketType, isLive = false) => {
    const odds = oddsData[fixtureId];
    const isLoading = loadingOdds[fixtureId];

    if (isLoading) {
      return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
              <FaCoins className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700">Odds</h3>
              <p className="text-xs text-gray-600">Carregando...</p>
            </div>
            <div className="ml-auto">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            </div>
          </div>
        </div>
      );
    }

    if (!odds) {
      return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
              <FaCoins className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700">Odds</h3>
              <p className="text-xs text-gray-600">Não carregadas</p>
            </div>
          </div>
          <button
            onClick={() => loadOddsForFixture(fixtureId, isLive)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FaCoins className="text-sm" />
            Carregar odds {isLive ? 'ao vivo' : 'disponíveis'}
          </button>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
            <FaCoins className="text-white text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700">
              Odds {isLive ? 'Ao Vivo' : 'Disponíveis'}
            </h3>
            <p className="text-xs text-gray-600">Casa de apostas</p>
          </div>
          {isLive && (
            <div className="ml-auto">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-bold">
                LIVE
              </span>
            </div>
          )}
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 text-center">Odds carregadas com sucesso</p>
        </div>
      </div>
    );
  };

  // Para jogos finalizados, mostrar apenas informações essenciais
  if (!isLive && !isActive) {
    return (
      <div className="relative overflow-hidden rounded-xl shadow-lg border-l-4 border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-gray-600 text-white">
            <span className="text-sm">⏭️</span>
            FINALIZADO
          </div>
        </div>

        {/* Header com League */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
              <FaTrophy className="text-yellow-500 text-sm" />
              <span className="text-sm font-semibold text-gray-700">{league.name}</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-red-600">
              Finalizado
            </span>
          </div>

          {/* Teams Section com Placar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="text-lg font-bold text-gray-800 mb-1">
                  {teams.home.name}
                </div>
                <div className="text-xs text-gray-500">Casa</div>
              </div>
              
              <div className="mx-4 text-center">
                <div className="text-3xl font-bold text-gray-700 mb-1">
                  {fixture.goals?.home || 0} - {fixture.goals?.away || 0}
                </div>
                <div className="text-xs text-gray-500">Placar Final</div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="text-lg font-bold text-gray-800 mb-1">
                  {teams.away.name}
                </div>
                <div className="text-xs text-gray-500">Visitante</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Para jogos ao vivo e ativos, manter o card completo
  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
      isActive ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100' : 'border-red-500 bg-gradient-to-br from-red-50 to-red-100'
    }`}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
          isLive ? 'bg-red-500 text-white animate-pulse' :
          isActive ? 'bg-green-500 text-white' :
          'bg-gray-600 text-white'
        }`}>
          <span className="text-sm">{isLive ? '🔴' : isActive ? '🟢' : '⏭️'}</span>
          {isLive ? 'AO VIVO' : isActive ? 'ATIVO' : 'FINALIZADO'}
        </div>
      </div>

      {/* Header com League */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
            <FaTrophy className="text-yellow-500 text-sm" />
            <span className="text-sm font-semibold text-gray-700">{league.name}</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm ${fixtureStatus.color}`}>
            {fixtureStatus.label}
          </span>
        </div>

        {/* Teams Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {teams.home.name}
              </div>
              <div className="text-xs text-gray-500">Casa</div>
            </div>
            
            <div className="mx-4 text-center">
              <div className="text-2xl font-bold text-gray-700">VS</div>
              <div className="text-xs text-gray-500 mt-1">Confronto</div>
            </div>
            
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {teams.away.name}
              </div>
              <div className="text-xs text-gray-500">Visitante</div>
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaClock className="text-blue-500 text-sm" />
              <span className="text-sm font-bold text-gray-700">
                {formatTime(fixtureData.date)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              ID: {fixture.fixture.id}
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Metrics */}
      <div className="px-4 pb-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <FaBullseye className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-800">Métricas da Predição</h3>
              <p className="text-xs text-blue-600">Análise detalhada</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${getConfidenceColor(confidence)}`}>
              <span>{getConfidenceIcon(confidence)}</span>
              {confidence.toUpperCase()}
            </div>
            
            {prediction.riskLevel && (
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${getRiskLevelColor(prediction.riskLevel)}`}>
                <span>{getRiskLevelIcon(prediction.riskLevel)}</span>
                {prediction.riskLevel.toUpperCase()}
              </div>
            )}
            
            {prediction.analysis?.advancedScore && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <span>📊</span>
                Score: {Math.round(prediction.analysis.advancedScore * 100)}%
              </div>
            )}
            
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${getMarketTypeColor(marketType)}`}>
              <span>{getMarketTypeLabel(marketType)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Details */}
      {predData && (
        <div className="px-4 pb-3 space-y-4">
          {/* Winner Prediction */}
          {predData.winner && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FaDice className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-800">Vencedor Previsto</h3>
                  <p className="text-xs text-blue-600">Análise de resultado</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-blue-700">
                  {predData.winner.name}
                  {predData.winner.comment && (
                    <span className="text-xs ml-2 text-blue-600 font-normal">({predData.winner.comment})</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Percentages */}
          {predData.percent && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700">Probabilidades</h3>
                  <p className="text-xs text-gray-600">Distribuição de chances</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-600 mb-1">Casa</div>
                  <div className="text-lg font-bold text-gray-800">{predData.percent.home}</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-600 mb-1">Empate</div>
                  <div className="text-lg font-bold text-gray-800">{predData.percent.draw}</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-600 mb-1">Fora</div>
                  <div className="text-lg font-bold text-gray-800">{predData.percent.away}</div>
                </div>
              </div>
            </div>
          )}

          {/* Goals Prediction */}
          {predData.under_over && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-800">Previsão de Gols</h3>
                  <p className="text-xs text-green-600">Análise de pontuação</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-green-200">
                <p className="text-sm font-bold text-green-700 text-center">{predData.under_over}</p>
              </div>
            </div>
          )}

          {/* Advice */}
          {predData.advice && (
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <FaInfoCircle className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-800">Recomendação</h3>
                  <p className="text-xs text-purple-600">Conselho especializado</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">{predData.advice}</p>
              </div>
            </div>
          )}

          {/* Odds Section */}
          {fixture.fixture && fixture.fixture.id && renderOddsSection(fixture.fixture.id, marketType, isLive)}
          
          {/* Análise H2H Section */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-purple-800">Análise H2H Corner Kicks</h3>
                <p className="text-xs text-purple-600">Histórico de confrontos</p>
              </div>
              {isLive && (
                <div className="ml-auto">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-bold">
                    AO VIVO
                  </span>
                </div>
              )}
            </div>
            
            {fixture && (fixture.id || (fixture.fixture && fixture.fixture.id)) && (
              <H2hCornerAnalysisSection
                fixture={fixture}
                isLive={isLive}
                h2hCornerAnalysis={h2hCornerAnalysis}
                loadingH2hCorners={loadingH2hCorners}
                loadH2hCornerAnalysis={loadH2hCornerAnalysis}
              />
            )}
          </div>
          
          {/* Botão Análise Avançada */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <FaBrain className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-800">Análise Avançada</h3>
                <p className="text-xs text-indigo-600">Dados completos</p>
              </div>
            </div>
            <button
              onClick={() => openAdvancedAnalysisModal(fixture)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
              title="Ver análise avançada completa"
            >
              <FaBrain className="text-sm" />
              Análise Avançada Completa
            </button>
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div className="px-4 pb-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaUsers className="text-gray-500 text-sm" />
              <span className="text-xs text-gray-600">
                {isLive ? 'Jogo em andamento' : isActive ? 'Jogo ativo' : 'Jogo finalizado'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Botão Predições API */}
            <button
              onClick={() => openApiPredictionsModal(fixture)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg transform hover:scale-105"
              title="Ver predições detalhadas da API-Sports"
            >
              <FaEye className="text-xs" />
              Predições API
            </button>
            
            {/* Botão Adicionar */}
            <AddBetButton 
              prediction={prediction} 
              onBetAdded={() => {
                // Callback opcional para atualizar algo após adicionar a aposta
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
