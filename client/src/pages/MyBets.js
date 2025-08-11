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
              >
                <FaSync />
                Verificar Resultados
              </button>
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
            <div className="modal">
              <h3>Detalhes da Aposta</h3>
              <div className="form-group">
                <strong>Jogo:</strong> {selectedBet.home_team} vs {selectedBet.away_team}
              </div>
              <div className="form-group">
                <strong>Liga:</strong> {selectedBet.league_name}
              </div>
              <div className="form-group">
                <strong>Mercado:</strong> {selectedBet.market_type}
              </div>
              <div className="form-group">
                <strong>Predição:</strong> {selectedBet.prediction}
              </div>
              <div className="form-group">
                <strong>Confiança:</strong> {selectedBet.confidence}
              </div>
              <div className="form-group">
                <strong>Stake:</strong> R$ {selectedBet.stake}
              </div>
              <div className="form-group">
                <strong>Odds:</strong> {selectedBet.odds}
              </div>
              <div className="form-group">
                <strong>Status:</strong> {selectedBet.status}
              </div>
              {selectedBet.actual_result && (
                <div className="form-group">
                  <strong>Resultado:</strong> {selectedBet.actual_result}
                </div>
              )}
              {selectedBet.profit_loss !== null && (
                <div className="form-group">
                  <strong>P&L:</strong> R$ {selectedBet.profit_loss.toFixed(2)}
                </div>
              )}
              <div className="modal-actions">
                <button
                  onClick={() => setSelectedBet(null)}
                  className="btn btn-secondary"
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
