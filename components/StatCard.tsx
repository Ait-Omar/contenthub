import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  color?: 'green' | 'yellow' | 'red' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = 'blue' }) => {
  const colorClasses = {
    green: 'border-green-500 text-green-600',
    yellow: 'border-yellow-500 text-yellow-600',
    red: 'border-red-500 text-red-600',
    blue: 'border-primary text-primary',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`text-4xl font-bold mt-2 ${colorClasses[color]}`}>{value}</p>
    </div>
  );
};

export default StatCard;