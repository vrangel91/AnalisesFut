import React from 'react';
import { FaTrophy } from 'react-icons/fa';

const Leagues = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <FaTrophy className="mr-2 text-yellow-500" />
          Ligas
        </h1>
        <p className="text-gray-400">Visualize todas as ligas disponíveis</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <div className="text-center py-8">
          <FaTrophy className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400">Funcionalidade em desenvolvimento</p>
          <p className="text-gray-500 text-sm">Em breve você poderá visualizar todas as ligas</p>
        </div>
      </div>
    </div>
  );
};

export default Leagues;
