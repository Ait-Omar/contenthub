import React from 'react';
import { VAPerformanceData } from '../types';

// FIX: The import for PerformanceMetric was incorrect as it's not exported from WorkflowPage.
// The type is now derived from VAPerformanceData from the main types file to ensure consistency,
// and extended to include `totalVAs` as required by the component.
type PerformanceMetric = Pick<VAPerformanceData, 'rank' | 'score' | 'breakdown'> & {
  totalVAs: number;
};

const VAPerformanceBanner: React.FC<PerformanceMetric> = ({ rank, score, totalVAs, breakdown }) => {

  const getStarRating = (s: number): string => {
    const rating = Math.round((s / 100) * 5); // scale 0-100 to 0-5
    if (rating === 0 && s > 0) return '⭐☆☆☆☆'; // Give at least one star for any effort
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const breakdownTooltip = `
    Score Breakdown:
    - Articles: ${breakdown.articleScore}/50
    - Images: ${breakdown.imageScore}/25
    - Consistency: ${breakdown.consistencyScore}/25
  `;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Monthly Performance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Rating based on articles, images & consistency.</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Rank</div>
                    <div className="text-2xl font-bold text-primary">{rank}<span className="text-lg text-slate-400 dark:text-slate-500">/{totalVAs}</span></div>
                </div>
                <div className="text-center group relative">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Score</div>
                    <div className="text-2xl font-bold text-primary cursor-help">{score}</div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-3 py-2 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10 whitespace-pre-wrap w-48 text-left">
                        {breakdownTooltip}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Rating</div>
                    <div className="text-2xl" title={`${score}/100`}>{getStarRating(score)}</div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VAPerformanceBanner;