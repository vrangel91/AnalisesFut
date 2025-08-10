import React from 'react';
import { FaChartBar } from 'react-icons/fa';

const Statistics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <FaChartBar className="mr-2 text-blue-500" />
          Estatísticas
        </h1>
        <p className="text-gray-400">Análise detalhada de estatísticas dos times e jogadores</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <div className="text-center py-8">
          <FaChartBar className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400">Funcionalidade em desenvolvimento</p>
          <p className="text-gray-500 text-sm">Em breve você poderá visualizar estatísticas detalhadas</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
