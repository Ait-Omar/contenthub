import React, { useState } from 'react';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (username: string, password: string, email: string) => Promise<void>;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onAddAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password && email) {
      await onAddAdmin(username, password, email);
      resetAndClose();
    } else {
        alert("Please provide a username, email, and password.");
    }
  };
  
  const resetAndClose = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={resetAndClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Add New Admin</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a new administrator account.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <input 
                type="text" 
                id="admin-username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" 
              />
            </div>
             <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input 
                type="email" 
                id="admin-email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" 
              />
            </div>
            <div>
              <label htmlFor="admin-password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input 
                type="password" 
                id="admin-password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white" 
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
            <button type="button" onClick={resetAndClose} className="py-2 px-4 bg-white dark:bg-slate-600 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-secondary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">Add Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;