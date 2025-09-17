import React, { useMemo } from 'react';
// FIX: Import LoggedInUser from types.ts to ensure type consistency.
import { DailyPostsData, WordPressSite, VirtualAssistant, User, Post, VAPerformanceData, ChampionHistory, ChampionData, LoggedInUser } from '../types';
import LeaderboardTable from './LeaderboardTable';
import ChampionBanner from './ChampionBanner';
import LeaderboardTableSkeleton from './LeaderboardTableSkeleton';

// FIX: Removed local LoggedInUser type definition.

interface PerformancePageProps {
  user: LoggedInUser;
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  rankedPerformanceData: VAPerformanceData[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  championHistory: ChampionHistory;
  lastMonthChampion: ChampionData | null;
}

const PerformancePage: React.FC<PerformancePageProps> = ({ user, sites, vas, rankedPerformanceData, isLoading, error, onRefresh, championHistory, lastMonthChampion }) => {
  
  const summaryStats = useMemo(() => {
    const totalPosts = rankedPerformanceData.reduce((sum, va) => sum + va.totalPosts, 0);
    const contributingVAs = rankedPerformanceData.filter(va => va.totalPosts > 0).length;
    return { totalPosts, contributingVAs };
  }, [rankedPerformanceData]);

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">VA Performance Leaderboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monthly performance rating for {currentMonthName}.
          </p>
        </div>
        <button onClick={onRefresh} disabled={isLoading} className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
      
      {user.role === 'admin' && !isLoading && !error && rankedPerformanceData.length > 0 && vas.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-300">
                This month, <strong className="text-primary">{summaryStats.contributingVAs} VAs</strong> have published a total of <strong className="text-primary">{summaryStats.totalPosts} articles</strong>!
            </p>
          </div>
      )}

       {lastMonthChampion && (
            <div className="mb-6">
              <ChampionBanner champion={lastMonthChampion} />
            </div>
        )}

      {isLoading && (
        <div>
          <div className="text-center mb-4">
            <div className="flex justify-center items-center mb-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Calculating Performance Metrics...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fetching and analyzing posts for the month. This may take a moment.</p>
          </div>
          <LeaderboardTableSkeleton />
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
            <p className="font-bold">Connection Error</p>
            <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div>
            {vas.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No VAs Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Your admin needs to add Virtual Assistant accounts in Settings before you can see performance data.</p>
                </div>
            ) : rankedPerformanceData.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No Data Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">There is no performance data to display for this month. <br /> Check back later once you have published some articles.</p>
                </div>
            ) : (
                <LeaderboardTable 
                    rankedPerformanceData={rankedPerformanceData} 
                    championHistory={championHistory}
                    currentUserId={user.role === 'va' ? user.id : undefined}
                />
            )}
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
