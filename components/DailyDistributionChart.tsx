import React from 'react';

interface DailyDistributionChartProps {
    data: Record<number, number>; // { 1: 5, 2: 3, ... }
}

const DailyDistributionChart: React.FC<DailyDistributionChartProps> = ({ data }) => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const maxPosts = Math.max(...Object.values(data), 1); // Avoid division by zero, min height for bars

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Monthly Activity</h4>
            <div className="flex items-end h-24 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg space-x-px">
                {days.map(day => {
                    const postCount = data[day] || 0;
                    const barHeight = `${(postCount / maxPosts) * 100}%`;

                    return (
                        <div key={day} className="flex-1 group relative">
                            <div
                                className="w-full bg-primary transition-all duration-300 ease-in-out group-hover:bg-primary-dark"
                                style={{ height: barHeight, minHeight: postCount > 0 ? '2px' : '0' }}
                            ></div>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10 whitespace-nowrap">
                                Day {day}: {postCount} post{postCount !== 1 ? 's' : ''}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyDistributionChart;