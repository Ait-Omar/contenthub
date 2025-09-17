import React, { useState, useMemo, useEffect, useCallback } from 'react';
// FIX: Import LoggedInUser from types.ts to ensure type consistency.
import { ArticleTask, WordPressSite, VirtualAssistant, Status, User, LoggedInUser } from '../types';
import Filters from './Filters';
import ArticleTable from './ArticleTable';
import KanbanBoard from './KanbanBoard';
import ArticleModal from './ArticleModal';
import ImportTasksModal from './ImportTasksModal';
import BulkAssignModal from './BulkAssignModal';

// FIX: Removed local LoggedInUser type definition.

interface WorkflowPageProps {
  user: LoggedInUser;
  tasks: ArticleTask[];
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  onUpdateTask: (task: ArticleTask) => void;
  onAddTask: (task: Omit<ArticleTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBulkAddTask: (tasks: Omit<ArticleTask, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onDeleteTask: (taskId: string) => void;
  onBulkDeleteTasks: (taskIds: string[]) => void;
  onBulkUpdateTasks: (taskIds: string[], updates: Partial<Omit<ArticleTask, 'id'>>) => void;
}

type ViewMode = 'table' | 'kanban';

const WorkflowPage: React.FC<WorkflowPageProps> = ({ user, tasks, sites, vas, onUpdateTask, onAddTask, onBulkAddTask, onDeleteTask, onBulkDeleteTasks, onBulkUpdateTasks }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filters, setFilters] = useState<{ blogId: string; vaId: string; status: Status | 'all' }>({
    blogId: 'all',
    vaId: 'all',
    status: 'all',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ArticleTask | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  
  const isAdmin = user.role === 'admin';

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // VA's only see their tasks
      // FIX: Check user.role directly to narrow the type and safely access 'user.id'.
      if (user.role === 'va') {
          if (task.vaId !== user.id) return false;
      }
      
      const matchBlog = filters.blogId === 'all' || task.blogId === filters.blogId;
      const matchVa = filters.vaId === 'all' || task.vaId === filters.vaId;
      const matchStatus = filters.status === 'all' || task.status === filters.status;
      return matchBlog && matchVa && matchStatus;
    });
  }, [tasks, filters, user]);
  
  useEffect(() => {
    const visibleTaskIds = new Set(filteredTasks.map(t => t.id));
    setSelectedTaskIds(prevSelected => {
      const newSelected = new Set<string>();
      for (const id of prevSelected) {
        if (visibleTaskIds.has(id)) {
          newSelected.add(id);
        }
      }
      return newSelected;
    });
  }, [filteredTasks]);

  const handleEditTask = (task: ArticleTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const handleAddNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  }

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleSaveTask = (taskData: ArticleTask) => {
    if (selectedTask || taskData.id) {
      onUpdateTask({ ...selectedTask, ...taskData });
    } else {
      onAddTask(taskData as Omit<ArticleTask, 'id' | 'createdAt' | 'updatedAt'>);
    }
    handleCloseModal();
  };
  
  const handleDelete = useCallback((taskId: string) => {
    onDeleteTask(taskId);
    handleCloseModal();
  }, [onDeleteTask, handleCloseModal]);

  const handleToggleSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedTaskIds(prev => {
      const allVisibleIds = filteredTasks.map(t => t.id);
      const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => prev.has(id));
      
      const newSet = new Set(prev);
      if (allSelected) { // If all are selected, deselect all visible
        allVisibleIds.forEach(id => newSet.delete(id));
      } else { // Otherwise, select all visible
        allVisibleIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.size} task(s)?`)) {
        onBulkDeleteTasks(Array.from(selectedTaskIds));
        setSelectedTaskIds(new Set());
    }
  };

  const handleBulkAssign = (updates: Partial<Omit<ArticleTask, 'id'>>) => {
      if (selectedTaskIds.size === 0) return;
      onBulkUpdateTasks(Array.from(selectedTaskIds), updates);
      setIsAssignModalOpen(false);
      setSelectedTaskIds(new Set());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Content Workflow</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin ? "Manage your article pipeline from idea to publication." : "Here are your assigned tasks."}
          </p>
        </div>
        {isAdmin && (
            <div className="flex items-center gap-2">
                {selectedTaskIds.size > 0 ? (
                    <>
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="bg-blue-600 border border-transparent text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-md shadow-sm transition-colors"
                        >
                            Assign ({selectedTaskIds.size})
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 border border-transparent text-white hover:bg-red-700 font-bold py-2 px-4 rounded-md shadow-sm transition-colors"
                        >
                            Delete ({selectedTaskIds.size})
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-white dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 border border-primary text-primary hover:bg-indigo-50 font-bold py-2 px-4 rounded-md shadow-sm transition-colors"
                        >
                            Import Tasks
                        </button>
                        <button
                            onClick={handleAddNewTask}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors"
                        >
                            Add New Task
                        </button>
                    </>
                )}
            </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Filters sites={sites} vas={vas} currentFilters={filters} onFilterChange={setFilters} />
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-900 text-primary shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    Kanban
                </button>
                <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-gray-900 text-primary shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    Table
                </button>
                </div>
            </div>
        </div>
      )}

      <div className="mt-6">
        {viewMode === 'kanban' ? (
          <KanbanBoard 
            tasks={filteredTasks} 
            sites={sites} 
            vas={vas} 
            onEditTask={handleEditTask}
            onUpdateTaskStatus={onUpdateTask}
            selectedTaskIds={selectedTaskIds}
            onToggleSelection={handleToggleSelection}
            isAdmin={isAdmin}
          />
        ) : (
          <ArticleTable 
            tasks={filteredTasks} 
            sites={sites} 
            vas={vas} 
            onEditTask={handleEditTask}
            selectedTaskIds={selectedTaskIds}
            onToggleSelection={handleToggleSelection}
            onToggleSelectAll={handleToggleSelectAll}
          />
        )}
      </div>

      {isModalOpen && (
        <ArticleModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          onSave={handleSaveTask}
          onDelete={handleDelete}
          task={selectedTask}
          sites={sites}
          vas={vas}
          user={user}
        />
      )}
      
      {isAdmin && isImportModalOpen && (
        <ImportTasksModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={onBulkAddTask}
          sites={sites}
          vas={vas}
        />
      )}

      {isAdmin && isAssignModalOpen && (
        <BulkAssignModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            onAssign={handleBulkAssign}
            sites={sites}
            vas={vas}
            taskCount={selectedTaskIds.size}
        />
      )}

    </div>
  );
};

export default WorkflowPage;