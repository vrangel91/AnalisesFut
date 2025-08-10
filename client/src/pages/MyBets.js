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

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'loss': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green': return <FaCheckCircle className="text-green-600" />;
      case 'loss': return <FaTimesCircle className="text-red-600" />;
      case 'pending': return <FaClock className="text-yellow-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'alta': return 'text-green-600 bg-green-100';
      case 'média': return 'text-yellow-600 bg-yellow-100';
      case 'baixa': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredBets = bets.filter(bet => {
    if (filterStatus === 'all') return true;
    return bet.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando suas apostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaTrophy className="mr-3 text-blue-600" />
                Minhas Apostas
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie e acompanhe suas apostas com IA
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={checkResults}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FaSync className="mr-2" />
                Verificar Resultados
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FaPlus className="mr-2" />
                Adicionar Aposta
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaChartBar className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Apostas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats?.total_bets || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaCheckCircle className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Acerto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.stats?.win_rate ? `${stats.stats.win_rate.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FaDollarSign className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.stats?.roi ? `${stats.stats.roi.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FaChartLine className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lucro Total</p>
                  <p className={`text-2xl font-bold ${stats.stats?.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {stats.stats?.total_profit_loss ? stats.stats.total_profit_loss.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todas ({bets.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pendentes ({bets.filter(b => b.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilterStatus('green')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'green' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Green ({bets.filter(b => b.status === 'green').length})
              </button>
              <button
                onClick={() => setFilterStatus('loss')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'loss' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Loss ({bets.filter(b => b.status === 'loss').length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Apostas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jogo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mercado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aposta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stake
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resultado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bet.home_team} vs {bet.away_team}
                        </div>
                        <div className="text-sm text-gray-500">{bet.league_name}</div>
                        <div className="text-xs text-gray-400">
                          {bet.match_date} {bet.match_time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {bet.market_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bet.prediction}</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(bet.confidence)}`}>
                          {bet.confidence}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">R$ {bet.stake}</div>
                      <div className="text-sm text-gray-500">Odds: {bet.odds}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(bet.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>
                          {bet.status === 'green' ? 'Green' : bet.status === 'loss' ? 'Loss' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bet.actual_result ? (
                        <div>
                          <div className="text-sm text-gray-900">{bet.actual_result}</div>
                          <div className={`text-sm ${bet.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {bet.profit_loss.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedBet(bet)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteBet(bet.id)}
                          className="text-red-600 hover:text-red-900"
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Nova Aposta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time Casa</label>
                    <input
                      type="text"
                      value={newBet.home_team}
                      onChange={(e) => setNewBet({...newBet, home_team: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time Visitante</label>
                    <input
                      type="text"
                      value={newBet.away_team}
                      onChange={(e) => setNewBet({...newBet, away_team: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Liga</label>
                    <input
                      type="text"
                      value={newBet.league_name}
                      onChange={(e) => setNewBet({...newBet, league_name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Mercado</label>
                    <select
                      value={newBet.market_type}
                      onChange={(e) => setNewBet({...newBet, market_type: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Over/Under">Over/Under</option>
                      <option value="Both Teams Score">Both Teams Score</option>
                      <option value="Match Winner">Match Winner</option>
                      <option value="Goals">Goals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Predição</label>
                    <input
                      type="text"
                      value={newBet.prediction}
                      onChange={(e) => setNewBet({...newBet, prediction: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Ex: Over 2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confiança</label>
                    <select
                      value={newBet.confidence}
                      onChange={(e) => setNewBet({...newBet, confidence: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="alta">Alta</option>
                      <option value="média">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stake (R$)</label>
                    <input
                      type="number"
                      value={newBet.stake}
                      onChange={(e) => setNewBet({...newBet, stake: parseFloat(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Odds</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBet.odds}
                      onChange={(e) => setNewBet({...newBet, odds: parseFloat(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addBet}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalhes da Aposta */}
        {selectedBet && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes da Aposta</h3>
                <div className="space-y-3">
                  <div>
                    <strong>Jogo:</strong> {selectedBet.home_team} vs {selectedBet.away_team}
                  </div>
                  <div>
                    <strong>Liga:</strong> {selectedBet.league_name}
                  </div>
                  <div>
                    <strong>Mercado:</strong> {selectedBet.market_type}
                  </div>
                  <div>
                    <strong>Predição:</strong> {selectedBet.prediction}
                  </div>
                  <div>
                    <strong>Confiança:</strong> {selectedBet.confidence}
                  </div>
                  <div>
                    <strong>Stake:</strong> R$ {selectedBet.stake}
                  </div>
                  <div>
                    <strong>Odds:</strong> {selectedBet.odds}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedBet.status}
                  </div>
                  {selectedBet.actual_result && (
                    <div>
                      <strong>Resultado:</strong> {selectedBet.actual_result}
                    </div>
                  )}
                  {selectedBet.profit_loss !== null && (
                    <div>
                      <strong>P&L:</strong> R$ {selectedBet.profit_loss.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedBet(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;
