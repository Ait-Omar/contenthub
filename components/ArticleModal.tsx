import React, { useState, useEffect, useMemo } from 'react';
// FIX: Import LoggedInUser from types.ts to ensure type consistency.
import { ArticleTask, WordPressSite, VirtualAssistant, Status, User, LoggedInUser } from '../types';
import * as geminiService from '../services/geminiService';
import StatusSelector from './StatusSelector';

// FIX: Removed local LoggedInUser type definition.

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ArticleTask) => void;
  onDelete: (taskId: string) => void;
  task: ArticleTask | null;
  sites: WordPressSite[];
  vas: VirtualAssistant[];
  user: LoggedInUser;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button type="button" onClick={handleCopy} className="mt-1 px-3 py-2 bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md text-sm font-semibold disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-500 w-24 text-center">
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

const ArticleModal: React.FC<ArticleModalProps> = ({ isOpen, onClose, onSave, onDelete, task, sites, vas, user }) => {
  const [formData, setFormData] = useState<Partial<ArticleTask>>({
    keywords: [],
    link: '',
    board: '',
    annotatedInterests: '',
    titleOptions: [],
    topTitle: '',
    category: '',
    blogId: '',
    vaId: '',
    status: 'idea',
  });
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState('');

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (task) {
      setFormData(task);
      setFeedback(task.adminFeedback || '');
    } else {
      const initialBlogId = sites[0]?.id || '';
      const initialVAs = vas.filter(v => v.siteIds.includes(initialBlogId));
      setFormData({
        keywords: [], link: '', board: '', annotatedInterests: '', titleOptions: [], topTitle: '',
        category: '', blogId: initialBlogId, vaId: initialVAs[0]?.id || '', status: 'idea'
      });
      setFeedback('');
    }
  }, [task, sites, vas, isOpen]);

  const filteredVAs = useMemo(() => {
    if (!formData.blogId) return [];
    return vas.filter(v => v.siteIds.includes(formData.blogId));
  }, [formData.blogId, vas]);


  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'blogId') {
      const newVAsForBlog = vas.filter(v => v.siteIds.includes(value));
      setFormData({ ...formData, blogId: value, vaId: newVAsForBlog[0]?.id || '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleStatusChange = (newStatus: Status) => {
      setFormData({ ...formData, status: newStatus });
  };

  const handleGenerate = async (type: 'keywords' | 'title') => {
    setIsGenerating(prev => ({ ...prev, [type]: true }));
    try {
        if (type === 'keywords' && formData.annotatedInterests) {
            const keywords = await geminiService.generateKeywords(formData.annotatedInterests);
            setFormData(prev => ({ ...prev, keywords }));
        }
        if (type === 'title' && formData.keywords && formData.keywords.length > 0) {
            const title = await geminiService.generateTitle(formData.keywords.join(', '));
            setFormData(prev => ({ ...prev, topTitle: title, titleOptions: [...(prev.titleOptions || []), title] }));
        }
    } catch (error) {
        console.error(`Error generating ${type}`, error);
    }
    setIsGenerating(prev => ({ ...prev, [type]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    
    // When an admin is moving a task to 'published', we should clear any feedback.
    if (isAdmin && finalData.status === 'published' && task?.status !== 'published') {
        finalData.adminFeedback = undefined;
    }
    
    onSave(finalData as ArticleTask);
  };

  const handleRequestChanges = () => {
    if (!feedback) {
        alert("Please provide feedback before requesting changes.");
        return;
    }
    const finalData = { ...formData, status: 'changes-requested' as Status, adminFeedback: feedback };
    onSave(finalData as ArticleTask);
  };
  
  const handleDeleteClick = () => {
    if (task?.id) {
      onDelete(task.id);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{task ? 'Edit Task' : 'Add New Task'}</h3>
            <button type="button" onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
             {formData.adminFeedback && (
                 <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
                     <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Admin Feedback</h4>
                     <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">{formData.adminFeedback}</p>
                 </div>
             )}
             <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Keywords</label>
              <div className="flex items-start gap-2">
                <textarea id="keywords" name="keywords" value={formData.keywords?.join(', ')} onChange={(e) => setFormData({...formData, keywords: e.target.value.split(',').map(k => k.trim())})} rows={2} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
                <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => handleGenerate('keywords')} disabled={!formData.annotatedInterests || isGenerating.keywords} className="mt-1 px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 rounded-md text-sm font-semibold disabled:opacity-50">
                        {isGenerating.keywords ? '...' : 'Gen'}
                    </button>
                    <CopyButton textToCopy={formData.keywords?.join(', ') || ''} />
                </div>
              </div>
            </div>

            <div>
                <label htmlFor="annotatedInterests" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Annotated Interests</label>
                <div className="flex items-start gap-2">
                    <input type="text" id="annotatedInterests" name="annotatedInterests" value={formData.annotatedInterests} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" disabled={!isAdmin}/>
                    <CopyButton textToCopy={formData.annotatedInterests || ''} />
                </div>
            </div>

            <div>
              <label htmlFor="topTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Top Title</label>
               <div className="flex items-start gap-2">
                <input type="text" id="topTitle" name="topTitle" value={formData.topTitle} onChange={handleChange} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
                 <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => handleGenerate('title')} disabled={!formData.keywords?.length || isGenerating.title} className="mt-1 px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 rounded-md text-sm font-semibold disabled:opacity-50">
                        {isGenerating.title ? '...' : 'Gen'}
                    </button>
                    <CopyButton textToCopy={formData.topTitle || ''} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Link</label>
                <input type="text" id="link" name="link" value={formData.link} onChange={handleChange} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" disabled={!isAdmin}/>
              </div>
              <div>
                <label htmlFor="board" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Board</label>
                <input type="text" id="board" name="board" value={formData.board} onChange={handleChange} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" disabled={!isAdmin}/>
              </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category Recipes</label>
                  <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" disabled={!isAdmin}/>
                </div>
               <div>
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <div className="mt-1">
                      <StatusSelector currentStatus={formData.status || 'idea'} onChange={handleStatusChange} />
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="blogId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Blog</label>
                  <select id="blogId" name="blogId" value={formData.blogId || ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary disabled:bg-slate-100 bg-white dark:bg-slate-700 dark:text-white" disabled={!isAdmin}>
                    <option value="" disabled>Select a blog</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                 <div>
                  <label htmlFor="vaId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">VA</label>
                  <select id="vaId" name="vaId" value={formData.vaId} onChange={handleChange} required disabled={!formData.blogId || !isAdmin} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary disabled:bg-slate-100 bg-white dark:bg-slate-700 dark:text-white">
                    <option value="" disabled>Select a VA</option>
                    {filteredVAs.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
             </div>
             {isAdmin && task?.status === 'published' && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <label htmlFor="admin-feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Feedback / Changes to Request</label>
                    <textarea 
                        id="admin-feedback" 
                        rows={3} 
                        className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" 
                        placeholder="e.g., Please add more images to the instructions section."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">If you fill this out, the task will be reassigned to the VA with the status "Changes Requested".</p>
                </div>
             )}
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
            <div>
              {task && isAdmin && (
                <button type="button" onClick={handleDeleteClick} className="py-2 px-4 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Delete
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-white dark:bg-slate-600 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
              {isAdmin && task?.status === 'published' ? (
                <button 
                    type="button" 
                    onClick={handleRequestChanges} 
                    disabled={!feedback}
                    className="py-2 px-4 bg-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                    Request Changes
                </button>
              ) : (
                <button type="submit" className="py-2 px-4 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Save Task</button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleModal;