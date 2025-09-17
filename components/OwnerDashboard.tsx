import React, { useState, useEffect, useMemo } from 'react';
import { User, VirtualAssistant, WordPressSite, ArticleTask } from '../types';

interface OwnerDashboardProps {
  allUsers: (User | VirtualAssistant)[];
  setAllUsers: React.Dispatch<React.SetStateAction<(User | VirtualAssistant)[]>>;
}

interface AdminStat {
    username: string;
    siteCount: number;
    vaCount: number;
    taskCount: number;
    storageKB: number;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="bg-primary/10 dark:bg-primary/20 text-primary p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ allUsers, setAllUsers }) => {
    const [adminStats, setAdminStats] = useState<AdminStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const admins = allUsers.filter(u => u.role === 'admin') as User[];
        const stats: AdminStat[] = admins.map(admin => {
            const adminVAs = allUsers.filter(u => u.role === 'va' && (u as VirtualAssistant).adminUsername === admin.username);
            
            let storageBytes = 0;
            let siteCount = 0;
            let taskCount = 0;

            try {
                // Try reading from metadata first
                const metadataString = localStorage.getItem(`contentHubMetadata_${admin.username}`);
                if (metadataString) {
                    const metadata = JSON.parse(metadataString);
                    siteCount = metadata.sites || 0;
                    taskCount = metadata.tasks || 0;
                } else {
                    // Fallback for site count if metadata doesn't exist.
                    const siteIds = new Set((adminVAs as VirtualAssistant[]).flatMap(va => va.siteIds));
                    siteCount = siteIds.size;
                }
                
                // Estimate storage size from the string length of stored items
                const dataString = localStorage.getItem(`contentHubData_${admin.username}`);
                const historyString = localStorage.getItem(`contentHubChampionHistory_${admin.username}`);
                const keysString = localStorage.getItem(`contentHubKeys_${admin.username}`);

                if (dataString) storageBytes += dataString.length;
                if (historyString) storageBytes += historyString.length;
                if (keysString) storageBytes += keysString.length;
                if (metadataString) storageBytes += metadataString.length;

            } catch (e) {
                console.error(`Failed to get data for admin ${admin.username}`, e);
            }

            return {
                username: admin.username,
                siteCount: siteCount,
                vaCount: adminVAs.length,
                taskCount: taskCount,
                storageKB: parseFloat((storageBytes / 1024).toFixed(2)),
            };
        });

        setAdminStats(stats.sort((a,b) => b.storageKB - a.storageKB));
        setIsLoading(false);
    }, [allUsers]);
    
    const summary = useMemo(() => {
        const totalAdmins = adminStats.length;
        const totalStorage = adminStats.reduce((sum, admin) => sum + admin.storageKB, 0);
        return {
            totalAdmins,
            totalStorageMB: (totalStorage / 1024).toFixed(2)
        };
    }, [adminStats]);

    const handleDeleteAdmin = (adminUsername: string) => {
        const vasToDelete = allUsers
            .filter(u => u.role === 'va' && (u as VirtualAssistant).adminUsername === adminUsername)
            .map(u => u.username);

        const usersToKeep = allUsers.filter(u => u.username !== adminUsername && !vasToDelete.includes(u.username));
        setAllUsers(usersToKeep);
        
        // Clean up all localStorage items for the admin
        localStorage.removeItem(`contentHubData_${adminUsername}`);
        localStorage.removeItem(`contentHubChampionHistory_${adminUsername}`);
        localStorage.removeItem(`contentHubKeys_${adminUsername}`);
        localStorage.removeItem(`contentHubMetadata_${adminUsername}`);
        
        // Remove analytics cache
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(`analyticsData_${adminUsername}`) || key.startsWith(`monthlyPosts_${adminUsername}`)) {
                sessionStorage.removeItem(key);
            }
        });

        setUserToDelete(null); // Close modal
    };

    return (
        <div className="space-y-8">
             <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Owner Control Panel</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Oversee all tenant accounts and manage application resources.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Admin Accounts" value={summary.totalAdmins} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.428 0m.707 0a3.002 3.002 0 013.428 0M4 11c0-1.1.9-2 2-2h3.28a1 1 0 01.948.684l1.472 4.418a.998.998 0 001.896 0l1.472-4.418A1 1 0 0114.72 9H18c1.1 0 2 .9 2 2v2a2 2 0 01-2 2h-1m-6 0h-1a2 2 0 01-2-2v-2" /></svg>} />
                <StatCard title="Total Storage Usage" value={`${summary.totalStorageMB} MB`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s8 4 8 4s8-4 8-4M12 11v4" /></svg>} />
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
                 <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Admin Account Overview</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Details</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sites</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">VAs</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasks</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Storage (KB)</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">Loading admin data...</td></tr>
                            ) : adminStats.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">No admin accounts found.</td></tr>
                            ) : (
                                adminStats.map(admin => (
                                    <tr key={admin.username}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{admin.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">{admin.siteCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">{admin.vaCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">{admin.taskCount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300 font-mono">{admin.storageKB}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setUserToDelete(admin.username)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                         </tbody>
                    </table>
                </div>
            </div>

            {/* Deletion Confirmation Modal */}
            {userToDelete && (
                 <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">Delete Account</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete the account for <strong>{userToDelete}</strong>? This will permanently remove the admin, all associated VAs, and all their data (sites, tasks, etc.). This action cannot be undone.
                                    </p>
                                </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row-reverse gap-3">
                            <button
                                type="button"
                                onClick={() => handleDeleteAdmin(userToDelete)}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-red-500 sm:w-auto sm:text-sm"
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserToDelete(null)}
                                className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OwnerDashboard;