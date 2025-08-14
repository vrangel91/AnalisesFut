import React from 'react';

const H2hCornerAnalysisSection = ({ 
  fixture, 
  isLive, 
  h2hCornerAnalysis, 
  loadingH2hCorners, 
  loadH2hCornerAnalysis 
}) => {
  // Log para debug
  console.log('🔍 H2hCornerAnalysisSection - fixture:', fixture);
  
  // Extrair fixtureId de forma mais robusta
  const getFixtureId = () => {
    if (!fixture) {
      console.warn('⚠️ Fixture é null ou undefined');
      return null;
    }
    
    // Verificar diferentes estruturas possíveis
    if (fixture.fixture && fixture.fixture.id) {
      console.log('✅ ID encontrado em fixture.fixture.id:', fixture.fixture.id);
      return fixture.fixture.id;
    }
    
    if (fixture.id) {
      console.log('✅ ID encontrado em fixture.id:', fixture.id);
      return fixture.id;
    }
    
    // Se não encontrar ID, log da estrutura completa
    console.warn('⚠️ ID não encontrado. Estrutura da fixture:', JSON.stringify(fixture, null, 2));
    return null;
  };

  const fixtureId = getFixtureId();
  
  // Se não conseguir extrair o ID, mostrar mensagem de erro mais informativa
  if (!fixtureId) {
    return (
      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600">⚠️</span>
          <span className="font-medium text-red-700">Erro na Análise H2H</span>
        </div>
        <p className="text-sm text-red-600">ID da fixture não encontrado</p>
        <details className="mt-2">
          <summary className="text-xs text-red-500 cursor-pointer">Ver detalhes da fixture</summary>
          <pre className="text-xs text-red-500 mt-1 bg-red-100 p-2 rounded overflow-auto max-h-20">
            {JSON.stringify(fixture, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  const analysis = h2hCornerAnalysis[fixtureId];
  const isLoading = loadingH2hCorners[fixtureId];

  if (isLoading) {
    return (
      <div className="bg-purple-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-600">🔄</span>
          <span className="font-medium text-purple-700">Análise H2H Corner Kicks</span>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
        </div>
        <p className="text-sm text-purple-500">Carregando análise H2H...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-purple-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-600">📊</span>
          <span className="font-medium text-purple-700">Análise H2H Corner Kicks</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadH2hCornerAnalysis(fixture, isLive)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <span>📊</span>
            Carregar análise H2H
          </button>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">Histórico de confrontos</span>
        </div>
      </div>
    );
  }

  const { h2hAnalysis } = analysis;
  if (!h2hAnalysis) {
    return (
      <div className="bg-purple-50 p-3 rounded-lg">
        <div className="text-center text-purple-600">
          <span className="text-lg">📊</span>
          <p className="mt-2">Análise H2H não disponível</p>
          <p className="text-sm">Clique no botão para carregar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-purple-600">📊</span>
          <span className="font-medium text-purple-700">
            Análise H2H Corner Kicks {isLive ? 'Ao Vivo' : ''}
          </span>
          {isLive && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => loadH2hCornerAnalysis(fixture, isLive)}
          className="px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
          title="Recarregar análise H2H"
        >
          🔄
        </button>
      </div>

      {/* Resumo H2H */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-white rounded-lg border border-purple-200">
          <div className="text-xs text-purple-600 mb-1">Total Jogos</div>
          <div className="text-lg font-bold text-purple-700">{h2hAnalysis.totalMatches}</div>
        </div>
        
        <div className="text-center p-2 bg-white rounded-lg border border-purple-200">
          <div className="text-xs text-purple-600 mb-1">Média Escanteios</div>
          <div className="text-lg font-bold text-purple-700">
            {h2hAnalysis.cornerStats?.averageCorners ? h2hAnalysis.cornerStats.averageCorners.toFixed(1) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Aviso sobre dados de corner kicks */}
      {(!h2hAnalysis.cornerStats || !h2hAnalysis.cornerStats.averageCorners) && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-700">
            ⚠️ Dados de corner kicks não disponíveis para esta fixture
          </div>
        </div>
      )}

      {/* Estatísticas Over/Under */}
      {h2hAnalysis.cornerStats?.overUnder ? (
        <div className="mb-3">
          <div className="text-sm font-medium text-purple-700 mb-2">📈 Estatísticas Over/Under:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded border border-purple-200">
              <div className="text-purple-600 font-medium">Over 8.5:</div>
              <div className="text-purple-800">{h2hAnalysis.cornerStats.overUnder.over85 || 0}/{h2hAnalysis.totalMatches}</div>
            </div>
            <div className="bg-white p-2 rounded border border-purple-200">
              <div className="text-purple-600 font-medium">Over 7.5:</div>
              <div className="text-purple-800">{h2hAnalysis.cornerStats.overUnder.over75 || 0}/{h2hAnalysis.totalMatches}</div>
            </div>
            <div className="bg-white p-2 rounded border border-purple-200">
              <div className="text-purple-600 font-medium">Over 6.5:</div>
              <div className="text-purple-800">{h2hAnalysis.cornerStats.overUnder.over65 || 0}/{h2hAnalysis.totalMatches}</div>
            </div>
            <div className="bg-white p-2 rounded border border-purple-200">
              <div className="text-purple-600 font-medium">Over 5.5:</div>
              <div className="text-purple-800">{h2hAnalysis.cornerStats.overUnder.over55 || 0}/{h2hAnalysis.totalMatches}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-700">
            ⚠️ Dados de corner kicks não disponíveis na API H2H
          </div>
        </div>
      )}

      {/* Distribuição */}
      {h2hAnalysis.cornerStats?.distribution ? (
        <div className="mb-3">
          <div className="text-sm font-medium text-purple-700 mb-2">⚖️ Distribuição de Escanteios:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded border border-purple-200">
              <div className="text-purple-600 font-medium">Equilibrado:</div>
              <div className="text-purple-800">{(h2hAnalysis.cornerStats.distribution.balanced || 0) + (h2hAnalysis.cornerStats.distribution.veryBalanced || 0)}/{h2hAnalysis.totalMatches}</div>
            </div>
            <div className="bg-white p-2 rounded border border-purple-200">
              <div className="text-purple-600 font-medium">Casa Domina:</div>
              <div className="text-purple-800">{h2hAnalysis.cornerStats.distribution.homeDominant || 0}/{h2hAnalysis.totalMatches}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Informações H2H Básicas */}
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm font-medium text-blue-700 mb-2">📊 Estatísticas H2H Básicas:</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white p-2 rounded border border-blue-200 text-center">
            <div className="text-blue-600 font-medium">Vitórias Casa</div>
            <div className="text-blue-800 font-bold">{h2hAnalysis.h2hAnalysis?.homeWins || 0}</div>
          </div>
          <div className="bg-white p-2 rounded border border-blue-200 text-center">
            <div className="text-blue-600 font-medium">Vitórias Fora</div>
            <div className="text-blue-800 font-bold">{h2hAnalysis.h2hAnalysis?.awayWins || 0}</div>
          </div>
          <div className="bg-white p-2 rounded border border-blue-200 text-center">
            <div className="text-blue-600 font-medium">Empates</div>
            <div className="text-blue-800 font-bold">{h2hAnalysis.h2hAnalysis?.draws || 0}</div>
          </div>
        </div>
        {h2hAnalysis.h2hAnalysis?.averageGoals && (
          <div className="mt-2 text-center">
            <div className="text-xs text-blue-600">Média de Gols: <span className="font-bold text-blue-800">{h2hAnalysis.h2hAnalysis.averageGoals.toFixed(1)}</span></div>
          </div>
        )}
      </div>

      {/* Recomendações */}
      {h2hAnalysis.recommendations && h2hAnalysis.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg border border-purple-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-600">🎯</span>
            <span className="text-purple-700 font-medium">Recomendações H2H</span>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              h2hAnalysis.confidence === 'alta' ? 'bg-green-100 text-green-800' :
              h2hAnalysis.confidence === 'média' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <span>Confiança: {h2hAnalysis.confidence.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {h2hAnalysis.recommendations.map((rec, index) => (
              <div key={index} className="bg-white p-2 rounded border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${
                    rec.type === 'over' ? 'text-green-600' :
                    rec.type === 'under' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {rec.market}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    rec.confidence === 'alta' ? 'bg-green-100 text-green-800' :
                    rec.confidence === 'média' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <span>{rec.confidence.toUpperCase()}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-700 mb-1">{rec.reasoning}</div>
                <div className="text-xs text-purple-600 font-medium">{rec.stats}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-purple-600">
          Fonte: API-SPORTS Head to Head
        </p>
        <p className="text-xs text-gray-400">
          Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default H2hCornerAnalysisSection;
