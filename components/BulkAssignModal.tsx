import React, { useState, useMemo } from 'react';
import { WordPressSite, VirtualAssistant } from '../types';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (updates: { blogId?: string | undefined, vaId?: string | undefined }) => void;
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  taskCount: number;
}

const BulkAssignModal: React.FC<BulkAssignModalProps> = ({ isOpen, onClose, onAssign, sites, vas, taskCount }) => {
  const [selectedBlogId, setSelectedBlogId] = useState<string>('nochange'); // 'nochange', 'unassign', or a site id
  const [selectedVaId, setSelectedVaId] = useState<string>('nochange'); // 'nochange', 'unassign', or a va id

  const filteredVAs = useMemo(() => {
    if (!selectedBlogId || selectedBlogId === 'nochange' || selectedBlogId === 'unassign') {
      return vas; // Show all VAs if no specific blog is being assigned
    }
    return vas.filter(v => v.siteIds.includes(selectedBlogId));
  }, [selectedBlogId, vas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { blogId?: string | undefined, vaId?: string | undefined } = {};

    if (selectedBlogId !== 'nochange') {
      updates.blogId = selectedBlogId === 'unassign' ? undefined : selectedBlogId;
    }
    if (selectedVaId !== 'nochange') {
      updates.vaId = selectedVaId === 'unassign' ? undefined : selectedVaId;
    }

    if (Object.keys(updates).length > 0) {
        onAssign(updates);
    } else {
        onClose();
    }
  };

  const handleBlogChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlogId = e.target.value;
    setSelectedBlogId(newBlogId);
    // When blog changes, reset VA selection to avoid assigning a VA to an invalid blog.
    setSelectedVaId('nochange');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Bulk Assign Tasks</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Assign {taskCount} selected task(s) to a new blog and/or VA.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="bulk-assign-blog" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to Blog</label>
              <select id="bulk-assign-blog" value={selectedBlogId} onChange={handleBlogChange} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white">
                <option value="nochange">--- Don't Change ---</option>
                <option value="unassign">Unassign Blog</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bulk-assign-va" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign to VA</label>
              <select id="bulk-assign-va" value={selectedVaId} onChange={e => setSelectedVaId(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white">
                <option value="nochange">--- Don't Change ---</option>
                <option value="unassign">Unassign VA</option>
                {filteredVAs.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
               {selectedBlogId !== 'nochange' && selectedBlogId !== 'unassign' && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Showing VAs available for the selected blog.</p>
               )}
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-white dark:bg-slate-600 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Apply Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAssignModal;
