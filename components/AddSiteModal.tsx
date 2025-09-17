import React, { useState, useEffect } from 'react';
import { WordPressSite } from '../types';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSite: (site: Omit<WordPressSite, 'id' | 'createdAt'>, siteId?: string) => void;
  site: WordPressSite | null;
}

const AddSiteModal: React.FC<AddSiteModalProps> = ({ isOpen, onClose, onSaveSite, site }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');

  const isEditing = !!site;

  useEffect(() => {
    if (isOpen) {
        if (site) {
            setName(site.name);
            setUrl(site.url);
            setUsername(site.username);
            setAppPassword(site.appPassword);
        } else {
            setName('');
            setUrl('');
            setUsername('');
            setAppPassword('');
        }
    }
  }, [site, isOpen]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url && username && appPassword) {
      onSaveSite({ name, url, username, appPassword }, site?.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{isEditing ? 'Edit Site Details' : 'Add New WordPress Site'}</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="site-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site Name</label>
              <input type="text" id="site-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="site-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site URL</label>
              <input type="url" id="site-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">WordPress Username</label>
              <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="app-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Application Password</label>
              <input type="password" id="app-password" value={appPassword} onChange={e => setAppPassword(e.target.value)} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                This is not your main password. Generate one in your WordPress profile under Users &gt; Profile. 
                <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Learn more</a>.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-white dark:bg-slate-600 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">{isEditing ? 'Save Changes' : 'Add Site'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSiteModal;