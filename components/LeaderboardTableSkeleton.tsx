import React from 'react';

const LeaderboardTableSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">VA Name</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Articles</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Images</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Days</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="h-5 w-8 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    );
};

export default LeaderboardTableSkeleton;