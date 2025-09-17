import React from 'react';
import { ArticleTask } from '../types';

interface KanbanCardProps {
  task: ArticleTask;
  blogName: string;
  vaName: string;
  onEditTask: (task: ArticleTask) => void;
  isSelected: boolean;
  onToggleSelection: (taskId: string) => void;
  isAdmin: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, blogName, vaName, onEditTask, isSelected, onToggleSelection, isAdmin }) => {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
  };
  
  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className={`relative bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border mb-4 cursor-grab active:cursor-grabbing transition-all ${isSelected ? 'border-primary dark:border-primary shadow-lg ring-2 ring-primary' : 'border-slate-200 dark:border-slate-600'}`}
      aria-roledescription={`Task: ${task.topTitle}, status: ${task.status}`}
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10">
            <input 
                type="checkbox"
                className="h-5 w-5 text-primary focus:ring-primary border-slate-300 dark:border-slate-500 rounded bg-slate-100 dark:bg-slate-600"
                checked={isSelected}
                onChange={() => onToggleSelection(task.id)}
                onClick={(e) => e.stopPropagation()} 
                aria-label={`Select task ${task.topTitle}`}
            />
        </div>
      )}
      <a href={task.link || undefined} target="_blank" rel="noopener noreferrer" className={`font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 block truncate ${isAdmin ? 'pr-6' : ''} ${task.link ? 'hover:text-primary' : 'pointer-events-none'}`} title={task.topTitle}>
        {task.topTitle}
      </a>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate" title={task.annotatedInterests}>
          {task.annotatedInterests}
      </p>
      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>
          <span className="font-semibold text-slate-600 dark:text-slate-300">Blog:</span> {blogName}
        </p>
        <p>
          <span className="font-semibold text-slate-600 dark:text-slate-300">VA:</span> {vaName}
        </p>
        <p>
          <span className="font-semibold text-slate-600 dark:text-slate-300">Category:</span> <span className="font-medium text-red-600 dark:text-red-400">{task.category}</span>
        </p>
      </div>
      <div className="mt-3 flex justify-between items-center">
        {task.adminFeedback ? (
            <div className="group relative" title={task.adminFeedback}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.962 8.962 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.732 14.133A7.001 7.001 0 0010 15c3.313 0 6-2.686 6-6s-2.687-6-6-6-6 2.686-6 6c0 .76.12 1.493.343 2.175l.817-2.451a1 1 0 011.829.61l-1.002 3.006z" clipRule="evenodd" />
                </svg>
            </div>
        ) : <div />}
        <button 
          onClick={() => onEditTask(task)}
          className="text-xs text-primary-dark hover:underline font-semibold"
          aria-label={`Edit task ${task.topTitle}`}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default KanbanCard;