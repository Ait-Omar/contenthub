import React, { useState, useEffect } from 'react';
import { VirtualAssistant, WordPressSite, WordPressAuthor, AuthorLink } from '../types';

interface VAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (va: Omit<VirtualAssistant, 'id' | 'createdAt' | 'role' | 'adminUsername' | 'passwordHash' | 'salt'> & { password?: string }, isEditing: boolean) => void;
  va: VirtualAssistant | null;
  sites: WordPressSite[];
  authorsBySite: Record<string, WordPressAuthor[]>;
  isLoadingAuthors: boolean;
}

const VAModal: React.FC<VAModalProps> = ({ isOpen, onClose, onSave, va, sites, authorsBySite, isLoadingAuthors }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<Record<string, number | ''>>({});

  const isEditing = !!va;

  useEffect(() => {
    if (isOpen) {
        if (va) {
            setName(va.name);
            setUsername(va.username);
            setEmail(va.email || '');
            setPassword(''); // Don't pre-fill password for security
            setSelectedSiteIds(va.siteIds);
            const initialAuthorIds = va.authorLinks.reduce((acc, link) => {
                acc[link.siteId] = link.authorId;
                return acc;
            }, {} as Record<string, number | '' >);
            setSelectedAuthorIds(initialAuthorIds);
        } else {
            setName('');
            setUsername('');
            setEmail('');
            setPassword('');
            setSelectedSiteIds([]);
            setSelectedAuthorIds({});
        }
    }
  }, [va, isOpen]);

  if (!isOpen) return null;
  
  const handleSiteSelectionChange = (siteId: string) => {
    const newSelectedSiteIds = [...selectedSiteIds];
    const newSelectedAuthorIds = {...selectedAuthorIds};
    
    const index = newSelectedSiteIds.indexOf(siteId);

    if (index > -1) {
        // Deselecting
        newSelectedSiteIds.splice(index, 1);
        delete newSelectedAuthorIds[siteId];
    } else {
        // Selecting
        newSelectedSiteIds.push(siteId);
        // Pre-select first author if available
        newSelectedAuthorIds[siteId] = authorsBySite[siteId]?.[0]?.id || '';
    }
    
    setSelectedSiteIds(newSelectedSiteIds);
    setSelectedAuthorIds(newSelectedAuthorIds);
  };

  const handleAuthorChange = (siteId: string, authorId: string) => {
    setSelectedAuthorIds(prev => ({
        ...prev,
        [siteId]: Number(authorId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || !username || !email || selectedSiteIds.length === 0) {
        alert("Please fill out the name, username, email, and select at least one site.");
        return;
    }
    if (!isEditing && !password) {
        alert("Password is required for new accounts.");
        return;
    }
    for (const siteId of selectedSiteIds) {
        if (!selectedAuthorIds[siteId]) {
            const siteName = sites.find(s => s.id === siteId)?.name || siteId;
            alert(`Please select an author for the site: ${siteName}`);
            return;
        }
    }

    const authorLinks: AuthorLink[] = selectedSiteIds.map(siteId => {
        const authorId = selectedAuthorIds[siteId];
        const author = authorsBySite[siteId]?.find(a => a.id === authorId);
        if (!author) return null;
        return {
            siteId,
            authorId: author.id,
            authorName: author.name
        };
    }).filter((link): link is AuthorLink => link !== null);

    const vaPayload: Omit<VirtualAssistant, 'id' | 'createdAt' | 'role' | 'adminUsername' | 'passwordHash' | 'salt'> & { password?: string } = { 
        name, 
        username,
        email,
        siteIds: selectedSiteIds,
        authorLinks,
    };

    if (password) {
        vaPayload.password = password;
    }

    onSave(vaPayload, isEditing);
  };

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{va ? 'Edit' : 'Add New'} VA Account</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create a user account for a VA and link it to WordPress authors.</p>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="va-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">VA's Display Name</label>
              <input type="text" id="va-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
            </div>
             <div>
              <label htmlFor="va-username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <input type="text" id="va-username" value={username} onChange={e => setUsername(e.target.value)} required disabled={isEditing} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="va-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" id="va-email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="va-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input type="password" id="va-password" value={password} onChange={e => setPassword(e.target.value)} required={!isEditing} placeholder={isEditing ? 'Enter new password to change' : ''} className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" />
            </div>
            
            <div className="border-t dark:border-slate-700 pt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Link to WordPress Sites</label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border border-slate-300 dark:border-slate-600 p-3 rounded-md bg-slate-50 dark:bg-slate-900/50">
                {sites.map(site => (
                    <div key={site.id} className="flex items-center">
                    <input
                        id={`site-${site.id}`}
                        type="checkbox"
                        checked={selectedSiteIds.includes(site.id)}
                        onChange={() => handleSiteSelectionChange(site.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-500 rounded bg-slate-100 dark:bg-slate-600"
                    />
                    <label htmlFor={`site-${site.id}`} className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">{site.name}</label>
                    </div>
                ))}
              </div>
            </div>

            {selectedSiteIds.length > 0 && (
                 <div className="border-t dark:border-slate-700 pt-4 space-y-4">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Link to WordPress Authors</h4>
                    {selectedSiteIds.map(siteId => {
                        const site = sites.find(s => s.id === siteId);
                        const authors = authorsBySite[siteId] || [];
                        return (
                            <div key={siteId}>
                                <label htmlFor={`author-${siteId}`} className="block text-sm font-medium text-slate-600 dark:text-slate-400">{site?.name}</label>
                                <select 
                                    id={`author-${siteId}`} 
                                    value={selectedAuthorIds[siteId]} 
                                    onChange={(e) => handleAuthorChange(siteId, e.target.value)} 
                                    required 
                                    className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary disabled:bg-slate-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                                    disabled={isLoadingAuthors || authors.length === 0}
                                >
                                    {isLoadingAuthors && <option>Loading authors...</option>}
                                    {!isLoadingAuthors && authors.length === 0 && <option>No authors found for this site.</option>}
                                    {authors.map(author => (
                                        <option key={author.id} value={author.id}>{author.name}</option>
                                    ))}
                                </select>
                            </div>
                        )
                    })}
                 </div>
            )}
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 border-t dark:border-slate-700">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-white dark:bg-slate-600 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Save VA</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VAModal;