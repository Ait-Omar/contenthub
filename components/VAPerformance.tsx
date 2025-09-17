import React, { useMemo } from 'react';
import { DailyPostsData, VirtualAssistant, DateRange } from '../types';

interface VAPerformanceProps {
  postsData: DailyPostsData[];
  vas: VirtualAssistant[];
  selectedVaId: string | 'all';
  selectedSiteId: string | 'all';
  dateRange: DateRange;
}

const getNumberOfDays = (range: DateRange): number => {
    switch (range) {
        case 'today':
        case 'yesterday':
            return 1;
        case 'last7':
            return 7;
        case 'last30':
            return 30;
        default:
            return 1;
    }
};

const getBarColor = (percentage: number): string => {
    if (percentage >= 90) {
        return 'bg-primary'; // Green
    }
    if (percentage >= 50) {
        return 'bg-yellow-500'; // Yellow
    }
    return 'bg-red-500'; // Red
};

const AllVAsChart: React.FC<{ 
    data: DailyPostsData[], 
    vas: VirtualAssistant[], 
    selectedVaId: string | 'all',
    selectedSiteId: string | 'all',
    dateRange: DateRange,
}> = ({ data, vas, selectedVaId, selectedSiteId, dateRange }) => {
    const performanceData = useMemo(() => {
        const numberOfDays = getNumberOfDays(dateRange);
        const dailyTargetPerSite = 5;

        const filteredVAs = selectedVaId === 'all' 
            ? vas 
            : vas.filter(va => va.id === selectedVaId);

        return filteredVAs.map(va => {
            const actualCount = data.filter(postData => 
                va.authorLinks.some(link => link.siteId === postData.siteId && link.authorName.startsWith(postData.authorFirstName))
            ).reduce((sum, curr) => sum + curr.posts.length, 0);

            let targetSiteIds = va.siteIds;
            // If a specific site is selected, the target should be only for that site.
            if (selectedSiteId !== 'all') {
                targetSiteIds = va.siteIds.filter(id => id === selectedSiteId);
            }
            
            const totalTarget = targetSiteIds.length * dailyTargetPerSite * numberOfDays;
            
            const percentage = totalTarget > 0 ? (actualCount / totalTarget) * 100 : 0;
            const barColor = getBarColor(percentage);

            return { 
                id: va.id, 
                name: va.name, 
                count: actualCount,
                target: totalTarget,
                percentage,
                barColor
            };
        }).sort((a, b) => b.percentage - a.percentage);
    }, [data, vas, dateRange, selectedSiteId, selectedVaId]);


    if (vas.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No VAs configured.</p>
    }
    
    if (performanceData.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">This VA has no data for the selected filters.</p>
    }

    return (
        <div className="space-y-4">
            {performanceData.map(va => {
                const isSelected = va.id === selectedVaId;
                const barWidth = Math.min(va.percentage, 100);
                
                return (
                    <div 
                        key={va.id} 
                        className={`p-2 rounded-lg transition-colors duration-200 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 shadow-sm' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                             <div className={`text-sm truncate pr-2 ${isSelected ? 'font-bold text-primary' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{va.name}</div>
                             <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{va.count} / <span className="text-slate-700 dark:text-slate-200">{va.target}</span></div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 relative">
                            <div 
                                className={`h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500 ease-out ${va.barColor}`}
                                style={{ width: `${barWidth}%`}}
                            >
                                {barWidth > 20 && (
                                    <span className="text-sm font-bold text-white">{Math.round(va.percentage)}%</span>
                                )}
                            </div>
                             {barWidth <= 20 && (
                                <span className="absolute left-2 top-0.5 text-sm font-bold text-slate-600 dark:text-slate-200" style={{ lineHeight: '1.5rem' }}>{Math.round(va.percentage)}%</span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const VAPerformance: React.FC<VAPerformanceProps> = ({ postsData, vas, selectedVaId, selectedSiteId, dateRange }) => {

  const filteredPostsData = useMemo(() => {
    if (selectedSiteId === 'all') {
      return postsData;
    }
    return postsData.filter(d => d.siteId === selectedSiteId);
  }, [postsData, selectedSiteId]);
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-full">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">VA Performance Analysis</h3>
        <AllVAsChart 
            data={filteredPostsData} 
            vas={vas} 
            selectedVaId={selectedVaId}
            selectedSiteId={selectedSiteId}
            dateRange={dateRange}
        />
    </div>
  );
};

export default VAPerformance;