import React from 'react';
import { FaBrain, FaChartLine, FaTrophy, FaClock, FaMapMarkerAlt, FaUsers, FaEye, FaCog } from 'react-icons/fa';
import AddBetButton from './AddBetButton';
import H2hCornerAnalysisSection from './H2hCornerAnalysisSection';

const FixtureCard = ({
  fixture,
  dayType,
  aiAnalysisToday,
  loadingAiAnalysisToday,
  loadAiAnalysisToday,
  h2hCornerAnalysisToday,
  loadingH2hCornersToday,
  loadH2hCornerAnalysisToday,
  openApiPredictionsModal,
  openAdvancedAnalysisModal
}) => {
  // Verificação de segurança
  if (!fixture) {
    console.warn('⚠️ Fixture é null ou undefined em FixtureCard');
    return null;
  }
  
  const isToday = dayType === 'today';
  const isLive = fixture.isLive;
  const isFinished = fixture.isFinished;
  const isUpcoming = fixture.isUpcoming;
  
  const getStatusColor = () => {
    if (isLive) return 'border-red-500 bg-gradient-to-br from-red-50 to-red-100';
    if (isFinished) return 'border-gray-500 bg-gradient-to-br from-gray-50 to-gray-100';
    if (isUpcoming) return 'border-green-500 bg-gradient-to-br from-green-50 to-green-100';
    return 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100';
  };

  const getStatusText = () => {
    if (isLive) return 'AO VIVO';
    if (isFinished) return 'FINALIZADO';
    if (isUpcoming) return fixture.timeUntilStart || 'EM BREVE';
    return 'AGENDADO';
  };

  const getStatusIcon = () => {
    if (isLive) return '🔴';
    if (isFinished) return '✅';
    if (isUpcoming) return '⏰';
    return '📅';
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

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${getStatusColor()}`}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
          isLive ? 'bg-red-500 text-white animate-pulse' :
          isFinished ? 'bg-gray-600 text-white' :
          isUpcoming ? 'bg-green-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <span className="text-sm">{getStatusIcon()}</span>
          {getStatusText()}
        </div>
      </div>

      {/* Header com League */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
            <FaTrophy className="text-yellow-500 text-sm" />
            <span className="text-sm font-semibold text-gray-700">{fixture.league?.name}</span>
            {fixture.league?.country && (
              <img 
                src={fixture.league?.flag} 
                alt={fixture.league?.country}
                className="w-4 h-4 object-contain rounded-sm"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>
        </div>

        {/* Teams Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {fixture.teams?.home?.name}
              </div>
              <div className="text-xs text-gray-500">Casa</div>
            </div>
            
            <div className="mx-4 text-center">
              <div className="text-2xl font-bold text-gray-700">VS</div>
              <div className="text-xs text-gray-500 mt-1">Confronto</div>
            </div>
            
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {fixture.teams?.away?.name}
              </div>
              <div className="text-xs text-gray-500">Visitante</div>
            </div>
          </div>
        </div>

        {/* Game Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Horário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FaClock className="text-blue-500 text-sm" />
              <span className="text-xs font-medium text-gray-600">Horário {new Date(fixture.date).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}  </span>
            </div>            
          </div>

          {/* Local */}
          {fixture.venue?.name && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FaMapMarkerAlt className="text-green-500 text-sm" />
                <span className="text-xs font-medium text-gray-600">Local</span>
              </div>
              <div className="text-sm font-bold text-gray-800 truncate">
                {fixture.venue.name}
              </div>
            </div>
          )}
        </div>

        {/* Placar ou Tempo (se aplicável) */}
        {isFinished && fixture.goals && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm mb-4">
            <div className="text-center mb-2">
              <span className="text-xs font-medium text-gray-600">RESULTADO FINAL</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{fixture.goals.home || 0}</div>
                <div className="text-xs text-gray-500">Casa</div>
              </div>
              <div className="text-3xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{fixture.goals.away || 0}</div>
                <div className="text-xs text-gray-500">Visitante</div>
              </div>
            </div>
          </div>
        )}

        {isLive && fixture.status?.elapsed && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 shadow-sm mb-4">
            <div className="text-center">
              <div className="text-sm font-bold text-red-800 mb-1">
                {fixture.status.short} - {fixture.status.elapsed}'
              </div>
              <div className="text-xs text-red-600">JOGO EM ANDAMENTO</div>
            </div>
          </div>
        )}
      </div>

      {/* Análise IA Section */}
      <div className="px-4 pb-3">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <FaBrain className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-800">Análise IA de Gols</h3>
                <p className="text-xs text-teal-600">Inteligência Artificial</p>
              </div>
            </div>
            <button
              onClick={() => loadAiAnalysisToday(fixture, dayType)}
              disabled={loadingAiAnalysisToday[fixture.id]}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                loadingAiAnalysisToday[fixture.id]
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {loadingAiAnalysisToday[fixture.id] ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                  Analisando...
                </>
              ) : (
                <>
                  <FaCog className="text-xs" />
                  Analisar IA
                </>
              )}
            </button>
          </div>
          
          {/* Exibir análise IA se disponível */}
          {aiAnalysisToday[fixture.id] && (
            <div className="space-y-3">
              {/* Winner Prediction */}
              {aiAnalysisToday[fixture.id].prediction?.winner && (
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🎯</span>
                    </div>
                    <span className="text-xs font-bold text-blue-800">Vencedor Previsto</span>
                  </div>
                  <p className="text-sm text-blue-700 font-semibold">
                    {aiAnalysisToday[fixture.id].prediction.winner.name}
                    {aiAnalysisToday[fixture.id].prediction.winner.comment && (
                      <span className="text-xs ml-2 text-blue-600">({aiAnalysisToday[fixture.id].prediction.winner.comment})</span>
                    )}
                  </p>
                </div>
              )}

              {/* Percentages */}
              {aiAnalysisToday[fixture.id].prediction?.percent && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200 text-center">
                    <div className="text-xs text-gray-600 mb-1">Casa</div>
                    <div className="text-sm font-bold text-gray-800">{aiAnalysisToday[fixture.id].prediction.percent.home}</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200 text-center">
                    <div className="text-xs text-gray-600 mb-1">Empate</div>
                    <div className="text-sm font-bold text-gray-800">{aiAnalysisToday[fixture.id].prediction.percent.draw}</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200 text-center">
                    <div className="text-xs text-gray-600 mb-1">Fora</div>
                    <div className="text-sm font-bold text-gray-800">{aiAnalysisToday[fixture.id].prediction.percent.away}</div>
                  </div>
                </div>
              )}

              {/* Goals Prediction */}
              {aiAnalysisToday[fixture.id].prediction?.under_over && (
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <FaChartLine className="text-white text-xs" />
                    </div>
                    <span className="text-xs font-bold text-green-800">Previsão de Gols</span>
                  </div>
                  <p className="text-sm font-bold text-green-700">{aiAnalysisToday[fixture.id].prediction.under_over}</p>
                </div>
              )}

              {/* Advice */}
              {aiAnalysisToday[fixture.id].prediction?.advice && (
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">💡</span>
                    </div>
                    <span className="text-xs font-bold text-purple-800">Recomendação</span>
                  </div>
                  <p className="text-sm text-purple-700">{aiAnalysisToday[fixture.id].prediction.advice}</p>
                </div>
              )}

              {/* Confiança */}
              <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${getConfidenceColor(aiAnalysisToday[fixture.id].confidence)}`}>
                  <span>{getConfidenceIcon(aiAnalysisToday[fixture.id].confidence)}</span>
                  {aiAnalysisToday[fixture.id].confidence.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Análise H2H Section */}
      <div className="px-4 pb-3">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-800">Análise H2H (Team vs Team)</h3>
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
              h2hCornerAnalysis={h2hCornerAnalysisToday}
              loadingH2hCorners={loadingH2hCornersToday}
              loadH2hCornerAnalysis={loadH2hCornerAnalysisToday}
            />
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-4 pb-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaUsers className="text-gray-500 text-sm" />
              <span className="text-xs text-gray-600">
                {isLive ? 'Jogo em andamento' : isFinished ? 'Jogo finalizado' : 'Jogo agendado'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              ID: {fixture.id}
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
            
            {/* Botão Análise Avançada */}
            <button
              onClick={() => openAdvancedAnalysisModal(fixture)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg transform hover:scale-105"
              title="Ver análise avançada completa"
            >
              <FaBrain className="text-xs" />
              Análise Avançada
            </button>
          </div>
          
          {/* Botão Adicionar - só mostrar se tiver análise IA */}
          {aiAnalysisToday[fixture.id] && (
            <div className="mt-3">
              <AddBetButton 
                prediction={aiAnalysisToday[fixture.id]} 
                h2hData={h2hCornerAnalysisToday[fixture.id]}
                onBetAdded={() => {
                  console.log('Aposta adicionada para fixture:', fixture.id);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
