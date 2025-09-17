import React, { useState } from 'react';
import { Post, ArticleTask } from '../types';

interface PostListModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  title: string;
  tasks: ArticleTask[];
  onUpdateTask: (task: ArticleTask) => void;
}

const PostListModal: React.FC<PostListModalProps> = ({ isOpen, onClose, posts, title, tasks, onUpdateTask }) => {
  const [editingFeedback, setEditingFeedback] = useState('');
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleRequestChangesClick = (postLink: string) => {
      setActiveEditor(postLink);
      setEditingFeedback('');
  }

  const handleSendFeedback = (post: Post, task: ArticleTask) => {
    if (!editingFeedback || !task) return;

    const updatedTask: ArticleTask = {
        ...task,
        status: 'changes-requested',
        adminFeedback: editingFeedback,
    };
    onUpdateTask(updatedTask);
    setActiveEditor(null);
    setEditingFeedback('');
  };

  const Icon: React.FC<{ found: boolean; label: string }> = ({ found, label }) => {
    const titleText = `${label} ${found ? 'found' : 'not found'}`;
    const iconClass = `h-6 w-6 ${found ? 'text-green-500' : 'text-red-500'}`;
    const path = found
      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      // eslint-disable-next-line max-len
      : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z";
    
    return (
      <div className="group relative flex justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <title>{titleText}</title>
          <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10 whitespace-nowrap">
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-screen-xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Images</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recipe Details</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">FAQ</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {posts.map(post => {
                  const task = tasks.find(t => t.link === post.link && t.link);
                  return (
                  <tr key={post.link} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary dark:hover:text-indigo-400 hover:underline transition-colors" title={post.title}>
                        {post.title}
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{post.category}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-slate-600 dark:text-slate-300">{post.imageCount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex justify-center items-center gap-1.5">
                            <Icon found={post.hasIngredients} label="Ingredients" />
                            <Icon found={post.hasInstructions} label="Instructions" />
                            <Icon found={post.hasNotes} label="Notes" />
                            <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-1"></div>
                            <Icon found={post.hasPrepTime} label="Prep Time" />
                            <Icon found={post.hasCookTime} label="Cook Time" />
                            <Icon found={post.hasTotalTime} label="Total Time" />
                             <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-1"></div>
                            <Icon found={post.hasNutrition} label="Nutrition" />
                        </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <Icon found={post.hasFAQ} label="FAQ" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{formatDate(post.publishDate)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col items-start gap-2">
                        <a
                          href={`https://www.google.com/search?q=site:${encodeURIComponent(post.link)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                          title="Click to check if this URL is indexed on Google."
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                          Check Indexing
                        </a>
                        {activeEditor === post.link && task ? (
                          <div className="w-full space-y-2">
                            <textarea 
                              value={editingFeedback}
                              onChange={(e) => setEditingFeedback(e.target.value)}
                              placeholder="e.g. Please add more details to the intro..."
                              rows={2}
                              className="block w-full text-sm border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white"
                            />
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleSendFeedback(post, task)} className="text-xs font-semibold py-1 px-2 bg-primary text-white rounded-md hover:bg-primary-dark">Send</button>
                              <button onClick={() => setActiveEditor(null)} className="text-xs font-semibold py-1 px-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                            </div>
                          </div>
                        ) : task && task.status === 'published' ? (
                          <button onClick={() => handleRequestChangesClick(post.link)} className="inline-flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400 hover:underline text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                            Request Changes
                          </button>
                        ) : task && task.status === 'changes-requested' ? (
                          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400" title={task.adminFeedback}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.962 8.962 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.732 14.133A7.001 7.001 0 0010 15c3.313 0 6-2.686 6-6s-2.687-6-6-6-6 2.686-6 6c0 .76.12 1.493.343 2.175l.817-2.451a1 1 0 011.829.61l-1.002 3.006z" clipRule="evenodd" /></svg>
                            <span className="text-xs font-semibold">Feedback Sent</span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-white dark:bg-slate-600 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PostListModal;