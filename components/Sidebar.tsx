import React, { useState, useEffect, useRef } from 'react';
import { LoggedInUser, Page } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

type Theme = 'light' | 'dark' | 'system';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  user: LoggedInUser;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onOpenPrivacyModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, onNavigate, onLogout, theme, setTheme, isSidebarOpen, setIsSidebarOpen, onOpenPrivacyModal }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'owner':
        return [
          { id: 'owner', label: 'Owner Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg> },
          { id: 'workflow', label: 'Workflow', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3zm3.146 2.146a.5.5 0 01.708 0l2.5 2.5a.5.5 0 010 .708l-2.5 2.5a.5.5 0 01-.708-.708L7.293 8 6.146 6.854a.5.5 0 010-.708zm4.5 0a.5.5 0 000 .708L11.793 8l-1.147 1.146a.5.5 0 00.708.708l2.5-2.5a.5.5 0 000-.708l-2.5-2.5a.5.5 0 00-.708 0z" clipRule="evenodd" /></svg> },
          { id: 'hub', label: 'Hub', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg> },
        ];
      case 'va':
        return [
          { id: 'workflow', label: 'Workflow', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3zm3.146 2.146a.5.5 0 01.708 0l2.5 2.5a.5.5 0 010 .708l-2.5 2.5a.5.5 0 01-.708-.708L7.293 8 6.146 6.854a.5.5 0 010-.708zm4.5 0a.5.5 0 000 .708L11.793 8l-1.147 1.146a.5.5 0 00.708.708l2.5-2.5a.5.5 0 000-.708l-2.5-2.5a.5.5 0 00-.708 0z" clipRule="evenodd" /></svg> },
          { id: 'performance', label: 'Performance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg> },
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = getNavItems();
  const displayName = 'name' in user ? user.name : user.username;
  
  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setIsSidebarOpen(false);
  };
  
  const handlePrivacyClick = () => {
    onOpenPrivacyModal();
    setIsUserMenuOpen(false);
  };
  
  const handleLogoutClick = () => {
    onLogout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className={`fixed z-40 inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">ContentHub</h2>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentPage === item.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            <div ref={userMenuRef} className="relative">
                {isUserMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-slate-900 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                        <button
                            onClick={handlePrivacyClick}
                            className="w-full flex items-center px-4 py-2 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" /></svg>
                            Privacy & Security
                        </button>
                        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center px-4 py-2 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                            Logout
                        </button>
                    </div>
                )}
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-800">
                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                         <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    </div>
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
