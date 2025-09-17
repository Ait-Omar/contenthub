import React from 'react';
import { WordPressSite, VirtualAssistant, Status } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface FiltersProps {
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  currentFilters: { blogId: string, vaId: string, status: Status | 'all' };
  onFilterChange: (filters: { blogId: string, vaId: string, status: Status | 'all' }) => void;
}

const Filters: React.FC<FiltersProps> = ({ sites, vas, currentFilters, onFilterChange }) => {
  
  const handleFilterChange = (filterName: 'blogId' | 'vaId' | 'status', value: string) => {
    onFilterChange({ ...currentFilters, [filterName]: value as Status | 'all' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <select
        value={currentFilters.blogId}
        onChange={(e) => handleFilterChange('blogId', e.target.value)}
        className="w-full sm:w-auto px-4 py-2 border bg-white dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
      >
        <option value="all">All Blogs</option>
        {sites.map(site => (
          <option key={site.id} value={site.id}>{site.name}</option>
        ))}
      </select>
      <select
        value={currentFilters.vaId}
        onChange={(e) => handleFilterChange('vaId', e.target.value)}
        className="w-full sm:w-auto px-4 py-2 border bg-white dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
      >
        <option value="all">All VAs</option>
        {vas.map(va => (
          <option key={va.id} value={va.id}>{va.name}</option>
        ))}
      </select>
      <select
        value={currentFilters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        className="w-full sm:w-auto px-4 py-2 border bg-white dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
      >
        <option value="all">All Statuses</option>
        {STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default Filters;