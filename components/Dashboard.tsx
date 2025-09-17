import React, { useState } from 'react';
import { ArticleTask, WordPressSite, Status, DailyPostsData, DateRange, VirtualAssistant, VAPerformanceData, Post, ChampionHistory, ChampionData } from '../types';
import StatCard from './StatCard';
import StatusBarChart from './StatusBarChart';
import AnalyticsDashboard from './AnalyticsDashboard';
import LeaderboardTable from './LeaderboardTable';
import ChampionBanner from './ChampionBanner';
import LeaderboardTableSkeleton from './LeaderboardTableSkeleton';

interface DashboardProps {
  tasks: ArticleTask[];
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  onNavigateToHub: () => void;
  postsData: DailyPostsData[];
  isLoading: boolean;
  error: string | null;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  rankedPerformanceData: VAPerformanceData[];
  isLoadingPerformance: boolean;
  performanceError: string | null;
  onRefreshPerformance: () => void;
  championHistory: ChampionHistory;
  lastMonthChampion: ChampionData | null;
  onUpdateTask: (task: ArticleTask) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, 
  sites, 
  vas, 
  onNavigateToHub, 
  postsData,
  isLoading,
  error,
  dateRange,
  onDateRangeChange,
  onRefresh,
  rankedPerformanceData,
  isLoadingPerformance,
  performanceError,
  onRefreshPerformance,
  championHistory,
  lastMonthChampion,
  onUpdateTask
}) => {
  const [workflowVaFilter, setWorkflowVaFilter] = useState<'all' | string>('all');

  const filteredWorkflowTasks = React.useMemo(() => {
    if (workflowVaFilter === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.vaId === workflowVaFilter);
  }, [tasks, workflowVaFilter]);


  const statusCounts = React.useMemo(() => {
    const counts: Record<Status, number> = {
      idea: 0,
      'in-progress': 0,
      review: 0,
      'changes-requested': 0,
      published: 0,
      archived: 0,
    };
    filteredWorkflowTasks.forEach(task => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return counts;
  }, [filteredWorkflowTasks]);

  const totalTasks = filteredWorkflowTasks.length;
  const inProgressTasks = statusCounts['in-progress'];
  const inReviewTasks = statusCounts.review;
  const publishedTasks = statusCounts.published;
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Workflow Overview</h2>
            <select
                value={workflowVaFilter}
                onChange={(e) => setWorkflowVaFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 text-base bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                aria-label="Filter workflow by Virtual Assistant"
            >
                <option value="all">All VAs</option>
                {vas.map(va => (
                    <option key={va.id} value={va.id}>{va.name}</option>
                ))}
            </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard title={workflowVaFilter === 'all' ? "Total Tasks" : "Assigned Tasks"} value={totalTasks} color="blue" />
                <StatCard title="Published" value={publishedTasks} color="green" />
                <StatCard title="In Progress" value={inProgressTasks} color="yellow" />
                <StatCard title="In Review" value={inReviewTasks} color="red" />
            </div>
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Tasks by Status</h3>
                <StatusBarChart data={statusCounts} />
            </div>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
        <AnalyticsDashboard 
          postsData={postsData}
          sites={sites}
          vas={vas}
          isLoading={isLoading}
          error={error}
          onNavigateToHub={onNavigateToHub}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          onRefresh={onRefresh}
          tasks={tasks}
          onUpdateTask={onUpdateTask}
        />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Monthly Performance Leaderboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Performance rating for {currentMonthName}.
              </p>
            </div>
            <button onClick={onRefreshPerformance} disabled={isLoadingPerformance} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-600 dark:text-slate-300 ${isLoadingPerformance ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        
        {lastMonthChampion && (
            <div className="mb-6">
              <ChampionBanner champion={lastMonthChampion} />
            </div>
        )}
        
        {isLoadingPerformance && (
          <div>
            <div className="text-center mb-4">
              <div className="flex justify-center items-center mb-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Calculating Performance Metrics...</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Fetching and analyzing posts for the month. This may take a moment.</p>
            </div>
            <LeaderboardTableSkeleton />
          </div>
        )}

        {performanceError && (
          <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
              <p className="font-bold">Connection Error</p>
              <p>{performanceError}</p>
          </div>
        )}

        {!isLoadingPerformance && !performanceError && (
          <div>
            {vas.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-center">
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No VAs Found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">You need to add Virtual Assistant accounts in Settings before you can see performance data.</p>
              </div>
            ) : rankedPerformanceData.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-center">
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No Data Yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">There is no performance data to display for this month. <br /> Check back later once VAs have published some articles.</p>
              </div>
            ) : (
                <LeaderboardTable 
                    rankedPerformanceData={rankedPerformanceData} 
                    championHistory={championHistory}
                />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;