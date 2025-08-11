import React, { useState, useEffect } from 'react';
import { FaFutbol, FaSearch, FaFilter, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const Fixtures = () => {
  const [loading, setLoading] = useState(true);
  const [fixtures, setFixtures] = useState([]);
  const [filteredFixtures, setFilteredFixtures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadFixtures();
  }, [selectedDate]);

  useEffect(() => {
    filterFixtures();
  }, [fixtures, searchTerm, selectedStatus]);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/fixtures?date=${selectedDate}`);
      const data = response.data.data;
      setFixtures(data.response || []);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFixtures = () => {
    let filtered = fixtures;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(fixture => 
        fixture.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fixture.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fixture.league.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(fixture => fixture.fixture.status.short === selectedStatus);
    }

    setFilteredFixtures(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '1H':
      case '2H':
      case 'HT':
      case 'ET':
      case 'P':
      case 'LIVE':
        return 'text-red-500';
      case 'FT':
      case 'AET':
      case 'PEN':
        return 'text-green-500';
      case 'NS':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case '1H': return '1º Tempo';
      case '2H': return '2º Tempo';
      case 'HT': return 'Intervalo';
      case 'ET': return 'Prorrogação';
      case 'P': return 'Pênaltis';
      case 'FT': return 'Finalizado';
      case 'AET': return 'Finalizado (Prorrogação)';
      case 'PEN': return 'Finalizado (Pênaltis)';
      case 'NS': return 'Não Iniciado';
      case 'LIVE': return 'Ao Vivo';
      default: return status;
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FaFutbol className="mr-2 text-blue-500" />
            Jogos
          </h1>
          <p className="text-gray-400">Gerencie e visualize todos os jogos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar times ou ligas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="NS">Não Iniciado</option>
              <option value="1H">1º Tempo</option>
              <option value="HT">Intervalo</option>
              <option value="2H">2º Tempo</option>
              <option value="ET">Prorrogação</option>
              <option value="P">Pênaltis</option>
              <option value="FT">Finalizado</option>
              <option value="AET">Finalizado (Prorrogação)</option>
              <option value="PEN">Finalizado (Pênaltis)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-slate-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Resultados ({filteredFixtures.length})
          </h2>
          <span className="text-gray-400 text-sm">
            {moment(selectedDate).format('DD/MM/YYYY')}
          </span>
        </div>

        {filteredFixtures.length === 0 ? (
          <div className="text-center py-8">
            <FaFutbol className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-400">Nenhum jogo encontrado para os filtros selecionados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFixtures.map((fixture) => (
              <div key={fixture.fixture.id} className="bg-slate-700 rounded-lg p-4 card-hover">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${getStatusColor(fixture.fixture.status.short)}`}>
                      {getStatusText(fixture.fixture.status.short)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {moment(fixture.fixture.date).format('HH:mm')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 bg-slate-600 px-2 py-1 rounded">
                    {fixture.league.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {fixture.teams.home.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{fixture.teams.home.name}</p>
                      <p className="text-xs text-gray-400">{fixture.league.country}</p>
                    </div>
                  </div>

                  <div className="text-center mx-4">
                    <div className="text-lg font-bold text-white">
                      {fixture.goals.home !== null ? fixture.goals.home : '-'} - {fixture.goals.away !== null ? fixture.goals.away : '-'}
                    </div>
                    <div className="text-xs text-gray-400">Placar</div>
                  </div>

                  <div className="flex items-center space-x-3 flex-1 justify-end">
                    <div className="flex-1 text-right">
                      <p className="text-white font-semibold">{fixture.teams.away.name}</p>
                      <p className="text-xs text-gray-400">{fixture.league.country}</p>
                    </div>
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {fixture.teams.away.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {fixture.fixture.venue && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-gray-400">
                      📍 {fixture.fixture.venue.name || 'Local não informado'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fixtures;
