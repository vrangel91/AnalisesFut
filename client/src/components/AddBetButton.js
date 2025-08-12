import React, { useState } from 'react';
import { FaPlus, FaBookmark } from 'react-icons/fa';

const AddBetButton = ({ prediction, onBetAdded, h2hData }) => {
  // Função para extrair o texto da previsão
  const getPredictionText = (pred) => {
    console.log('🔍 getPredictionText - pred:', pred);
    
    if (typeof pred?.prediction === 'string') {
      return pred.prediction;
    } else if (pred?.prediction?.under_over) {
      return pred.prediction.under_over;
    } else if (pred?.prediction?.advice) {
      return pred.prediction.advice;
    } else if (pred?.recommendation) {
      return pred.recommendation;
    }
    
    // Fallback: tentar extrair de outras fontes
    if (pred?.h2hAnalysis?.recommendations && pred.h2hAnalysis.recommendations.length > 0) {
      const firstRec = pred.h2hAnalysis.recommendations[0];
      return firstRec.market || 'Análise H2H disponível';
    }
    
    return 'Previsão não disponível';
  };

  // Função inteligente para capturar previsões com confiança alta
  const getIntelligentPredictions = (pred, h2h) => {
    const predictions = [];
    
    // Capturar previsão de gols se tiver confiança alta
    if (pred?.confidence === 'alta' && pred?.prediction?.under_over) {
      predictions.push({
        type: 'gols',
        prediction: pred.prediction.under_over,
        confidence: pred.confidence,
        source: 'Análise IA'
      });
    }
    
    // Capturar previsão de corner kicks se disponível (H2H)
    if (h2h?.h2hAnalysis?.recommendations) {
      const highConfidenceCorners = h2h.h2hAnalysis.recommendations.filter(rec => 
        rec.confidence === 'alta' && rec.market.includes('corner')
      );
      
      highConfidenceCorners.forEach(rec => {
        predictions.push({
          type: 'corner_kicks',
          prediction: rec.market,
          confidence: rec.confidence,
          source: 'Análise H2H'
        });
      });
    }
    
    // Também verificar se há dados H2H na própria prediction (fallback)
    if (pred?.h2hAnalysis?.recommendations) {
      const highConfidenceCorners = pred.h2hAnalysis.recommendations.filter(rec => 
        rec.confidence === 'alta' && rec.market.includes('corner')
      );
      
      highConfidenceCorners.forEach(rec => {
        predictions.push({
          type: 'corner_kicks',
          prediction: rec.market,
          confidence: rec.confidence,
          source: 'Análise H2H'
        });
      });
    }
    
    return predictions;
  };

  const [showModal, setShowModal] = useState(false);
  const [intelligentPredictions] = useState(getIntelligentPredictions(prediction, h2hData));
  const [betData, setBetData] = useState(() => {
    // Função para extrair fixture_id de diferentes estruturas
    const extractFixtureId = (pred) => {
      // Tentar diferentes caminhos para encontrar o fixture_id
      if (pred?.fixture?.fixture?.id) {
        return pred.fixture.fixture.id;
      }
      if (pred?.fixture?.id) {
        return pred.fixture.id;
      }
      if (pred?.id) {
        return pred.id;
      }
      return '';
    };

    // Função para extrair nomes dos times
    const extractTeamNames = (pred) => {
      // Tentar diferentes caminhos para encontrar os nomes dos times
      if (pred?.fixture?.teams?.home?.name && pred?.fixture?.teams?.away?.name) {
        return {
          home: pred.fixture.teams.home.name,
          away: pred.fixture.teams.away.name
        };
      }
      if (pred?.teams?.home?.name && pred?.teams?.away?.name) {
        return {
          home: pred.teams.home.name,
          away: pred.teams.away.name
        };
      }
      return { home: '', away: '' };
    };

    // Função para extrair nome da liga
    const extractLeagueName = (pred) => {
      if (pred?.fixture?.league?.name) {
        return pred.fixture.league.name;
      }
      if (pred?.league?.name) {
        return pred.league.name;
      }
      return '';
    };

    // Função para extrair data
    const extractDate = (pred) => {
      let date = null;
      if (pred?.fixture?.fixture?.date) {
        date = new Date(pred.fixture.fixture.date);
      } else if (pred?.fixture?.date) {
        date = new Date(pred.fixture.date);
      } else if (pred?.date) {
        date = new Date(pred.date);
      }
      
      if (date && !isNaN(date.getTime())) {
        return {
          date: date.toISOString().split('T')[0],
          time: date.toTimeString().split(' ')[0]
        };
      }
      return { date: '', time: '' };
    };

    const fixtureId = extractFixtureId(prediction);
    const teamNames = extractTeamNames(prediction);
    const leagueName = extractLeagueName(prediction);
    const dateInfo = extractDate(prediction);

    console.log('🔍 AddBetButton - Dados extraídos:', {
      fixtureId,
      teamNames,
      leagueName,
      dateInfo,
      prediction
    });

    return {
      fixture_id: fixtureId,
      home_team: teamNames.home,
      away_team: teamNames.away,
      league_name: leagueName,
      market_type: 'Corner Kicks',
      prediction: getPredictionText(prediction),
      confidence: prediction?.confidence || 'alta',
      stake: 0,
      odds: 0,
      match_date: dateInfo.date,
      match_time: dateInfo.time,
      analysis_data: prediction
    };
  });

  const addBet = async () => {
    // Debug: verificar dados antes de enviar
    console.log('🔍 AddBetButton - Dados da aposta sendo enviados:', betData);
    console.log('🔍 AddBetButton - Prediction object:', prediction);
    console.log('🔍 AddBetButton - League name:', prediction?.fixture?.league?.name);
    console.log('🔍 AddBetButton - Fixture ID extraído:', betData.fixture_id);
    
    // Validação específica para fixture_id
    if (!betData.fixture_id || betData.fixture_id === '') {
      console.error('❌ CRÍTICO: fixture_id está vazio!');
      console.error('❌ Dados da prediction:', prediction);
      alert('Erro: Não foi possível identificar o ID do jogo. Por favor, tente novamente ou adicione a aposta manualmente.');
      return;
    }
    
    // Validação dos campos obrigatórios
    if (!betData.home_team || !betData.away_team || !betData.league_name || 
        !betData.prediction || !betData.stake || !betData.odds) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      console.error('❌ Campos obrigatórios faltando:', {
        fixture_id: betData.fixture_id,
        home_team: betData.home_team,
        away_team: betData.away_team,
        league_name: betData.league_name,
        prediction: betData.prediction,
        stake: betData.stake,
        odds: betData.odds
      });
      return;
    }

    try {
      console.log('🚀 Enviando aposta para API com fixture_id:', betData.fixture_id);
      
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Aposta adicionada com sucesso! ID:', data.data?.id);
        setShowModal(false);
        if (onBetAdded) onBetAdded();
        alert('Aposta adicionada com sucesso!');
      } else {
        console.error('❌ Erro da API:', data);
        alert('Erro ao adicionar aposta: ' + (data.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('💥 Erro ao adicionar aposta:', error);
      alert('Erro ao adicionar aposta: ' + error.message);
    }
  };

  const getMarketTypeOptions = () => {
    const options = [];
    
    // Debug: verificar dados recebidos
    console.log('🔍 AddBetButton Debug:', {
      prediction: prediction,
      h2hData: h2hData,
      hasH2HRecommendations: h2hData?.h2hAnalysis?.recommendations,
      h2hRecommendations: h2hData?.h2hAnalysis?.recommendations,
      hasPredictionH2H: prediction?.h2hAnalysis?.recommendations
    });
    
    // Verificar se há previsão de corner kicks (H2H) - PRIORIDADE ALTA
    if ((h2hData?.h2hAnalysis?.recommendations && 
         h2hData.h2hAnalysis.recommendations.some(rec => rec.market.includes('corner'))) ||
        (prediction?.h2hAnalysis?.recommendations && 
         prediction.h2hAnalysis.recommendations.some(rec => rec.market.includes('corner')))) {
      options.push({ value: 'Corner Kicks', label: 'Corner Kicks' });
      console.log('✅ Corner Kicks adicionado às opções');
    } else {
      console.log('❌ Corner Kicks não encontrado:', {
        h2hDataRecommendations: h2hData?.h2hAnalysis?.recommendations,
        predictionH2HRecommendations: prediction?.h2hAnalysis?.recommendations
      });
    }
    
    // Verificar se há previsão de gols
    if (prediction?.prediction?.under_over || 
        (prediction?.prediction?.advice && (prediction.prediction.advice.includes('Over') || prediction.prediction.advice.includes('Under')))) {
      options.push({ value: 'Goals', label: 'Goals' });
    }
    
    // Verificar se há previsão de ambos marcam
    if (prediction?.prediction?.advice && prediction.prediction.advice.includes('Ambos')) {
      options.push({ value: 'Both Teams Score', label: 'Both Teams Score' });
    }
    
    // Verificar se há previsão de vencedor
    if (prediction?.prediction?.winner?.name) {
      options.push({ value: 'Match Winner', label: 'Match Winner' });
    }
    
    // Se não houver nenhuma opção específica, mostrar todas
    if (options.length === 0) {
      options.push(
        { value: 'Corner Kicks', label: 'Corner Kicks' },
        { value: 'Goals', label: 'Goals' },
        { value: 'Over/Under', label: 'Over/Under' },
        { value: 'Both Teams Score', label: 'Both Teams Score' },
        { value: 'Match Winner', label: 'Match Winner' }
      );
    }
    
    console.log('🎯 Opções finais:', options);
    return options;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
        title="Adicionar às Minhas Apostas"
      >
        <FaBookmark />
        Adicionar
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <FaPlus className="mr-3 text-green-600 text-lg" />
                Adicionar às Minhas Apostas
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Informações do Jogo */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {betData.home_team} vs {betData.away_team}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">{prediction?.fixture?.league?.name || 'Liga'}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    📅 {betData.match_date} ⏰ {betData.match_time}
                  </div>
                </div>

                {/* Previsões Inteligentes com Confiança Alta */}
                {intelligentPredictions.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-purple-600 text-lg">🧠</span>
                      <h4 className="text-sm font-semibold text-purple-800">Previsões Inteligentes (Alta Confiança)</h4>
                    </div>
                    <div className="space-y-2">
                      {intelligentPredictions.map((pred, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-purple-700">
                              {pred.type === 'gols' ? '⚽ Gols' : '🔄 Corner Kicks'}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {pred.confidence.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-gray-800 mb-1">
                            {pred.prediction}
                          </div>
                          <div className="text-xs text-gray-600">
                            Fonte: {pred.source}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-purple-100 rounded-lg">
                      <p className="text-xs text-purple-700 text-center mb-2">
                        💡 Estas previsões foram automaticamente capturadas por terem confiança alta
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (intelligentPredictions.length > 0) {
                            const firstPred = intelligentPredictions[0];
                            setBetData({
                              ...betData,
                              prediction: firstPred.prediction,
                              market_type: firstPred.type === 'gols' ? 'Over/Under' : 'Corner Kicks',
                              confidence: firstPred.confidence
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors font-medium"
                      >
                        🚀 Aplicar Primeira Previsão
                      </button>
                    </div>
                  </div>
                )}

                {/* Tipo de Mercado */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎯 Tipo de Mercado
                  </label>
                  <select
                    value={betData.market_type}
                    onChange={(e) => {
                      const selectedMarket = e.target.value;
                      // Preencher automaticamente a predição baseada no tipo de mercado selecionado
                      let autoPrediction = '';
                      
                      if (selectedMarket === 'Corner Kicks') {
                        // Buscar previsão de corner kicks (H2H)
                        if (h2hData?.h2hAnalysis?.recommendations) {
                          const cornerPrediction = h2hData.h2hAnalysis.recommendations.find(rec => 
                            rec.market.includes('corner') && rec.confidence === 'alta'
                          );
                          if (cornerPrediction) {
                            autoPrediction = cornerPrediction.market;
                          }
                        }
                      } else if (selectedMarket === 'Goals') {
                        // Buscar previsão de gols
                        if (prediction?.prediction?.under_over) {
                          autoPrediction = prediction.prediction.under_over;
                        } else if (prediction?.prediction?.advice && (prediction.prediction.advice.includes('Over') || prediction.prediction.advice.includes('Under'))) {
                          autoPrediction = prediction.prediction.advice;
                        }
                      } else if (selectedMarket === 'Over/Under') {
                        // Buscar previsão de corner kicks
                        if (prediction?.h2hAnalysis?.recommendations) {
                          const cornerPrediction = prediction.h2hAnalysis.recommendations.find(rec => 
                            rec.market.includes('corner') && rec.confidence === 'alta'
                          );
                          if (cornerPrediction) {
                            autoPrediction = cornerPrediction.market;
                          }
                        }
                      } else if (selectedMarket === 'Both Teams Score') {
                        // Buscar previsão de ambos marcam
                        if (prediction?.prediction?.advice && prediction.prediction.advice.includes('Ambos')) {
                          autoPrediction = prediction.prediction.advice;
                        }
                      } else if (selectedMarket === 'Match Winner') {
                        // Buscar previsão de vencedor
                        if (prediction?.prediction?.winner?.name) {
                          autoPrediction = `${prediction.prediction.winner.name} (Vencedor)`;
                        }
                      }
                      
                      setBetData({
                        ...betData, 
                        market_type: selectedMarket,
                        prediction: autoPrediction || betData.prediction
                      });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-select"
                  >
                    {getMarketTypeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {betData.prediction && betData.prediction !== getPredictionText(prediction) && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                      ✅ Predição preenchida automaticamente: <strong>{betData.prediction}</strong>
                    </div>
                  )}
                </div>

                {/* Predição */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔮 Predição
                  </label>
                  <input
                    type="text"
                    value={betData.prediction}
                    onChange={(e) => setBetData({...betData, prediction: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-input"
                    placeholder="Ex: Over 2.5 gols"
                  />
                </div>

                {/* Confiança */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⭐ Confiança
                  </label>
                  <select
                    value={betData.confidence}
                    onChange={(e) => setBetData({...betData, confidence: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-select"
                  >
                    <option value="alta">🎯 Alta</option>
                    <option value="média">⚖️ Média</option>
                    <option value="baixa">⚠️ Baixa</option>
                  </select>
                </div>

                {/* Stake e Odds em Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 Stake (R$)
                    </label>
                    <input
                      type="number"
                      value={betData.stake}
                      onChange={(e) => setBetData({...betData, stake: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📊 Odds
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={betData.odds}
                      onChange={(e) => setBetData({...betData, odds: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-input"
                      placeholder="1.00"
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Lucro Potencial */}
                {betData.stake > 0 && betData.odds > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">💰 Lucro Potencial:</span>
                      <span className="text-lg font-bold text-green-600">
                        R$ {(betData.stake * (betData.odds - 1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Retorno: R$ {(betData.stake * betData.odds).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={addBet}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  ✅ Adicionar Aposta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBetButton;
