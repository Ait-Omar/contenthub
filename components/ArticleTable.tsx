import React from 'react';
import { ArticleTask, WordPressSite, VirtualAssistant } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface ArticleTableProps {
  tasks: ArticleTask[];
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  onEditTask: (task: ArticleTask) => void;
  selectedTaskIds: Set<string>;
  onToggleSelection: (taskId: string) => void;
  onToggleSelectAll: () => void;
}

const ArticleTable: React.FC<ArticleTableProps> = ({ tasks, sites, vas, onEditTask, selectedTaskIds, onToggleSelection, onToggleSelectAll }) => {
  const getSiteName = (siteId?: string) => siteId ? (sites.find(s => s.id === siteId)?.name || 'N/A') : 'Unassigned';
  const getVaName = (vaId?: string) => vaId ? (vas.find(v => v.id === vaId)?.name || 'N/A') : 'Unassigned';
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
  };
  
  const allVisibleSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.has(t.id));

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-500 rounded bg-slate-100 dark:bg-slate-600"
                  checked={allVisibleSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all tasks"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Task</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Blog</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">VA</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {tasks.map(task => {
              const isSelected = selectedTaskIds.has(task.id);
              const statusOption = STATUS_OPTIONS.find(opt => opt.value === task.status);
              return (
                <tr key={task.id} className={`transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-500 rounded bg-slate-100 dark:bg-slate-600"
                      checked={isSelected}
                      onChange={() => onToggleSelection(task.id)}
                      aria-label={`Select task ${task.topTitle}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-normal max-w-sm">
                    <a href={task.link || undefined} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium text-slate-900 dark:text-slate-100 truncate block ${task.link ? 'hover:text-primary dark:hover:text-indigo-400' : 'pointer-events-none'}`} title={task.topTitle}>
                      {task.topTitle || 'Untitled'}
                    </a>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={task.annotatedInterests}>
                      {task.annotatedInterests}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{task.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{getSiteName(task.blogId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{getVaName(task.vaId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusOption?.color}`}>
                          {statusOption?.label}
                        </span>
                        {task.adminFeedback && (
                            <div className="group relative" title={task.adminFeedback}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.962 8.962 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.732 14.133A7.001 7.001 0 0010 15c3.313 0 6-2.686 6-6s-2.687-6-6-6-6 2.686-6 6c0 .76.12 1.493.343 2.175l.817-2.451a1 1 0 011.829.61l-1.002 3.006z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{formatDate(task.updatedAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onEditTask(task)} className="text-primary hover:text-primary-dark font-semibold">Details</button>
                  </td>
                </tr>
              );
            })}
             {tasks.length === 0 && (
                <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No tasks match the current filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleTable;