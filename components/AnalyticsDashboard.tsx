import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Changed import for DateRange from '../App' to '../types' to follow proper module structure.
import { DailyPostsData, WordPressSite, Post, DateRange, VirtualAssistant, ArticleTask } from '../types';
import PostListModal from './PostListModal';
import VAPerformance from './VAPerformance';

interface AnalyticsDashboardProps {
  postsData: DailyPostsData[];
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  isLoading: boolean;
  error: string | null;
  onNavigateToHub: () => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onRefresh: () => void;
  tasks: ArticleTask[];
  onUpdateTask: (task: ArticleTask) => void;
}

const DateRangeSelector: React.FC<{
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
    onRefresh: () => void;
    isLoading: boolean;
}> = ({ dateRange, onDateRangeChange, onRefresh, isLoading }) => {
    const ranges: { key: DateRange; label: string }[] = [
        { key: 'today', label: 'Today' },
        { key: 'yesterday', label: 'Yesterday' },
        { key: 'last7', label: 'Last 7 Days' },
        { key: 'last30', label: 'Last 30 Days' },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedLabel = ranges.find(r => r.key === dateRange)?.label || 'Today';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (rangeKey: DateRange) => {
        onDateRangeChange(rangeKey);
        setIsOpen(false);
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-40 pl-3 pr-2 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <span className="dark:text-slate-200">{selectedLabel}</span>
                    <svg className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isOpen && (
                    <ul className="absolute z-10 mt-1 w-40 bg-white dark:bg-slate-800 shadow-lg rounded-md overflow-hidden border dark:border-slate-700">
                        {ranges.map(range => (
                            <li
                                key={range.key}
                                onClick={() => handleSelect(range.key)}
                                className={`px-4 py-2 text-sm cursor-pointer ${
                                    dateRange === range.key
                                        ? 'bg-primary text-white'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {range.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button onClick={onRefresh} disabled={isLoading} className="p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-600 dark:text-slate-300 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
}

const SiteSelector: React.FC<{
    sites: WordPressSite[];
    selectedSiteId: string | 'all';
    onSiteChange: (siteId: string | 'all') => void;
}> = ({ sites, selectedSiteId, onSiteChange }) => {
    return (
        <select
            value={selectedSiteId}
            onChange={(e) => onSiteChange(e.target.value)}
            className="w-48 px-3 py-2 text-base bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            aria-label="Select a Site"
        >
            <option value="all">All Sites</option>
            {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
            ))}
        </select>
    );
}


const VASelector: React.FC<{
    vas: VirtualAssistant[];
    selectedVaId: string | 'all';
    onVaChange: (vaId: string | 'all') => void;
}> = ({ vas, selectedVaId, onVaChange }) => {
    return (
        <select
            value={selectedVaId}
            onChange={(e) => onVaChange(e.target.value)}
            className="w-48 px-3 py-2 text-base bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            aria-label="Select a Virtual Assistant"
        >
            <option value="all">All VAs</option>
            {vas.map(va => (
                <option key={va.id} value={va.id}>{va.name}</option>
            ))}
        </select>
    );
}


const StatCard: React.FC<{title: string, value: number}> = ({title, value}) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-3xl font-bold mt-1 text-primary">{value}</p>
    </div>
);

type DisplayRow = {
  vaId: string;
  vaName: string;
  siteId: string;
  siteName: string;
  posts: Post[];
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ postsData, sites, vas, isLoading, error, onNavigateToHub, dateRange, onDateRangeChange, onRefresh, tasks, onUpdateTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedVaId, setSelectedVaId] = useState<'all' | string>('all');
  const [selectedSiteId, setSelectedSiteId] = useState<'all' | string>('all');

  const vaMappedPosts = useMemo(() => {
    const dataByVaAndSite: Record<string, DisplayRow> = {};

    for (const postGroup of postsData) {
        for (const va of vas) {
            const isMatch = va.authorLinks.some(link => 
                link.siteId === postGroup.siteId && link.authorName.startsWith(postGroup.authorFirstName)
            );

            if (isMatch) {
                const key = `${va.id}-${postGroup.siteId}`;
                if (!dataByVaAndSite[key]) {
                    dataByVaAndSite[key] = {
                        vaId: va.id,
                        vaName: va.name,
                        siteId: postGroup.siteId,
                        siteName: sites.find(s => s.id === postGroup.siteId)?.name || 'Unknown',
                        posts: []
                    };
                }
                dataByVaAndSite[key].posts.push(...postGroup.posts);
                break; 
            }
        }
    }
    return Object.values(dataByVaAndSite);
  }, [postsData, vas, sites]);

  const filteredDisplayData = useMemo(() => {
    let data = vaMappedPosts;

    if (selectedVaId !== 'all') {
        data = data.filter(row => row.vaId === selectedVaId);
    }
    
    if (selectedSiteId !== 'all') {
        data = data.filter(row => row.siteId === selectedSiteId);
    }

    return data;
  }, [vaMappedPosts, selectedVaId, selectedSiteId]);


  const summaryStats = useMemo(() => {
    const totalPosts = filteredDisplayData.reduce((sum, data) => sum + data.posts.length, 0);
    const activeVAs = new Set(filteredDisplayData.map(data => data.vaId)).size;
    const activeSites = new Set(filteredDisplayData.map(data => data.siteId)).size;
    return { totalPosts, activeVAs, activeSites };
  }, [filteredDisplayData]);

  if (sites.length === 0) {
    return (
      <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Welcome to VA Publishing Analytics!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">To get started, you need to connect your WordPress sites.</p>
        <button
          onClick={onNavigateToHub}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg shadow-sm transition duration-300 ease-in-out"
        >
          Go to Hub
        </button>
      </div>
    );
  }

  const handleCountClick = (data: DisplayRow) => {
    if (data.posts.length > 0) {
      setSelectedPosts(data.posts);
      setModalTitle(`Articles by ${data.vaName} on ${data.siteName}`);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Publishing Stats</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analyze post volume by date range, site, and Virtual Assistant.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SiteSelector sites={sites} selectedSiteId={selectedSiteId} onSiteChange={setSelectedSiteId} />
              <VASelector vas={vas} selectedVaId={selectedVaId} onVaChange={setSelectedVaId} />
              <DateRangeSelector dateRange={dateRange} onDateRangeChange={onDateRangeChange} onRefresh={onRefresh} isLoading={isLoading}/>
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Total Publications" value={summaryStats.totalPosts} />
            <StatCard title="Active VAs" value={summaryStats.activeVAs} />
            <StatCard title="Active Sites" value={summaryStats.activeSites} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-4" role="alert">
                        <p className="font-bold">Connection Error</p>
                        <p>{error}</p>
                    </div>
                )}
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
                    <div className="overflow-x-auto relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-slate-800 dark:bg-opacity-75 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Site</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">VA</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Number of Posts</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                              {!isLoading && filteredDisplayData.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    No articles match the current filters.
                                  </td>
                                </tr>
                              )}
                              {filteredDisplayData.map((data) => {
                                const count = data.posts.length;
                                const isClickable = count > 0;
                                return (
                                  <tr key={`${data.siteId}-${data.vaId}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{data.siteName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{data.vaName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-100 text-center font-bold">
                                      {count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleCountClick(data)}
                                            disabled={!isClickable}
                                            className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded disabled:text-slate-400 disabled:cursor-not-allowed disabled:no-underline"
                                            aria-label={`View ${count} articles by ${data.vaName} on ${data.siteName}`}
                                        >
                                            View Posts
                                        </button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
             <div className="lg:col-span-1">
                <VAPerformance 
                    postsData={postsData}
                    vas={vas}
                    selectedVaId={selectedVaId}
                    selectedSiteId={selectedSiteId}
                    dateRange={dateRange}
                />
            </div>
        </div>
      </div>
      <PostListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        posts={selectedPosts}
        title={modalTitle}
        tasks={tasks}
        onUpdateTask={onUpdateTask}
       />
    </>
  );
};

export default AnalyticsDashboard;