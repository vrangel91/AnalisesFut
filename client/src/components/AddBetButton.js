import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaBookmark, FaCheckCircle, FaTimes } from 'react-icons/fa';

const AddBetButton = ({ prediction, onBetAdded, h2hData }) => {
  // Adicionar estilos CSS para animação
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState({});
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

    // Função para determinar o tipo de mercado baseado na predição
    const determineMarketType = (pred) => {
      console.log('🔍 determineMarketType - Analisando predição:', pred);
      
      // PRIORIDADE 1: Verificar se há predição de gols na prediction (mais confiável)
      if (pred?.prediction?.under_over) {
        console.log('✅ Tipo determinado por under_over:', pred.prediction.under_over);
        return 'Over/Under Gols';
      }
      
      // PRIORIDADE 2: Verificar se há dados H2H de corner kicks
      if (h2hData?.h2hAnalysis?.recommendations && 
          h2hData.h2hAnalysis.recommendations.some(rec => rec.market.includes('corner'))) {
        console.log('✅ Tipo determinado por H2H corner kicks');
        return 'Corner Kicks';
      }
      
      // PRIORIDADE 3: Verificar se há dados H2H na própria prediction
      if (pred?.h2hAnalysis?.recommendations && 
          pred.h2hAnalysis.recommendations.some(rec => rec.market.includes('corner'))) {
        console.log('✅ Tipo determinado por prediction H2H corner kicks');
        return 'Corner Kicks';
      }
      
      // PRIORIDADE 4: Analisar texto da predição
      const predText = getPredictionText(pred).toLowerCase();
      console.log('🔍 Analisando texto da predição:', predText);
      
      // Verificar se é corner kicks
      if (predText.includes('corner') || predText.includes('escanteio')) {
        console.log('✅ Tipo determinado por texto (corner)');
        return 'Corner Kicks';
      }
      
      // Verificar se é over/under gols
      if (predText.includes('over') || predText.includes('under') || predText.includes('acima') || predText.includes('abaixo')) {
        console.log('✅ Tipo determinado por texto (over/under)');
        return 'Over/Under Gols';
      }
      
      // Verificar se é both teams score
      if (predText.includes('ambos') || predText.includes('both')) {
        console.log('✅ Tipo determinado por texto (both teams)');
        return 'Both Teams Score';
      }
      
      // Verificar se é match winner
      if (predText.includes('vencedor') || predText.includes('winner')) {
        console.log('✅ Tipo determinado por texto (winner)');
        return 'Match Winner';
      }
      
      // Verificar se há predição de gols no advice
      if (pred?.prediction?.advice && (pred.prediction.advice.includes('Over') || pred.prediction.advice.includes('Under'))) {
        console.log('✅ Tipo determinado por advice (over/under)');
        return 'Over/Under Gols';
      }
      
      // Padrão: Corner Kicks
      console.log('⚠️ Usando padrão: Corner Kicks');
      return 'Corner Kicks';
    };

    const initialMarketType = determineMarketType(prediction);

    return {
      fixture_id: fixtureId,
      home_team: teamNames.home,
      away_team: teamNames.away,
      league_name: leagueName,
      market_type: initialMarketType,
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
    console.log('🔍 AddBetButton - Market Type sendo enviado:', betData.market_type);
    console.log('🔍 AddBetButton - Prediction object:', prediction);
    console.log('🔍 AddBetButton - League name:', prediction?.fixture?.league?.name);
    console.log('🔍 AddBetButton - Fixture ID extraído:', betData.fixture_id);
    console.log('🔍 AddBetButton - H2H Data disponível:', !!h2hData);
    console.log('🔍 AddBetButton - Prediction under_over:', prediction?.prediction?.under_over);
    
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
         
         // Mostrar mensagem de sucesso profissional
         setSuccessData({
           id: data.data?.id,
           homeTeam: betData.home_team,
           awayTeam: betData.away_team,
           prediction: betData.prediction,
           stake: betData.stake,
           odds: betData.odds,
           potentialProfit: (betData.stake * (betData.odds - 1)).toFixed(2)
         });
         setShowSuccessMessage(true);
         
         // Auto-hide após 5 segundos
         setTimeout(() => {
           setShowSuccessMessage(false);
         }, 5000);
         
         if (onBetAdded) onBetAdded();
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
      options.push({ value: 'Corner Kicks', label: '🔄 Corner Kicks' });
      console.log('✅ Corner Kicks adicionado às opções');
    } else {
      console.log('❌ Corner Kicks não encontrado:', {
        h2hDataRecommendations: h2hData?.h2hAnalysis?.recommendations,
        predictionH2HRecommendations: prediction?.h2hAnalysis?.recommendations
      });
    }
    
    // Verificar se há previsão de gols (Over/Under)
    if (prediction?.prediction?.under_over || 
        (prediction?.prediction?.advice && (prediction.prediction.advice.includes('Over') || prediction.prediction.advice.includes('Under')))) {
      options.push({ value: 'Over/Under Gols', label: '⚽ Over/Under Gols' });
    }
    
    // Verificar se há previsão de ambos marcam
    if (prediction?.prediction?.advice && prediction.prediction.advice.includes('Ambos')) {
      options.push({ value: 'Both Teams Score', label: '🎯 Both Teams Score' });
    }
    
    // Verificar se há previsão de vencedor
    if (prediction?.prediction?.winner?.name) {
      options.push({ value: 'Match Winner', label: '🏆 Match Winner' });
    }
    
    // Se não houver nenhuma opção específica, mostrar todas
    if (options.length === 0) {
      options.push(
        { value: 'Corner Kicks', label: '🔄 Corner Kicks' },
        { value: 'Over/Under Gols', label: '⚽ Over/Under Gols' },
        { value: 'Both Teams Score', label: '🎯 Both Teams Score' },
        { value: 'Match Winner', label: '🏆 Match Winner' }
      );
    }
    
    console.log('🎯 Opções finais:', options);
    return options;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transform hover:scale-105"
        title="Adicionar às Minhas Apostas"
      >
        <FaBookmark className="text-xs" />
        Adicionar
      </button>

             {/* Modal */}
       {showModal && createPortal(
         <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                       <div className="relative mx-auto w-full max-w-md max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
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
            
                         <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400" style={{
               scrollbarWidth: 'thin',
               scrollbarColor: '#d1d5db #f3f4f6'
             }}>
               <div className="space-y-4">
                                 {/* Informações do Jogo */}
                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
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
                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-purple-600 text-lg">🧠</span>
                      <h4 className="text-sm font-semibold text-purple-800">Previsões Inteligentes (Alta Confiança)</h4>
                    </div>
                                         <div className="space-y-2">
                       {intelligentPredictions.map((pred, index) => (
                         <div key={index} className="bg-white p-2 rounded-lg border border-purple-200">
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
                        console.log('🔄 Mudança de mercado para:', selectedMarket);
                        
                        // Preencher automaticamente a predição baseada no tipo de mercado selecionado
                        let autoPrediction = '';
                        
                        if (selectedMarket === 'Corner Kicks') {
                          // Buscar previsão de corner kicks (H2H) - PRIORIDADE ALTA
                          if (h2hData?.h2hAnalysis?.recommendations) {
                            const cornerPrediction = h2hData.h2hAnalysis.recommendations.find(rec => 
                              rec.market.includes('corner') && rec.confidence === 'alta'
                            );
                            if (cornerPrediction) {
                              autoPrediction = cornerPrediction.market;
                              console.log('✅ Corner prediction encontrada:', autoPrediction);
                            }
                          }
                          // Fallback: verificar na própria prediction
                          if (!autoPrediction && prediction?.h2hAnalysis?.recommendations) {
                            const cornerPrediction = prediction.h2hAnalysis.recommendations.find(rec => 
                              rec.market.includes('corner') && rec.confidence === 'alta'
                            );
                            if (cornerPrediction) {
                              autoPrediction = cornerPrediction.market;
                              console.log('✅ Corner prediction fallback:', autoPrediction);
                            }
                          }
                        } else if (selectedMarket === 'Over/Under Gols') {
                          // Buscar previsão de gols - PRIORIDADE ALTA
                          if (prediction?.prediction?.under_over) {
                            autoPrediction = prediction.prediction.under_over;
                            console.log('✅ Over/Under prediction encontrada:', autoPrediction);
                          } else if (prediction?.prediction?.advice && (prediction.prediction.advice.includes('Over') || prediction.prediction.advice.includes('Under'))) {
                            autoPrediction = prediction.prediction.advice;
                            console.log('✅ Over/Under prediction fallback:', autoPrediction);
                          }
                        } else if (selectedMarket === 'Both Teams Score') {
                          // Buscar previsão de ambos marcam
                          if (prediction?.prediction?.advice && prediction.prediction.advice.includes('Ambos')) {
                            autoPrediction = prediction.prediction.advice;
                            console.log('✅ Both Teams prediction:', autoPrediction);
                          }
                        } else if (selectedMarket === 'Match Winner') {
                          // Buscar previsão de vencedor
                          if (prediction?.prediction?.winner?.name) {
                            autoPrediction = `${prediction.prediction.winner.name} (Vencedor)`;
                            console.log('✅ Match Winner prediction:', autoPrediction);
                          }
                        }
                        
                        console.log('🎯 Auto-prediction final:', autoPrediction);
                       
                       setBetData({
                         ...betData, 
                         market_type: selectedMarket,
                         prediction: autoPrediction || betData.prediction
                       });
                     }}
                     className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-select"
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
                     className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-input"
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
                     className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-select"
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
                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-input"
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
                       value={betData.odds}
                       onChange={(e) => setBetData({...betData, odds: parseFloat(e.target.value) || 0})}
                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-input"
                       placeholder="1.00"
                       min="1"
                       step="0.01"
                     />
                  </div>
                </div>

                                 {/* Lucro Potencial */}
                 {betData.stake > 0 && betData.odds > 0 && (
                   <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
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
               <div className="flex gap-3 mt-6">
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
                 </div>,
         document.body
       )}

       {/* Mensagem de Sucesso Profissional */}
       {showSuccessMessage && createPortal(
         <div className="fixed top-4 right-4 z-[10000]" style={{
           animation: 'slideInRight 0.5s ease-out'
         }}>
           <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl border border-green-400 max-w-md overflow-hidden">
             {/* Header */}
             <div className="flex items-center justify-between p-4 bg-green-600">
               <div className="flex items-center gap-3">
                 <FaCheckCircle className="text-2xl text-green-200 animate-pulse" />
                 <div>
                   <h4 className="font-bold text-lg">✅ Aposta Adicionada!</h4>
                   <p className="text-green-100 text-sm">ID: #{successData.id}</p>
                 </div>
               </div>
               <button
                 onClick={() => setShowSuccessMessage(false)}
                 className="text-green-200 hover:text-white transition-colors"
               >
                 <FaTimes className="text-lg" />
               </button>
             </div>
             
             {/* Content */}
             <div className="p-4">
               {/* Jogo */}
               <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-3">
                 <div className="text-center">
                   <div className="font-bold text-lg mb-1">
                     {successData.homeTeam} vs {successData.awayTeam}
                   </div>
                   <div className="text-green-100 text-sm">
                     {successData.prediction}
                   </div>
                 </div>
               </div>
               
               {/* Detalhes da Aposta */}
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="bg-white bg-opacity-10 rounded-lg p-2 text-center">
                   <div className="text-xs text-green-200">Stake</div>
                   <div className="font-bold">R$ {successData.stake}</div>
                 </div>
                 <div className="bg-white bg-opacity-10 rounded-lg p-2 text-center">
                   <div className="text-xs text-green-200">Odds</div>
                   <div className="font-bold">{successData.odds}</div>
                 </div>
               </div>
               
               {/* Lucro Potencial */}
               <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3 text-center">
                 <div className="text-xs text-yellow-100 mb-1">💰 Lucro Potencial</div>
                 <div className="font-bold text-xl">R$ {successData.potentialProfit}</div>
               </div>
               
               {/* Footer */}
               <div className="mt-3 text-center">
                 <p className="text-green-100 text-xs">
                   Aposta registrada com sucesso! Boa sorte! 🍀
                 </p>
               </div>
             </div>
           </div>
         </div>,
         document.body
       )}
     </>
   );
 };

export default AddBetButton;
