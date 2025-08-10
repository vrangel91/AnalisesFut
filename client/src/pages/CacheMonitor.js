import React, { useState, useEffect } from 'react';
import { 
  FaDatabase, 
  FaChartBar, 
  FaTrash, 
  FaSync, 
  FaRocket,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const CacheMonitor = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/cache/status');
      const data = await response.json();
      if (data.success) {
        setCacheStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanCache = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/cache/clean', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert('Cache limpo com sucesso!');
        fetchCacheStats();
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      alert('Erro ao limpar cache');
    } finally {
      setRefreshing(false);
    }
  };

  const preloadData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/cache/preload', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert('Pré-carregamento concluído!');
        fetchCacheStats();
      }
    } catch (error) {
      console.error('Erro no pré-carregamento:', error);
      alert('Erro no pré-carregamento');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estatísticas do cache...</p>
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
                <FaDatabase className="mr-3 text-blue-600" />
                Monitor de Cache
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie e monitore o sistema de cache da aplicação
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={cleanCache}
                disabled={refreshing}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
              >
                <FaTrash className="mr-2" />
                Limpar Cache
              </button>
              <button
                onClick={preloadData}
                disabled={refreshing}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
              >
                <FaRocket className="mr-2" />
                Pré-carregar
              </button>
              <button
                onClick={fetchCacheStats}
                disabled={refreshing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
              >
                <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaDatabase className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Entradas</p>
                <p className="text-2xl font-bold text-gray-900">{cacheStats?.totalEntries || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaChartBar className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Acerto</p>
                <p className="text-2xl font-bold text-gray-900">{cacheStats?.hitRate || '0%'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaClock className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Requisições</p>
                <p className="text-2xl font-bold text-gray-900">{cacheStats?.totalRequests || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaCheckCircle className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cache Hits</p>
                <p className="text-2xl font-bold text-gray-900">{cacheStats?.totalHits || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas por Endpoint */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaChartBar className="mr-2 text-blue-600" />
            Estatísticas por Endpoint
          </h2>
          
          {cacheStats?.stats && cacheStats.stats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entradas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acessos Totais
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acessos Médios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Acesso
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cacheStats.stats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.total_entries}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.total_accesses || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(stat.avg_accesses || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.last_accessed ? new Date(stat.last_accessed).toLocaleString('pt-BR') : 'Nunca'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma estatística disponível</p>
            </div>
          )}
        </div>

        {/* Informações do Sistema */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Informações do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">TTL (Time To Live)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fixtures: 30 minutos</li>
                <li>• Odds: 5 minutos</li>
                <li>• Leagues: 24 horas</li>
                <li>• Teams: 24 horas</li>
                <li>• Predictions: 1 hora</li>
                <li>• Head to Head: 12 horas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Tarefas Automáticas</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Limpeza de cache: A cada hora</li>
                <li>• Pré-carregamento: A cada 6 horas</li>
                <li>• Dados ao vivo: A cada 5 minutos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheMonitor;
