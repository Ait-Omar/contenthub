import React from 'react';
import { VAPerformanceData, ChampionHistory } from '../types';

interface LeaderboardTableProps {
    rankedPerformanceData: VAPerformanceData[];
    championHistory: ChampionHistory;
    currentUserId?: string;
}

const RankMedal = ({ rank }: { rank: number }) => {
    const medalStyles = 'w-8 h-8';
    if (rank === 1) { // Gold
        return (
            <svg className={medalStyles} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L4 2H28L22 12H10Z" fill="#E53935"/>
                <circle cx="16" cy="20" r="8" fill="#FFD700"/>
                <circle cx="16" cy="20" r="5" stroke="#FFF" strokeWidth="1.5" fill="none"/>
            </svg>
        );
    }
    if (rank === 2) { // Silver
        return (
            <svg className={medalStyles} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L4 2H28L22 12H10Z" fill="#1E88E5"/>
                <circle cx="16" cy="20" r="8" fill="#C0C0C0"/>
                <circle cx="16" cy="20" r="5" stroke="#FFF" strokeWidth="1.5" fill="none"/>
            </svg>
        );
    }
    if (rank === 3) { // Bronze
        return (
            <svg className={medalStyles} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L4 2H28L22 12H10Z" fill="#43A047"/>
                <circle cx="16" cy="20" r="8" fill="#CD7F32"/>
                <circle cx="16" cy="20" r="5" stroke="#FFF" strokeWidth="1.5" fill="none"/>
            </svg>
        );
    }
    return <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-slate-500 dark:text-slate-400">{rank}</div>
};

const StarRating = ({ score }: { score: number }) => {
    const rating = Math.round((score / 100) * 5 * 2) / 2;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
    
    return (
        <div className="flex items-center justify-center" title={`${rating}/5 stars`}>
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d={starPath} /></svg>
            ))}
            {halfStar && (
                <div className="relative">
                    <svg className="w-5 h-5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20"><path d={starPath} /></svg>
                    <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d={starPath} /></svg>
                    </div>
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                 <svg key={`empty-${i}`} className="w-5 h-5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20"><path d={starPath} /></svg>
            ))}
        </div>
    );
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ rankedPerformanceData, championHistory, currentUserId }) => {
    const getChampionCount = (vaId: string) => {
        return Object.values(championHistory).filter(id => id === vaId).length;
    };

    const columns = [
        { title: 'Rank', className: 'w-16 text-center' },
        { title: 'VA Name', className: 'flex-1' },
        { title: 'Score', className: 'w-20 text-center' },
        { title: 'Rating', className: 'w-28 text-center' },
        { title: 'Articles', className: 'w-24 text-center' },
        { title: 'Avg Images', className: 'w-24 text-center' },
        { title: 'Active Days', className: 'w-24 text-center' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center px-6 py-3 bg-slate-50 dark:bg-slate-700/50">
                {columns.map(col => (
                    <div key={col.title} className={`${col.className} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider`}>
                        {col.title}
                    </div>
                ))}
            </div>

            {/* Body */}
            <div>
                {rankedPerformanceData.map((data) => {
                    const isCurrentUser = currentUserId === data.vaId;
                    const championCount = getChampionCount(data.vaId);
                    const breakdownTooltip = `Score Breakdown:\n- Articles: ${data.breakdown.articleScore}/50\n- Images: ${data.breakdown.imageScore}/25\n- Consistency: ${data.breakdown.consistencyScore}/25`;

                    return (
                        <div key={data.vaId} className={`flex items-center px-6 py-4 border-t border-slate-200 dark:border-slate-700 ${isCurrentUser ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                            <div className={`${columns[0].className} flex justify-center`}>
                                <RankMedal rank={data.rank} />
                            </div>
                            <div className={`${columns[1].className}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{data.vaName}</span>
                                    {isCurrentUser && <span className="text-xs font-semibold text-white bg-primary px-2 py-0.5 rounded-full">You</span>}
                                    {championCount > 0 && (
                                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-full" title={`Champion ${championCount} time(s)`}>
                                            <span className="text-sm" role="img" aria-label="champion trophy">🏆</span>
                                            <span className="text-xs font-bold text-yellow-800 dark:text-yellow-200">{championCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`${columns[2].className}`}>
                                <div className="group relative inline-block">
                                    <span className="font-bold text-primary cursor-help text-lg">{data.score}</span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-3 py-2 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10 whitespace-pre-wrap w-48 text-left">
                                        {breakdownTooltip}
                                    </div>
                                </div>
                            </div>
                            <div className={`${columns[3].className}`}>
                                <StarRating score={data.score} />
                            </div>
                            <div className={`${columns[4].className} text-sm text-slate-600 dark:text-slate-300`}>{data.totalPosts}</div>
                            <div className={`${columns[5].className} text-sm text-slate-600 dark:text-slate-300`}>{data.avgImages}</div>
                            <div className={`${columns[6].className} text-sm text-slate-600 dark:text-slate-300`}>{data.activeDays}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaderboardTable;
