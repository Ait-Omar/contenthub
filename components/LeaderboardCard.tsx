import React, { useMemo } from 'react';
import { VAPerformanceData, ChampionHistory } from '../types';

interface LeaderboardCardProps {
    data: VAPerformanceData;
    isCurrentUser: boolean;
    championHistory: ChampionHistory;
}

const getRankInfo = (rank: number): { badge: string; border: string; icon: string; shadow: string } => {
    switch (rank) {
        case 1: return { badge: 'bg-yellow-400 text-yellow-900', border: 'border-yellow-400', icon: '🥇', shadow: 'shadow-yellow-400/30' };
        case 2: return { badge: 'bg-slate-300 text-slate-800', border: 'border-slate-300', icon: '🥈', shadow: 'shadow-slate-400/30' };
        case 3: return { badge: 'bg-orange-400 text-orange-900', border: 'border-orange-400', icon: '🥉', shadow: 'shadow-orange-400/30' };
        default: return { badge: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200', border: 'border-slate-200 dark:border-slate-700', icon: `#${rank}`, shadow: '' };
    }
};

const getStarRating = (score: number): string => {
    const rating = Math.round((score / 100) * 5);
    if (rating === 0 && score > 0) return '⭐☆☆☆☆';
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
};

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ data, isCurrentUser, championHistory }) => {
    const { rank, score, vaName, totalPosts, avgImages, activeDays, breakdown } = data;
    const { badge, border, icon, shadow } = getRankInfo(rank);
    
    const highlightClass = isCurrentUser ? 'ring-2 ring-primary dark:ring-primary scale-105' : '';
    const cardShadow = rank <= 3 ? `shadow-lg ${shadow}` : 'shadow-md';

    const breakdownTooltip = `Score Breakdown:\n- Articles: ${breakdown.articleScore}/50\n- Images: ${breakdown.imageScore}/25\n- Consistency: ${breakdown.consistencyScore}/25`;
    
    const championCount = useMemo(() => {
        return Object.values(championHistory).filter(id => id === data.vaId).length;
    }, [championHistory, data.vaId]);

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border ${border} ${cardShadow} ${highlightClass} p-5 space-y-4 flex flex-col transition-transform duration-200`}>
            <div className="flex items-start justify-between">
                <div>
                     <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{vaName}</h3>
                        {championCount > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-full" title={`Champion ${championCount} time(s)`}>
                            <span className="text-sm">🏆</span>
                            <span className="text-xs font-bold text-yellow-800 dark:text-yellow-200">{championCount}</span>
                            </div>
                        )}
                    </div>
                    {isCurrentUser && <p className="text-xs font-semibold text-primary">(This is you)</p>}
                </div>
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${badge}`}>
                    {icon}
                </div>
            </div>

            <div className="flex items-center justify-around bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                <div className="group relative">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Score</p>
                    <p className="text-3xl font-bold text-primary cursor-help">{score}</p>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-3 py-2 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10 whitespace-pre-wrap w-48 text-left">
                        {breakdownTooltip}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rating</p>
                    <p className="text-2xl" title={`${score}/100`}>{getStarRating(score)}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-200 dark:border-slate-700 pt-4">
                 <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Articles</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{totalPosts}</p>
                </div>
                 <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Images</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{avgImages}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Days</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{activeDays}</p>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardCard;