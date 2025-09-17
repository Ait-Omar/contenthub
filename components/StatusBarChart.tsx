import React from 'react';
import { Status } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface StatusBarChartProps {
  data: Record<Status, number>;
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      {STATUS_OPTIONS.map(option => {
        const count = data[option.value] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const bgColor = option.color.split(' ')[0].replace('bg-', '');

        return (
          <div key={option.value}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{option.label}</span>
              <span className={`text-sm font-semibold ${option.color.split(' ')[1]}`}>{count}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full`}
                style={{ width: `${percentage}%`, backgroundColor: `var(--tw-color-${bgColor})` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${option.label}: ${count} articles`}
              ></div>
            </div>
          </div>
        );
      })}
       {/* Tailwind doesn't know about dynamic classes, so we need to include them so it generates them */}
       <div className="hidden bg-red-100 bg-yellow-100 bg-blue-100 bg-green-100"></div>
    </div>
  );
};

export default StatusBarChart;