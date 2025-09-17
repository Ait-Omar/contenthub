import React from 'react';
import { ArticleTask, WordPressSite, VirtualAssistant, Status } from '../types';
import KanbanCard from './KanbanCard';
import { STATUS_OPTIONS } from '../constants';

interface KanbanBoardProps {
  tasks: ArticleTask[];
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  onEditTask: (task: ArticleTask) => void;
  onUpdateTaskStatus: (task: ArticleTask) => void;
  selectedTaskIds: Set<string>;
  onToggleSelection: (taskId: string) => void;
  isAdmin: boolean;
}

const KanbanColumn: React.FC<{
  status: Status;
  title: string;
  tasks: ArticleTask[];
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  onEditTask: (task: ArticleTask) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: Status) => void;
  selectedTaskIds: Set<string>;
  onToggleSelection: (taskId: string) => void;
  isAdmin: boolean;
}> = ({ status, title, tasks, sites, vas, onEditTask, onDrop, selectedTaskIds, onToggleSelection, isAdmin }) => {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, status);
  };
  
  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-slate-100 dark:bg-slate-800 rounded-lg p-3 min-h-[300px] transition-colors ${isOver ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
    >
      <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider mb-4 px-1">{title} ({tasks.length})</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <KanbanCard
            key={task.id}
            task={task}
            blogName={sites.find(s => s.id === task.blogId)?.name || 'N/A'}
            vaName={task.vaId ? (vas.find(v => v.id === task.vaId)?.name || 'N/A') : 'Unassigned'}
            onEditTask={onEditTask}
            isSelected={selectedTaskIds.has(task.id)}
            onToggleSelection={onToggleSelection}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, sites, vas, onEditTask, onUpdateTaskStatus, selectedTaskIds, onToggleSelection, isAdmin }) => {
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Status) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const taskToMove = tasks.find(t => t.id === taskId);
      if (taskToMove && taskToMove.status !== newStatus) {
        const updatedTask = { ...taskToMove, status: newStatus };
        // When admin approves changes and moves task to published, clear feedback
        if (isAdmin && newStatus === 'published' && updatedTask.adminFeedback) {
          delete updatedTask.adminFeedback;
        }
        onUpdateTaskStatus(updatedTask);
      }
    }
  };
  
  const columns = STATUS_OPTIONS.filter(opt => opt.value !== 'archived');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      {columns.map(statusOption => (
        <KanbanColumn
          key={statusOption.value}
          status={statusOption.value}
          title={statusOption.label}
          tasks={tasks.filter(t => t.status === statusOption.value)}
          sites={sites}
          vas={vas}
          onEditTask={onEditTask}
          onDrop={handleDrop}
          selectedTaskIds={selectedTaskIds}
          onToggleSelection={onToggleSelection}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;