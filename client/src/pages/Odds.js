import React, { useState, useEffect } from 'react';
import { FaDice, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';

const Odds = () => {
  const [loading, setLoading] = useState(true);
  const [odds, setOdds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOdds();
  }, []);

  const loadOdds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/odds');
      const data = response.data.data;
      setOdds(data.response || []);
    } catch (error) {
      console.error('Erro ao carregar odds:', error);
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <FaDice className="mr-2 text-purple-500" />
          Odds e Probabilidades
        </h1>
        <p className="text-gray-400">Análise de probabilidades das casas de apostas</p>
      </div>

      <div className="bg-slate-200 rounded-lg p-6">
        <div className="text-center py-8">
          <FaDice className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400">Funcionalidade em desenvolvimento</p>
          <p className="text-gray-500 text-sm">Em breve você poderá visualizar odds e probabilidades</p>
        </div>
      </div>
    </div>
  );
};

export default Odds;
