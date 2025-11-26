
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon, trend, color }) => {
  const isTrendUp = trend?.startsWith('+');

  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
      
      {trend && (
        <div className={`flex items-center space-x-1 text-sm font-semibold ${isTrendUp ? 'text-green-200' : 'text-red-200'}`}>
          {isTrendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;