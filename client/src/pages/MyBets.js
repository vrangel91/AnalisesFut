import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaChartLine,
  FaTrash,
  FaEye,
  FaFilter,
  FaDownload,
  FaSync,
  FaDollarSign,
  FaTrophy,
  FaChartBar,
  FaCalendarAlt,
  FaFutbol
} from 'react-icons/fa';
import './MyBets.scss';

const MyBets = () => {
  const [bets, setBets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Estados para nova aposta
  const [newBet, setNewBet] = useState({
    fixture_id: '',
    home_team: '',
    away_team: '',
    league_name: '',
    market_type: 'Over/Under',
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
          market_type: 'Over/Under',
          prediction: '',
          confidence: 'alta',
          stake: 0,
          odds: 0,
          match_date: '',
          match_time: ''
        });
        fetchBets();
        fetchStats();
      }
    } catch (error) {
      console.error('Erro ao adicionar aposta:', error);
    }
  };

  const deleteBet = async (betId) => {
    if (window.confirm('Tem certeza que deseja deletar esta aposta?')) {
      try {
        const response = await fetch(`/api/bets/${betId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        if (data.success) {
          fetchBets();
          fetchStats();
        }
      } catch (error) {
        console.error('Erro ao deletar aposta:', error);
      }
    }
  };

  const checkResults = async () => {
    try {
      const response = await fetch('/api/bets/check-results', {
        method: 'POST',
      });
      
      const data = await response.json();
      if (data.success) {
        fetchBets();
        fetchStats();
        alert('Verificação de resultados concluída!');
      }
    } catch (error) {
      console.error('Erro ao verificar resultados:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green': return <FaCheckCircle />;
      case 'loss': return <FaTimesCircle />;
      case 'pending': return <FaClock />;
      default: return <FaClock />;
    }
  };

  const filteredBets = bets.filter(bet => {
    if (filterStatus === 'all') return true;
    return bet.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando suas apostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bets-container">
      <div className="my-bets-content">
        {/* Header */}
        <div className="my-bets-header">
          <div className="header-content">
            <div className="header-title">
              <h1>
                <FaTrophy className="trophy-icon" />
                Minhas Apostas
              </h1>
              <p>
                Gerencie e acompanhe suas apostas com IA
              </p>
            </div>
            <div className="header-actions">
              <button
                onClick={checkResults}
                className="btn-check-results"
              >
                <FaSync />
                Verificar Resultados
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-add-bet"
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
                <div className="stat-icon blue">
                  <FaChartBar />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Total de Apostas</p>
                  <p className="stat-value">{stats.stats?.total_bets || 0}</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon green">
                  <FaCheckCircle />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Taxa de Acerto</p>
                  <p className="stat-value">
                    {stats.stats?.win_rate ? `${stats.stats.win_rate.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon gold">
                  <FaDollarSign />
                </div>
                <div className="stat-info">
                  <p className="stat-label">ROI</p>
                  <p className="stat-value">
                    {stats.stats?.roi ? `${stats.stats.roi.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon info">
                  <FaChartLine />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Lucro Total</p>
                  <p className={`stat-value ${stats.stats?.total_profit_loss >= 0 ? 'positive' : 'negative'}`}>
                    R$ {stats.stats?.total_profit_loss ? stats.stats.total_profit_loss.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="filters-container">
          <div className="filters-content">
            <div className="filter-buttons">
              <button
                onClick={() => setFilterStatus('all')}
                className={`filter-btn ${filterStatus === 'all' ? 'active all' : 'inactive'}`}
              >
                Todas ({bets.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`filter-btn ${filterStatus === 'pending' ? 'active pending' : 'inactive'}`}
              >
                Pendentes ({bets.filter(b => b.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilterStatus('green')}
                className={`filter-btn ${filterStatus === 'green' ? 'active green' : 'inactive'}`}
              >
                Green ({bets.filter(b => b.status === 'green').length})
              </button>
              <button
                onClick={() => setFilterStatus('loss')}
                className={`filter-btn ${filterStatus === 'loss' ? 'active loss' : 'inactive'}`}
              >
                Loss ({bets.filter(b => b.status === 'loss').length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Apostas */}
        <div className="table-container">
          <div className="table-wrapper">
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
                      <div className="game-info">
                        <div className="game-title">
                          {bet.home_team} vs {bet.away_team}
                        </div>
                        <div className="league-name">{bet.league_name}</div>
                        <div className="match-date">
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
                      <div className="prediction-info">
                        <div className="prediction-text">{bet.prediction}</div>
                        <span className={`confidence-badge ${bet.confidence}`}>
                          {bet.confidence}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="stake-info">
                        <div className="stake-amount">R$ {bet.stake}</div>
                        <div className="odds-value">Odds: {bet.odds}</div>
                      </div>
                    </td>
                    <td>
                      <div className="status-info">
                        <div className={`status-icon ${bet.status === 'green' ? 'green' : bet.status === 'loss' ? 'red' : 'yellow'}`}>
                          {getStatusIcon(bet.status)}
                        </div>
                        <span className={`status-badge ${bet.status}`}>
                          {bet.status === 'green' ? 'Green' : bet.status === 'loss' ? 'Loss' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {bet.actual_result ? (
                        <div className="result-info">
                          <div className="result-text">{bet.actual_result}</div>
                          <div className={`profit-loss ${bet.profit_loss >= 0 ? 'positive' : 'negative'}`}>
                            R$ {bet.profit_loss.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
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
            <div className="modal-content">
              <div className="modal-header">
                <h3>Adicionar Nova Aposta</h3>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Time Casa</label>
                  <input
                    type="text"
                    value={newBet.home_team}
                    onChange={(e) => setNewBet({...newBet, home_team: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Time Visitante</label>
                  <input
                    type="text"
                    value={newBet.away_team}
                    onChange={(e) => setNewBet({...newBet, away_team: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Liga</label>
                  <input
                    type="text"
                    value={newBet.league_name}
                    onChange={(e) => setNewBet({...newBet, league_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Mercado</label>
                  <select
                    value={newBet.market_type}
                    onChange={(e) => setNewBet({...newBet, market_type: e.target.value})}
                  >
                    <option value="Over/Under">Over/Under</option>
                    <option value="Both Teams Score">Both Teams Score</option>
                    <option value="Match Winner">Match Winner</option>
                    <option value="Goals">Goals</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Predição</label>
                  <input
                    type="text"
                    value={newBet.prediction}
                    onChange={(e) => setNewBet({...newBet, prediction: e.target.value})}
                    placeholder="Ex: Over 2.5"
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
                  <label>Stake (R$)</label>
                  <input
                    type="number"
                    value={newBet.stake}
                    onChange={(e) => setNewBet({...newBet, stake: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBet.odds}
                    onChange={(e) => setNewBet({...newBet, odds: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={addBet}
                  className="btn-confirm"
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
            <div className="modal-content">
              <div className="modal-header">
                <h3>Detalhes da Aposta</h3>
              </div>
              <div className="modal-body">
                <div className="detail-item">
                  <strong>Jogo:</strong> {selectedBet.home_team} vs {selectedBet.away_team}
                </div>
                <div className="detail-item">
                  <strong>Liga:</strong> {selectedBet.league_name}
                </div>
                <div className="detail-item">
                  <strong>Mercado:</strong> {selectedBet.market_type}
                </div>
                <div className="detail-item">
                  <strong>Predição:</strong> {selectedBet.prediction}
                </div>
                <div className="detail-item">
                  <strong>Confiança:</strong> {selectedBet.confidence}
                </div>
                <div className="detail-item">
                  <strong>Stake:</strong> R$ {selectedBet.stake}
                </div>
                <div className="detail-item">
                  <strong>Odds:</strong> {selectedBet.odds}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> {selectedBet.status}
                </div>
                {selectedBet.actual_result && (
                  <div className="detail-item">
                    <strong>Resultado:</strong> {selectedBet.actual_result}
                  </div>
                )}
                {selectedBet.profit_loss !== null && (
                  <div className="detail-item">
                    <strong>P&L:</strong> R$ {selectedBet.profit_loss.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setSelectedBet(null)}
                  className="btn-cancel"
                >
                  Fechar
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
