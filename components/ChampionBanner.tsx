import React from 'react';
import { ChampionData } from '../types';

interface ChampionBannerProps {
  champion: ChampionData;
}

const ChampionBanner: React.FC<ChampionBannerProps> = ({ champion }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-300 to-orange-400 dark:from-yellow-600 dark:to-orange-600 text-slate-900 dark:text-white p-4 rounded-xl shadow-lg flex items-center gap-4">
      <div className="text-4xl animate-pulse">🏆</div>
      <div>
        <h3 className="font-bold text-lg">{champion.month} Champion</h3>
        <p className="text-sm">
          Congratulations to <span className="font-semibold">{champion.vaName}</span> with a winning score of <span className="font-bold">{champion.score}</span>!
        </p>
      </div>
    </div>
  );
};

export default ChampionBanner;