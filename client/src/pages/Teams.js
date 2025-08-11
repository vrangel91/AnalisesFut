import React from 'react';
import { FaUsers } from 'react-icons/fa';

const Teams = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <FaUsers className="mr-2 text-green-500" />
          Times
        </h1>
        <p className="text-gray-400">Visualize informações dos times</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <div className="text-center py-8">
          <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-400">Funcionalidade em desenvolvimento</p>
          <p className="text-gray-500 text-sm">Em breve você poderá visualizar informações dos times</p>
        </div>
      </div>
    </div>
  );
};

export default Teams;
