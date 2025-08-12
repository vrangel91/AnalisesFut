import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApiPredictionsModal.scss';

const ApiPredictionsModal = ({ fixture, isOpen, onClose }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    if (isOpen && fixture) {
      loadPredictions();
    }
  }, [isOpen, fixture, forceRefresh]);

  const loadPredictions = async () => {
    // Verificar diferentes estruturas possíveis de fixture
    let fixtureId = null;
    
    if (fixture?.fixture?.id) {
      // Estrutura: { fixture: { id: 123 } }
      fixtureId = fixture.fixture.id;
    } else if (fixture?.id) {
      // Estrutura: { id: 123 }
      fixtureId = fixture.id;
    } else {
      setError('Fixture ID não encontrado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = forceRefresh
        ? `/api/api-predictions/${fixtureId}?refresh=true`
        : `/api/api-predictions/${fixtureId}`;

      const response = await axios.get(url);

      if (response.data.success) {
        setPredictions(response.data.data);
      } else {
        setError(response.data.error || 'Erro ao carregar predições');
      }
    } catch (error) {
      console.error('Erro ao carregar predições da API:', error);
      setError(error.response?.data?.error || 'Erro ao carregar predições');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setForceRefresh(true);
    setPredictions(null);
    setError(null);
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'alta': return 'text-green-600';
      case 'média': return 'text-yellow-600';
      case 'baixa': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'baixo': return 'text-green-600';
      case 'médio': return 'text-yellow-600';
      case 'alto': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatPercentage = (percent) => {
    if (!percent) return '0%';
    return typeof percent === 'string' ? percent : `${percent}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="api-predictions-modal-overlay">
      <div className="api-predictions-modal">
        <div className="api-predictions-modal-header">
          <h2>🔮 Predições API-Sports</h2>
          <div className="api-predictions-modal-actions">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="refresh-button"
            >
              🔄 Atualizar
            </button>
            <button onClick={onClose} className="close-button">
              ✕
            </button>
          </div>
        </div>

        <div className="api-predictions-modal-content">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando predições...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">❌ {error}</p>
              <button onClick={loadPredictions} className="retry-button">
                Tentar Novamente
              </button>
            </div>
          )}

          {predictions && !loading && (
            <div className="predictions-content">
              {/* Informações da Liga */}
              <div className="league-info">
                <img src={predictions.league?.logo} alt={predictions.league?.name} />
                <div>
                  <h3>{predictions.league?.name}</h3>
                  <p>{predictions.league?.country} - {predictions.league?.season}</p>
                </div>
              </div>

              {/* Times */}
              <div className="teams-section">
                <div className="team home-team">
                  <img src={predictions.teams?.home?.logo} alt={predictions.teams?.home?.name} />
                  <h4>{predictions.teams?.home?.name}</h4>
                </div>
                <div className="vs">VS</div>
                <div className="team away-team">
                  <img src={predictions.teams?.away?.logo} alt={predictions.teams?.away?.name} />
                  <h4>{predictions.teams?.away?.name}</h4>
                </div>
              </div>

              {/* Predições Principais */}
              <div className="main-predictions">
                <h3>🎯 Predições Principais</h3>
                
                <div className="prediction-grid">
                  {/* Vencedor */}
                  {predictions.predictions?.winner && (
                    <div className="prediction-card">
                      <h4>🏆 Vencedor Previsto</h4>
                      <div className="winner-info">
                        <img src={predictions.predictions.winner.id === predictions.teams.home.id 
                          ? predictions.teams.home.logo 
                          : predictions.teams.away.logo} 
                          alt="Winner" />
                        <span>{predictions.predictions.winner.name}</span>
                      </div>
                      <p className="comment">{predictions.predictions.winner.comment}</p>
                    </div>
                  )}

                  {/* Percentuais */}
                  {predictions.predictions?.percent && (
                    <div className="prediction-card">
                      <h4>📊 Probabilidades</h4>
                      <div className="percentages">
                        <div className="percentage-item">
                          <span className="team-name">Casa</span>
                          <span className="percentage">{formatPercentage(predictions.predictions.percent.home)}</span>
                        </div>
                        <div className="percentage-item">
                          <span className="team-name">Empate</span>
                          <span className="percentage">{formatPercentage(predictions.predictions.percent.draw)}</span>
                        </div>
                        <div className="percentage-item">
                          <span className="team-name">Visitante</span>
                          <span className="percentage">{formatPercentage(predictions.predictions.percent.away)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Under/Over */}
                  {predictions.predictions?.underOver && (
                    <div className="prediction-card">
                      <h4>⚽ Total de Gols</h4>
                      <div className="under-over">
                        <span className="value">{predictions.predictions.underOver}</span>
                        <span className="description">
                          {predictions.predictions.underOver.startsWith('-') 
                            ? `Menos de ${predictions.predictions.underOver.substring(1)} gols`
                            : `Mais de ${predictions.predictions.underOver.substring(1)} gols`
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Gols por Time */}
                  {predictions.predictions?.goals && (
                    <div className="prediction-card">
                      <h4>🎯 Gols por Time</h4>
                      <div className="goals-prediction">
                        <div className="goal-item">
                          <span>Casa: {predictions.predictions.goals.home}</span>
                        </div>
                        <div className="goal-item">
                          <span>Visitante: {predictions.predictions.goals.away}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conselho */}
                {predictions.predictions?.advice && (
                  <div className="advice-section">
                    <h4>💡 Conselho da API</h4>
                    <p className="advice">{predictions.predictions.advice}</p>
                  </div>
                )}
              </div>

              {/* Análise */}
              {predictions.analysis && (
                <div className="analysis-section">
                  <h3>📈 Análise Detalhada</h3>
                  
                  <div className="analysis-grid">
                    <div className="analysis-card">
                      <h4>Confiança</h4>
                      <span className={`confidence ${getConfidenceColor(predictions.analysis.confidence)}`}>
                        {predictions.analysis.confidence}
                      </span>
                    </div>
                    
                    <div className="analysis-card">
                      <h4>Nível de Risco</h4>
                      <span className={`risk ${getRiskColor(predictions.analysis.riskLevel)}`}>
                        {predictions.analysis.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Insights */}
                  {predictions.analysis.keyInsights && predictions.analysis.keyInsights.length > 0 && (
                    <div className="insights-section">
                      <h4>🔍 Insights Principais</h4>
                      <ul className="insights-list">
                        {predictions.analysis.keyInsights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recomendações */}
                  {predictions.analysis.recommendedBets && predictions.analysis.recommendedBets.length > 0 && (
                    <div className="recommendations-section">
                      <h4>💰 Recomendações de Apostas</h4>
                      <ul className="recommendations-list">
                        {predictions.analysis.recommendedBets.map((bet, index) => (
                          <li key={index}>{bet}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Comparação */}
              {predictions.comparison && (
                <div className="comparison-section">
                  <h3>⚖️ Comparação entre Times</h3>
                  
                  <div className="comparison-grid">
                    {Object.entries(predictions.comparison).map(([key, value]) => (
                      <div key={key} className="comparison-item">
                        <h4>{key === 'att' ? 'Ataque' : 
                             key === 'def' ? 'Defesa' : 
                             key === 'poisson_distribution' ? 'Distribuição Poisson' :
                             key === 'h2h' ? 'Histórico H2H' :
                             key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                        <div className="comparison-values">
                          <span className="home-value">{formatPercentage(value.home)}</span>
                          <span className="vs">vs</span>
                          <span className="away-value">{formatPercentage(value.away)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico H2H */}
              {predictions.h2h && predictions.h2h.length > 0 && (
                <div className="h2h-section">
                  <h3>📜 Histórico H2H ({predictions.h2h.length} jogos)</h3>
                  
                  <div className="h2h-list">
                    {predictions.h2h.slice(0, 5).map((match, index) => (
                      <div key={index} className="h2h-match">
                        <div className="match-date">
                          {new Date(match.fixture.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="match-teams">
                          <span className={`team ${match.teams.home.winner ? 'winner' : ''}`}>
                            {match.teams.home.name}
                          </span>
                          <span className="score">
                            {match.goals.home} - {match.goals.away}
                          </span>
                          <span className={`team ${match.teams.away.winner ? 'winner' : ''}`}>
                            {match.teams.away.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiPredictionsModal;
