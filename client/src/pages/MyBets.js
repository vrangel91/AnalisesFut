import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaChartLine,
  FaTrash,
  FaEye,
  FaSync,
  FaDollarSign,
  FaTrophy,
  FaChartBar
} from 'react-icons/fa';
import './MyBets.scss';

const MyBets = () => {
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [betToDelete, setBetToDelete] = useState(null);
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingResults, setIsCheckingResults] = useState(false);
  const [checkResultsMessage, setCheckResultsMessage] = useState('');

  // Estados para nova aposta
  const [newBet, setNewBet] = useState({
    fixture_id: '',
    home_team: '',
    away_team: '',
    league_name: '',
    market_type: 'Corner Kicks',
    prediction: '',
    confidence: 'alta',
    stake: 0,
    odds: 0,
    match_date: '',
    match_time: ''
  });

  useEffect(() => {
    fetchBets();
    fetchStats();
  }, []);

  const fetchBets = async () => {
    try {
      const response = await fetch('/api/bets');
      const data = await response.json();
      if (data.success) {
        setBets(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar apostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/bets/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const addBet = async () => {
    // Validação dos campos obrigatórios
    if (!newBet.home_team || !newBet.away_team || !newBet.league_name || 
        !newBet.prediction || !newBet.stake || !newBet.odds) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // Validação de valores numéricos
    if (newBet.stake <= 0 || newBet.odds <= 1) {
      alert('Stake deve ser maior que 0 e Odds deve ser maior que 1!');
      return;
    }

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBet),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setNewBet({
          fixture_id: '',
          home_team: '',
          away_team: '',
          league_name: '',
          market_type: 'Corner Kicks',
          prediction: '',
          confidence: 'alta',
          stake: 0,
          odds: 0,
          match_date: '',
          match_time: ''
        });
        fetchBets();
        fetchStats();
        alert('Aposta adicionada com sucesso!');
      } else {
        alert('Erro ao adicionar aposta: ' + (data.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao adicionar aposta:', error);
      alert('Erro ao adicionar aposta. Tente novamente.');
    }
  };

  const deleteBet = async (betId) => {
    // Encontrar a aposta para mostrar os detalhes no modal
    const bet = bets.find(b => b.id === betId);
    setBetToDelete(bet);
    setShowDeleteModal(true);
    setDeleteCountdown(0);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!betToDelete || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/bets/${betToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        // Simular um pequeno delay para feedback visual
        setTimeout(() => {
          fetchBets();
          fetchStats();
          setShowDeleteModal(false);
          setBetToDelete(null);
          setIsDeleting(false);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao deletar aposta:', error);
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBetToDelete(null);
    setDeleteCountdown(0);
    setIsDeleting(false);
  };

  // Função para iniciar contador regressivo (opcional)
  const startDeleteCountdown = () => {
    setDeleteCountdown(3);
    const interval = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkResults = async () => {
    try {
      console.log('🔄 Iniciando verificação de resultados...');
      setIsCheckingResults(true);
      setCheckResultsMessage('Iniciando verificação...');
      
      const response = await fetch('/api/bets/check-results', {
        method: 'POST',
      });
      
      console.log('📡 Resposta da API:', response.status, response.statusText);
      setCheckResultsMessage('Processando resposta...');
      
      const data = await response.json();
      console.log('📊 Dados da resposta:', data);
      
      if (data.success) {
        console.log('✅ Verificação concluída com sucesso');
        setCheckResultsMessage('Atualizando dados...');
        await fetchBets();
        await fetchStats();
        setCheckResultsMessage('Verificação concluída com sucesso!');
        setTimeout(() => setCheckResultsMessage(''), 3000);
        alert(`Verificação de resultados concluída! ${data.message || ''}`);
      } else {
        console.error('❌ Erro na verificação:', data.error || data.message);
        setCheckResultsMessage(`Erro: ${data.error || data.message || 'Erro desconhecido'}`);
        setTimeout(() => setCheckResultsMessage(''), 5000);
        alert(`Erro na verificação: ${data.error || data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('💥 Erro ao verificar resultados:', error);
      setCheckResultsMessage(`Erro: ${error.message}`);
      setTimeout(() => setCheckResultsMessage(''), 5000);
      alert(`Erro ao verificar resultados: ${error.message}`);
    } finally {
      setIsCheckingResults(false);
    }
  };

  const filteredBets = bets.filter(bet => {
    if (filterStatus === 'all') return true;
    return bet.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="my-bets">
        <div className="loading">
          <div className="spinner"></div>
          <p className="loading-text">Carregando suas apostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bets">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="title-section">
              <h1>
                <FaTrophy className="icon" />
                Minhas Apostas
              </h1>
              <p>Gerencie e acompanhe suas apostas com IA</p>
            </div>
            <div className="actions">
              <button
                onClick={checkResults}
                className="btn btn-primary"
                disabled={isCheckingResults}
              >
                {isCheckingResults ? (
                  <>
                    <div className="spinner-small"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <FaSync />
                    Verificar Resultados
                  </>
                )}
              </button>
              {checkResultsMessage && (
                <div className="check-results-message">
                  {checkResultsMessage}
                </div>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-success"
              >
                <FaPlus />
                Adicionar Aposta
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="icon-wrapper blue">
                  <FaChartBar />
                </div>
                <div className="stat-info">
                  <h3>Total de Apostas</h3>
                  <p className="value neutral">{stats.stats?.total_bets || 0}</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="icon-wrapper green">
                  <FaCheckCircle />
                </div>
                <div className="stat-info">
                  <h3>Taxa de Acerto</h3>
                  <p className="value neutral">
                    {stats.stats?.win_rate ? `${stats.stats.win_rate.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="icon-wrapper purple">
                  <FaDollarSign />
                </div>
                <div className="stat-info">
                  <h3>ROI</h3>
                  <p className="value neutral">
                    {stats.stats?.roi ? `${stats.stats.roi.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="icon-wrapper yellow">
                  <FaChartLine />
                </div>
                <div className="stat-info">
                  <h3>Lucro Total</h3>
                  <p className={`value ${stats.stats?.total_profit_loss >= 0 ? 'positive' : 'negative'}`}>
                    R$ {stats.stats?.total_profit_loss ? stats.stats.total_profit_loss.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="filters">
          <div className="filter-buttons">
            <button
              onClick={() => setFilterStatus('all')}
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            >
              Todas ({bets.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`filter-btn pending ${filterStatus === 'pending' ? 'active' : ''}`}
            >
              Pendentes ({bets.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('green')}
              className={`filter-btn green ${filterStatus === 'green' ? 'active' : ''}`}
            >
              Green ({bets.filter(b => b.status === 'green').length})
            </button>
            <button
              onClick={() => setFilterStatus('loss')}
              className={`filter-btn loss ${filterStatus === 'loss' ? 'active' : ''}`}
            >
              Loss ({bets.filter(b => b.status === 'loss').length})
            </button>
          </div>
        </div>

        {/* Lista de Apostas */}
        <div className="bets-table">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Mercado</th>
                  <th>Aposta</th>
                  <th>Stake</th>
                  <th>Status</th>
                  <th>Resultado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBets.map((bet) => (
                  <tr key={bet.id}>
                    <td>
                      <div className="match-info">
                        <div className="teams">
                          {bet.home_team} vs {bet.away_team}
                        </div>
                        <div className="league">{bet.league_name}</div>
                        <div className="date">
                          {bet.match_date} {bet.match_time}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="market-badge">
                        {bet.market_type}
                      </span>
                    </td>
                    <td>
                      <div className="bet-info">
                        <div className="prediction">{bet.prediction}</div>
                        <span className={`confidence ${bet.confidence}`}>
                          {bet.confidence}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="stake-info">
                        <div className="amount">R$ {bet.stake}</div>
                        <div className="odds">Odds: {bet.odds}</div>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-badge ${bet.status}`}>
                          {bet.status === 'green' ? 'Green' : bet.status === 'loss' ? 'Loss' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {bet.actual_result ? (
                        <div className="result-info">
                          <div className="actual-result">{bet.actual_result}</div>
                          <div className={`profit-loss ${bet.profit_loss >= 0 ? 'positive' : 'negative'}`}>
                            R$ {bet.profit_loss.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() => setSelectedBet(bet)}
                          className="action-btn view"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteBet(bet.id)}
                          className="action-btn delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Adicionar Aposta */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Adicionar Nova Aposta</h3>
              <p className="text-sm text-gray-600 mb-4">* Campos obrigatórios</p>
              <div className="form-group">
                <label>Time Casa *</label>
                <input
                  type="text"
                  value={newBet.home_team}
                  onChange={(e) => setNewBet({...newBet, home_team: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Visitante *</label>
                <input
                  type="text"
                  value={newBet.away_team}
                  onChange={(e) => setNewBet({...newBet, away_team: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Liga *</label>
                <input
                  type="text"
                  value={newBet.league_name}
                  onChange={(e) => setNewBet({...newBet, league_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo de Mercado</label>
                <select
                  value={newBet.market_type}
                  onChange={(e) => setNewBet({...newBet, market_type: e.target.value})}
                >
                  <option value="Corner Kicks">🔄 Corner Kicks</option>
                  <option value="Over/Under Gols">⚽ Over/Under Gols</option>
                  <option value="Both Teams Score">🎯 Both Teams Score</option>
                  <option value="Match Winner">🏆 Match Winner</option>
                </select>
              </div>
              <div className="form-group">
                <label>Predição *</label>
                <input
                  type="text"
                  value={newBet.prediction}
                  onChange={(e) => setNewBet({...newBet, prediction: e.target.value})}
                  placeholder="Ex: Over 6.5 corner kicks"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confiança</label>
                <select
                  value={newBet.confidence}
                  onChange={(e) => setNewBet({...newBet, confidence: e.target.value})}
                >
                  <option value="alta">Alta</option>
                  <option value="média">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
              <div className="form-group">
                <label>Stake (R$) *</label>
                <input
                  type="number"
                  value={newBet.stake}
                  onChange={(e) => setNewBet({...newBet, stake: parseFloat(e.target.value) || 0})}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Odds *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBet.odds}
                  onChange={(e) => setNewBet({...newBet, odds: parseFloat(e.target.value) || 0})}
                  min="1.01"
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={addBet}
                  className="btn btn-primary"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalhes da Aposta */}
        {selectedBet && (
          <div className="modal-overlay">
            <div className="modal bet-details-modal">
              <div className="modal-header">
                <div className="header-icon">
                  <FaEye className="eye-icon" />
                </div>
                <h3>Detalhes da Aposta</h3>
                <p className="subtitle">Informações completas da sua aposta</p>
              </div>
              
              <div className="modal-body">
                <div className="bet-details-grid">
                  {/* Seção: Informações do Jogo */}
                  <div className="detail-section">
                    <div className="section-title">
                      <FaTrophy className="section-icon" />
                      Informações do Jogo
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Times:</span>
                      <span className="detail-value highlight">
                        {selectedBet.home_team} vs {selectedBet.away_team}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Liga:</span>
                      <span className="detail-value highlight">{selectedBet.league_name}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Data:</span>
                      <span className="detail-value">{selectedBet.match_date}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Hora:</span>
                      <span className="detail-value">{selectedBet.match_time}</span>
                    </div>
                  </div>

                  {/* Seção: Detalhes da Aposta */}
                  <div className="detail-section">
                    <div className="section-title">
                      <FaChartLine className="section-icon" />
                      Detalhes da Aposta
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Mercado:</span>
                      <span className="detail-value">
                        <span className="market-badge">{selectedBet.market_type}</span>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Predição:</span>
                      <span className="detail-value">
                        <span className="prediction-badge">{selectedBet.prediction}</span>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Confiança:</span>
                      <span className="detail-value">
                        <span className={`confidence-badge ${selectedBet.confidence}`}>
                          {selectedBet.confidence}
                        </span>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        <span className={`status-badge ${selectedBet.status}`}>
                          {selectedBet.status === 'green' ? 'Green' : selectedBet.status === 'loss' ? 'Loss' : 'Pendente'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Seção: Dados de Análise (se disponível) */}
                  {selectedBet.analysis_data && (
                    <div className="detail-section">
                      <div className="section-title">
                        <FaChartBar className="section-icon" />
                        Dados de Análise
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Fonte:</span>
                        <span className="detail-value">
                          {selectedBet.analysis_data.fixture?.league?.name ? 'API-SPORTS' : 'Manual'}
                        </span>
                      </div>
                      
                      {selectedBet.analysis_data.prediction?.winner && (
                        <div className="detail-row">
                          <span className="detail-label">Vencedor Previsto:</span>
                          <span className="detail-value highlight">
                            {selectedBet.analysis_data.prediction.winner.name}
                          </span>
                        </div>
                      )}
                      
                      {selectedBet.analysis_data.prediction?.under_over && (
                        <div className="detail-row">
                          <span className="detail-label">Previsão de Gols:</span>
                          <span className="detail-value highlight">
                            {selectedBet.analysis_data.prediction.under_over}
                          </span>
                        </div>
                      )}
                      
                      {selectedBet.analysis_data.prediction?.advice && (
                        <div className="detail-row">
                          <span className="detail-label">Recomendação:</span>
                          <span className="detail-value">
                            {selectedBet.analysis_data.prediction.advice}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Seção: Informações Financeiras */}
                  <div className="detail-section financial-section">
                    <div className="section-title">
                      <FaDollarSign className="section-icon" />
                      Informações Financeiras
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Stake:</span>
                      <span className="detail-value stake-amount">R$ {selectedBet.stake}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Odds:</span>
                      <span className="detail-value odds-value">{selectedBet.odds}</span>
                    </div>
                    
                    {selectedBet.profit_loss !== null && (
                      <div className="detail-row">
                        <span className="detail-label">P&L:</span>
                        <span className={`detail-value profit-loss ${selectedBet.profit_loss >= 0 ? 'positive' : 'negative'}`}>
                          R$ {selectedBet.profit_loss.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Seção: Resultado (se disponível) */}
                  {selectedBet.actual_result && (
                    <div className="detail-section result-section">
                      <div className="section-title">
                        <FaCheckCircle className="section-icon" />
                        Resultado
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Resultado Real:</span>
                        <span className="detail-value highlight">{selectedBet.actual_result}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => setSelectedBet(null)}
                  className="btn btn-secondary close-btn"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmar Deleção */}
        {showDeleteModal && betToDelete && (
          <div className="modal-overlay">
            <div className="modal delete-confirmation-modal">
              <div className="modal-header">
                <div className="header-icon">
                  <FaTrash className="trash-icon" />
                </div>
                <h3>Confirmar Exclusão</h3>
                <p className="warning-text">Esta ação não pode ser desfeita</p>
              </div>
              
              <div className="modal-body">
                <div className="bet-summary">
                  <div className="summary-header">
                    <span className="summary-label">Resumo da Aposta:</span>
                  </div>
                  
                  <div className="bet-details">
                    <div className="detail-row">
                      <span className="detail-label">Jogo:</span>
                      <span className="detail-value">
                        <strong>{betToDelete.home_team}</strong> vs <strong>{betToDelete.away_team}</strong>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Liga:</span>
                      <span className="detail-value">{betToDelete.league_name}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Mercado:</span>
                      <span className="detail-value">
                        <span className="market-badge">{betToDelete.market_type}</span>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Predição:</span>
                      <span className="detail-value">
                        <span className="prediction-badge">{betToDelete.prediction}</span>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Stake:</span>
                      <span className="detail-value">
                        <span className="stake-amount">R$ {betToDelete.stake}</span>
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        <span className={`status-badge ${betToDelete.status}`}>
                          {betToDelete.status === 'green' ? 'Green' : betToDelete.status === 'loss' ? 'Loss' : 'Pendente'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="confirmation-message">
                  <div className="warning-box">
                    <FaTimesCircle className="warning-icon" />
                    <div className="warning-content">
                      <strong>Atenção!</strong>
                      <p>Esta aposta será permanentemente removida do sistema. 
                      Se ela tiver resultado pendente, você perderá o histórico.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={cancelDelete}
                  className="btn btn-secondary cancel-btn"
                  disabled={isDeleting}
                >
                  <FaEye />
                  {isDeleting ? 'Cancelando...' : 'Cancelar'}
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-danger confirm-btn"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="spinner-small"></div>
                      Deletando...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Sim, Deletar!
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;
