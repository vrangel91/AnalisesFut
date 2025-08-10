import React, { useState } from 'react';
import { FaPlus, FaBookmark } from 'react-icons/fa';

const AddBetButton = ({ prediction, onBetAdded }) => {
  // Função para extrair o texto da previsão
  const getPredictionText = (pred) => {
    if (typeof pred?.prediction === 'string') {
      return pred.prediction;
    } else if (pred?.prediction?.under_over) {
      return pred.prediction.under_over;
    } else if (pred?.prediction?.advice) {
      return pred.prediction.advice;
    } else if (pred?.recommendation) {
      return pred.recommendation;
    }
    return '';
  };

  const [showModal, setShowModal] = useState(false);
  const [betData, setBetData] = useState({
    fixture_id: prediction?.fixture?.fixture?.id || '',
    home_team: prediction?.fixture?.teams?.home?.name || '',
    away_team: prediction?.fixture?.teams?.away?.name || '',
    league_name: prediction?.fixture?.league?.name || '',
    market_type: 'Over/Under',
    prediction: getPredictionText(prediction),
    confidence: prediction?.confidence || 'alta',
    stake: 0,
    odds: 0,
    match_date: prediction?.fixture?.fixture?.date ? new Date(prediction.fixture.fixture.date).toISOString().split('T')[0] : '',
    match_time: prediction?.fixture?.fixture?.date ? new Date(prediction.fixture.fixture.date).toTimeString().split(' ')[0] : '',
    analysis_data: prediction
  });

  const addBet = async () => {
    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        if (onBetAdded) onBetAdded();
        alert('Aposta adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar aposta:', error);
      alert('Erro ao adicionar aposta');
    }
  };

  const getMarketTypeOptions = () => {
    // Verifica se prediction.prediction é uma string ou objeto
    let predictionText = '';
    
    if (typeof prediction?.prediction === 'string') {
      predictionText = prediction.prediction;
    } else if (prediction?.prediction?.under_over) {
      predictionText = prediction.prediction.under_over;
    } else if (prediction?.prediction?.advice) {
      predictionText = prediction.prediction.advice;
    } else if (prediction?.recommendation) {
      predictionText = prediction.recommendation;
    }
    
    // Garante que predictionText seja uma string
    predictionText = String(predictionText || '');
    
    if (predictionText.includes('Over') || predictionText.includes('Under')) {
      return [
        { value: 'Over/Under', label: 'Over/Under' },
        { value: 'Goals', label: 'Goals' }
      ];
    } else if (predictionText.includes('Ambos') || predictionText.includes('Não')) {
      return [
        { value: 'Both Teams Score', label: 'Both Teams Score' }
      ];
    } else {
      return [
        { value: 'Match Winner', label: 'Match Winner' },
        { value: 'Over/Under', label: 'Over/Under' },
        { value: 'Both Teams Score', label: 'Both Teams Score' },
        { value: 'Goals', label: 'Goals' }
      ];
    }
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
                  <div className="text-sm text-blue-700 font-medium">{betData.league_name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    📅 {betData.match_date} ⏰ {betData.match_time}
                  </div>
                </div>

                {/* Tipo de Mercado */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎯 Tipo de Mercado
                  </label>
                                     <select
                     value={betData.market_type}
                     onChange={(e) => setBetData({...betData, market_type: e.target.value})}
                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white text-gray-900 font-medium modal-select"
                   >
                     {getMarketTypeOptions().map(option => (
                       <option key={option.value} value={option.value}>
                         {option.label}
                       </option>
                     ))}
                   </select>
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
