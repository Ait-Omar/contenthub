

import React, { useState, useEffect } from 'react';
import { WordPressSite, VirtualAssistant, WordPressAuthor, User, AuthorLink } from '../types';
import AddSiteModal from './AddSiteModal';
import VAModal from './VAModal';
import AddAdminModal from './AddAdminModal';
import { fetchAuthorsForSite } from '../services/wordpressService';

interface HubPageProps {
  user: User;
  sites: WordPressSite[];
  setSites: React.Dispatch<React.SetStateAction<WordPressSite[]>>;
  vas: VirtualAssistant[];
  setVas: React.Dispatch<React.SetStateAction<VirtualAssistant[]>>;
  allUsers: (User | VirtualAssistant)[];
  onAddAdmin: (username: string, password: string, email: string) => Promise<{success: boolean, error?: string}>;
  onSaveVA: (vaData: Omit<VirtualAssistant, 'id' | 'createdAt' | 'role' | 'adminUsername' | 'passwordHash' | 'salt'> & {password?: string}, isEditing: boolean, existingVA: VirtualAssistant | null) => Promise<{success: boolean, error?: string}>;
  onDeleteUser: (username: string) => void;
}

const HubPage: React.FC<HubPageProps> = ({ user, sites, setSites, vas, setVas, allUsers, onAddAdmin, onSaveVA, onDeleteUser }) => {
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<WordPressSite | null>(null);
  
  const [isVAModalOpen, setIsVAModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedVA, setSelectedVA] = useState<VirtualAssistant | null>(null);
  const [authorsBySite, setAuthorsBySite] = useState<Record<string, WordPressAuthor[]>>({});
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);
  const [authorErrors, setAuthorErrors] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<'sites' | 'team'>('sites');

  useEffect(() => {
    const loadAuthors = async () => {
      if (sites.length === 0) {
        setAuthorsBySite({});
        setAuthorErrors({});
        setIsLoadingAuthors(false);
        return;
      }
      setIsLoadingAuthors(true);
      const newAuthorData: Record<string, WordPressAuthor[]> = {};
      const newAuthorErrors: Record<string, string> = {};

      await Promise.all(sites.map(async (site) => {
        try {
          const authors = await fetchAuthorsForSite(site);
          newAuthorData[site.id] = authors;
        } catch (error) {
          if (error instanceof Error) {
            newAuthorErrors[site.id] = error.message;
          } else {
            newAuthorErrors[site.id] = "An unknown error occurred.";
          }
        }
      }));

      setAuthorsBySite(newAuthorData);
      setAuthorErrors(newAuthorErrors);
      setIsLoadingAuthors(false);
    };
    loadAuthors();
  }, [sites]);
  
  const openSiteModal = (site: WordPressSite | null) => {
    setEditingSite(site);
    setIsSiteModalOpen(true);
  };

  const handleSaveSite = (siteData: Omit<WordPressSite, 'id' | 'createdAt'>, siteId?: string) => {
    if (siteId) {
        // Update existing site
        setSites(prevSites => prevSites.map(s => s.id === siteId ? { ...s, ...siteData } : s));
    } else {
        // Add new site
        const newSite: WordPressSite = {
            ...siteData,
            id: new Date().toISOString() + Math.random(),
            createdAt: new Date().toISOString(),
        };
        setSites(prev => [...prev, newSite]);
    }
    setIsSiteModalOpen(false);
    setEditingSite(null);
  };
  
 const handleDeleteSite = (siteId: string) => {
    const orphanedVAs = vas.filter(va => va.siteIds.includes(siteId) && va.siteIds.length === 1);

    let confirmMessage = 'Are you sure you want to delete this site? This will unlink it from any associated VAs.';
    
    if (orphanedVAs.length > 0) {
        const vaNames = orphanedVAs.map(va => va.name).join(', ');
        confirmMessage += `\n\nWARNING: The following VA account(s) are only linked to this site and will be permanently deleted: ${vaNames}.`;
    }

    if (window.confirm(confirmMessage)) {
        const vaUsernamesToDelete = orphanedVAs.map(va => va.username);

        setSites(prevSites => prevSites.filter(s => s.id !== siteId));
        const updatedVAs = vas
            .map(va => ({
                ...va,
                siteIds: va.siteIds.filter(id => id !== siteId),
                authorLinks: va.authorLinks.filter(link => link.siteId !== siteId),
            }))
            .filter(va => va.siteIds.length > 0); 
        setVas(updatedVAs);
        
        vaUsernamesToDelete.forEach(username => onDeleteUser(username));
    }
  };

  const handleSaveVAWrapper = async (vaData: Omit<VirtualAssistant, 'id' | 'createdAt' | 'role' | 'adminUsername' | 'passwordHash' | 'salt'> & {password?: string}, isEditing: boolean) => {
      const result = await onSaveVA(vaData, isEditing, selectedVA);
      if (result.success) {
          setIsVAModalOpen(false);
          setSelectedVA(null);
      } else {
          alert(result.error);
      }
  };

  const handleAddAdminWrapper = async (username: string, password: string, email: string) => {
    const result = await onAddAdmin(username, password, email);
    if (result.success) {
        setIsAdminModalOpen(false);
    } else {
        alert(result.error);
    }
  };
  
  const handleDeleteUserWrapper = (usernameToDelete: string) => {
    if (usernameToDelete === user.username) {
        alert("You cannot delete your own account.");
        return;
    }

    if (window.confirm(`Are you sure you want to delete the user "${usernameToDelete}"? This action cannot be undone.`)) {
        onDeleteUser(usernameToDelete);
    }
  };
  
  const openVAModal = (va?: VirtualAssistant) => {
    setSelectedVA(va || null);
    setIsVAModalOpen(true);
  };

  const hasErrors = Object.keys(authorErrors).length > 0;

  return (
    <>
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hub</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your connected sites and user accounts.</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                onClick={() => setActiveTab('sites')}
                className={`${
                    activeTab === 'sites'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                Sites
                </button>
                <button
                onClick={() => setActiveTab('team')}
                className={`${
                    activeTab === 'team'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                Team
                </button>
            </nav>
        </div>

        <div className="mt-6">
            {activeTab === 'sites' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Connected WordPress Sites</h3>
                        <button onClick={() => openSiteModal(null)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors">
                        Add Site
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                            <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Site Details</th>
                            <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">URL</th>
                            <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {sites.map(site => {
                            const error = authorErrors[site.id];
                            return (
                                <tr key={site.id}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{site.name}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{site.username}</div>
                                    {error && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs whitespace-normal">{error}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{site.url}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {isLoadingAuthors && !error ? (
                                        <span className="text-slate-500 dark:text-slate-400">Checking...</span>
                                    ) : error ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                                            Failed
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                            Connected
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right space-x-4">
                                    <button onClick={() => openSiteModal(site)} className="text-primary hover:text-primary-dark text-sm font-semibold">Edit</button>
                                    <button onClick={() => handleDeleteSite(site.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Delete</button>
                                </td>
                                </tr>
                            )
                            })}
                            {sites.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-slate-500 dark:text-slate-400">No sites connected.</td></tr>}
                        </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'team' && (
                <div className="space-y-8">
                    {/* Virtual Assistants Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Virtual Assistant Accounts</h3>
                            <button onClick={() => openVAModal()} disabled={sites.length === 0 || hasErrors} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Add VA
                            </button>
                        </div>
                        {hasErrors && (
                            <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-md" role="alert">
                                <p className="font-bold">Action Required</p>
                                <p>One or more sites have a connection failure. Please edit the site(s) marked as "Failed" above and correct their credentials before adding a new VA.</p>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">VA Details</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Username</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Linked Sites & Authors</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {vas.map(va => {
                                const vaSiteErrors: { siteName: string; error: string }[] = [];
                                    va.siteIds.forEach(siteId => {
                                        if (authorErrors[siteId]) {
                                        const siteName = sites.find(s => s.id === siteId)?.name || 'Unknown Site';
                                        vaSiteErrors.push({ siteName, error: authorErrors[siteId] });
                                        }
                                    });
                                    const hasVaErrors = vaSiteErrors.length > 0;
                                    const tooltipText = hasVaErrors ? vaSiteErrors.map(e => `${e.siteName}: ${e.error}`).join('\n') : 'All linked sites are connected.';

                                return (
                                <tr key={va.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{va.name}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{va.email}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{va.username}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-2" title={tooltipText}>
                                        {isLoadingAuthors ? (
                                        <>
                                            <span className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-pulse"></span>
                                            <span className="text-slate-500 dark:text-slate-400">Checking...</span>
                                        </>
                                        ) : hasVaErrors ? (
                                        <>
                                            <span className="h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                                            <span className="text-red-700 dark:text-red-300">Failed</span>
                                        </>
                                        ) : (
                                        <>
                                            <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span>
                                            <span className="text-green-700 dark:text-green-300">Connected</span>
                                        </>
                                        )}
                                    </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                    {va.authorLinks.length > 0 ? (
                                        va.authorLinks.map(link => (
                                        <div key={link.siteId} className="truncate">
                                            <span className="font-semibold">{sites.find(s => s.id === link.siteId)?.name || 'N/A'}:</span>
                                            <span className="ml-1">{link.authorName}</span>
                                        </div>
                                        ))
                                    ) : (
                                        <span>No sites linked</span>
                                    )}
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-4">
                                        <button onClick={() => openVAModal(va)} className="text-primary hover:text-primary-dark text-sm font-semibold">Edit</button>
                                        <button onClick={() => handleDeleteUserWrapper(va.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Delete</button>
                                    </td>
                                </tr>
                                )})}
                                {vas.length === 0 && !hasErrors && <tr><td colSpan={5} className="text-center py-4 text-slate-500 dark:text-slate-400">No VA accounts created.</td></tr>}
                            </tbody>
                            </table>
                            {sites.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You must add a site before you can add a Virtual Assistant.</p>}
                            {hasErrors && <p className="text-xs text-yellow-800 dark:text-yellow-400 mt-2">Cannot add new VAs until all site connection errors are resolved.</p>}
                        </div>
                    </div>

                    {/* Admin Accounts Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Admin Accounts</h3>
                            <button onClick={() => setIsAdminModalOpen(true)} className="bg-secondary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors">
                            Add Admin
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Admin Details</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {/* FIX: Filtering 'allUsers' instead of 'vas' to correctly list admin accounts. */}
                                {allUsers.filter(u => u.role === 'admin').map(adminUser => (
                                <tr key={adminUser.username}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{adminUser.username}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{(adminUser as User).email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                        onClick={() => handleDeleteUserWrapper(adminUser.username!)} 
                                        className="text-red-600 hover:text-red-800 text-sm font-semibold disabled:text-slate-400 disabled:cursor-not-allowed"
                                        disabled={adminUser.username === user.username}
                                        >
                                        Delete
                                        </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
      <AddSiteModal 
        isOpen={isSiteModalOpen} 
        onClose={() => { setIsSiteModalOpen(false); setEditingSite(null); }} 
        onSaveSite={handleSaveSite} 
        site={editingSite} 
      />
      {isVAModalOpen && (
        <VAModal 
          isOpen={isVAModalOpen} 
          onClose={() => {setIsVAModalOpen(false); setSelectedVA(null);}} 
          onSave={handleSaveVAWrapper} 
          va={selectedVA}
          sites={sites}
          authorsBySite={authorsBySite}
          isLoadingAuthors={isLoadingAuthors}
        />
      )}
      <AddAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAddAdmin={handleAddAdminWrapper}
       />
    </>
  );
};

export default HubPage;