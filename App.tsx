import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArticleTask, WordPressSite, VirtualAssistant, User, DailyPostsData, DateRange, ChampionHistory, ChampionData, Post, VAPerformanceData, LoggedInUser, Page } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WorkflowPage from './components/WorkflowPage';
import HubPage from './components/SettingsPage';
import PerformancePage from './components/PerformancePage';
import OwnerDashboard from './components/OwnerDashboard';
import HomePage from './components/HomePage';
import GuidePage from './components/GuidePage';
import AdminLoginPage from './components/AdminLoginPage';
import VALoginPage from './components/VALoginPage';
import PrivacyModal from './components/PrivacyModal'; // Import the new component
import { fetchAllPosts } from './services/wordpressService';
import * as cryptoService from './services/cryptoService';

const obfuscateEmail = (email?: string): string => {
  if (!email || !email.includes('@')) {
    return 'your registered email';
  }
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${'*'.repeat(localPart.length)}@${domain}`;
  }
  const visiblePart = localPart.substring(0, 2);
  const hiddenPart = '*'.repeat(localPart.length - 2);
  return `${visiblePart}${hiddenPart}@${domain}`;
};

type Theme = 'light' | 'dark' | 'system';
type LoginView = 'landing' | 'admin' | 'va';
type PublicPage = 'home' | 'guide';

interface PendingLogin {
  user: LoggedInUser;
  pKey: CryptoKey;
  code: string;
}

const getDatesForRange = (range: DateRange) => {
    const end = new Date();
    const start = new Date();
    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'yesterday':
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
            break;
        case 'last7':
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        case 'last30':
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            break;
    }
    return {
        start: start.toISOString(),
        end: end.toISOString()
    };
};

const calculateRankedPerformance = (monthlyPosts: DailyPostsData[], vas: VirtualAssistant[], month: 'current' | 'last'): VAPerformanceData[] => {
    if (vas.length === 0) return [];

    const postsByVa = new Map<string, Post[]>();
    vas.forEach(va => postsByVa.set(va.id, []));

    monthlyPosts.forEach(postGroup => {
        for (const va of vas) {
            if (va.authorLinks.some(link => link.siteId === postGroup.siteId && link.authorName.startsWith(postGroup.authorFirstName))) {
                const vaPosts = postsByVa.get(va.id);
                if (vaPosts) {
                    vaPosts.push(...postGroup.posts);
                }
                break;
            }
        }
    });
    
    let maxArticles = 0;
    const vaStats = vas.map(va => {
        const posts = postsByVa.get(va.id) || [];
        const totalPosts = posts.length;
        const totalImages = posts.reduce((sum, p) => sum + p.imageCount, 0);
        const avgImages = totalPosts > 0 ? parseFloat((totalImages / totalPosts).toFixed(1)) : 0;
        const activeDays = new Set(posts.map(p => new Date(p.publishDate).getDate())).size;
        if (totalPosts > maxArticles) maxArticles = totalPosts;
        return { vaId: va.id, vaName: va.name, totalPosts, avgImages, activeDays };
    });

    if (maxArticles === 0) maxArticles = 1;

    const today = new Date();
    const dayOfMonth = month === 'current' 
        ? today.getDate() 
        : new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // Days in last month

    const calculatedData = vaStats.map(stat => {
        const articleScore = (stat.totalPosts / maxArticles) * 50;
        const imageScore = (Math.min(stat.avgImages, 5) / 5) * 25;
        const consistencyScore = (stat.activeDays / dayOfMonth) * 25;
        const score = Math.round(articleScore + imageScore + consistencyScore);

        return {
            ...stat,
            score,
            breakdown: {
                articleScore: Math.round(articleScore),
                imageScore: Math.round(imageScore),
                consistencyScore: Math.round(consistencyScore)
            }
        };
    });

    return calculatedData
        .sort((a, b) => b.score - a.score)
        .map((data, index) => ({ ...data, rank: index + 1 }));
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [workspaceKey, setWorkspaceKey] = useState<CryptoKey | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [loginView, setLoginView] = useState<LoginView>('landing');
  const [publicPage, setPublicPage] = useState<PublicPage>('home');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  
  // App data state - scoped to the logged-in admin
  const [sites, setSites] = useState<WordPressSite[]>([]);
  const [vas, setVas] = useState<VirtualAssistant[]>([]);
  const [tasks, setTasks] = useState<ArticleTask[]>([]);

  // Analytics Dashboard State
  const [postsData, setPostsData] = useState<DailyPostsData[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('yesterday');
  
  // Performance Page State
  const [monthlyPostsData, setMonthlyPostsData] = useState<DailyPostsData[]>([]);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState<boolean>(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  
  // Champion History State
  const [championHistory, setChampionHistory] = useState<ChampionHistory>({});
  const [lastMonthPostsData, setLastMonthPostsData] = useState<DailyPostsData[]>([]);
  const [isLoadingLastMonth, setIsLoadingLastMonth] = useState<boolean>(false);
  const [lastMonthChampion, setLastMonthChampion] = useState<ChampionData | null>(null);

  // All users are stored globally
  const [allUsers, setAllUsers] = useState<(User | VirtualAssistant)[]>([]);

  const [pendingLogin, setPendingLogin] = useState<PendingLogin | null>(null);
  
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


   useEffect(() => {
    const initializeUsers = async () => {
      try {
        const storedUsers = localStorage.getItem('contentHubUsers');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          let needsUpdate = false;

          const updatedUsers = await Promise.all(users.map(async (user: any) => {
            if (user.password && !user.passwordHash) {
              needsUpdate = true;
              const { hash, salt } = await cryptoService.hashPassword(user.password);
              delete user.password;
              return { ...user, passwordHash: hash, salt };
            }
             if ((user.username === 'owner' || user.username === 'admin') && !user.email) {
                needsUpdate = true;
                return { ...user, email: 'aitomar.mip.97@gmail.com' };
            }
            return user;
          }));

          setAllUsers(updatedUsers);
          if (needsUpdate) {
            localStorage.setItem('contentHubUsers', JSON.stringify(updatedUsers));
          }
        } else {
          // Create default users with hashed passwords
          const ownerPass = await cryptoService.hashPassword('password');
          const adminPass = await cryptoService.hashPassword('password');
          const defaultOwner: User = { username: 'owner', email: 'aitomar.mip.97@gmail.com', passwordHash: ownerPass.hash, salt: ownerPass.salt, role: 'owner' };
          const defaultAdmin: User = { username: 'admin', email: 'aitomar.mip.97@gmail.com', passwordHash: adminPass.hash, salt: adminPass.salt, role: 'admin' };
          const initialUsers = [defaultOwner, defaultAdmin];
          setAllUsers(initialUsers);
          localStorage.setItem('contentHubUsers', JSON.stringify(initialUsers));
        }
      } catch (error) {
        console.error("Failed to parse or migrate users from localStorage", error);
      }
    };
    initializeUsers();
  }, []);

  useEffect(() => {
    try {
        if (allUsers.length > 0) {
            localStorage.setItem('contentHubUsers', JSON.stringify(allUsers));
        }
    } catch(e){
        console.error("Failed to save users", e)
    }
  }, [allUsers]);

  const loadUserData = async (adminUsername: string, wKey: CryptoKey) => {
    try {
      const encryptedData = localStorage.getItem(`contentHubData_${adminUsername}`);
      if (encryptedData) {
        const decryptedJson = await cryptoService.decryptData(encryptedData, wKey);
        const { sites, vas, tasks } = JSON.parse(decryptedJson);
        setSites(sites || []);
        setVas(vas || []);
        setTasks(tasks || []);
      } else {
        setSites([]);
        setVas([]);
        setTasks([]);
      }
      const historyData = localStorage.getItem(`contentHubChampionHistory_${adminUsername}`);
      if (historyData) {
        setChampionHistory(JSON.parse(historyData));
      } else {
        setChampionHistory({});
      }
    } catch (error) {
      console.error("Failed to load user data (might be corrupted or wrong key):", error);
      // Clear potentially corrupted data
      localStorage.removeItem(`contentHubData_${adminUsername}`);
      setSites([]);
      setVas([]);
      setTasks([]);
      setChampionHistory({});
    }
  };

  const saveUserData = useCallback(async (adminUsername: string, data: { sites: WordPressSite[], vas: VirtualAssistant[], tasks: ArticleTask[] }, wKey: CryptoKey) => {
    try {
      const encryptedData = await cryptoService.encryptData(JSON.stringify(data), wKey);
      localStorage.setItem(`contentHubData_${adminUsername}`, encryptedData);
      
      // Also save unencrypted metadata for the owner dashboard
      const metadata = {
        sites: data.sites.length,
        vas: data.vas.length,
        tasks: data.tasks.length,
      };
      localStorage.setItem(`contentHubMetadata_${adminUsername}`, JSON.stringify(metadata));

    } catch (error) {
      console.error("Failed to save user data", error);
    }
  }, []);

  useEffect(() => {
    if (currentUser && workspaceKey) {
      const adminUsername = currentUser.role === 'admin' 
        ? currentUser.username 
        : (currentUser as VirtualAssistant)?.adminUsername;

      if (adminUsername) {
        saveUserData(adminUsername, { sites, vas, tasks }, workspaceKey);
      }
    }
  }, [sites, vas, tasks, currentUser, workspaceKey, saveUserData]);

  // --- Data Fetching Logic ---
  const loadAnalyticsData = useCallback(async (range: DateRange, forceRefresh = false) => {
    const adminUsername = currentUser?.role === 'admin' ? currentUser.username : (currentUser as VirtualAssistant)?.adminUsername;
    if (!adminUsername || sites.length === 0) {
      setPostsData([]);
      return;
    }

    const analyticsCacheKey = `analyticsData_${adminUsername}_${range}`;
    
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(analyticsCacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 10 * 60 * 1000) { // 10 minute cache
            setPostsData(data);
            return; 
          }
        }
      } catch (e) {
        console.error("Failed to read analytics cache", e);
        sessionStorage.removeItem(analyticsCacheKey);
      }
    }

    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    const dates = getDatesForRange(range);
    const { data, error: fetchError } = await fetchAllPosts(sites, dates);
    setPostsData(data);
    setAnalyticsError(fetchError);

    try {
      const cachePayload = { data, timestamp: Date.now() };
      sessionStorage.setItem(analyticsCacheKey, JSON.stringify(cachePayload));
    } catch (e) {
      console.error("Failed to write to analytics cache", e);
    }

    setIsLoadingAnalytics(false);
  }, [sites, currentUser]);

  const fetchMonthlyPosts = useCallback(async (monthOffset: number, forceRefresh = false) => {
    const adminUsername = currentUser?.role === 'admin' ? currentUser.username : (currentUser as VirtualAssistant)?.adminUsername;
    if (!adminUsername || sites.length === 0) {
      return { data: [], error: null };
    }

    const cacheKey = `monthlyPosts_${adminUsername}_${monthOffset}`;
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 10 * 60 * 1000) {
            return { data, error: null };
          }
        }
      } catch (e) { console.error("Cache read failed", e); }
    }
    
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const result = await fetchAllPosts(sites, {
        start: startOfMonth.toISOString(),
        end: (monthOffset === 0 ? new Date() : endOfMonth).toISOString()
    });
    
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: result.data, timestamp: Date.now() }));
    } catch (e) { console.error("Cache write failed", e); }
    
    return result;

  }, [sites, currentUser]);
  
  const loadPerformanceData = useCallback(async (forceRefresh = false) => {
    setIsLoadingPerformance(true);
    const { data, error } = await fetchMonthlyPosts(0, forceRefresh);
    setMonthlyPostsData(data);
    setPerformanceError(error);
    setIsLoadingPerformance(false);
  }, [fetchMonthlyPosts]);

  const loadLastMonthPerformanceData = useCallback(async (forceRefresh = false) => {
    setIsLoadingLastMonth(true);
    const { data } = await fetchMonthlyPosts(1, forceRefresh);
    setLastMonthPostsData(data);
    setIsLoadingLastMonth(false);
  }, [fetchMonthlyPosts]);

  useEffect(() => {
    if (currentUser?.role === 'admin' && currentPage === 'dashboard') {
      loadAnalyticsData(dateRange);
      loadPerformanceData();
    }
    if (currentUser?.role === 'va' && currentPage === 'performance') {
      loadPerformanceData();
    }
  }, [currentUser, currentPage, dateRange, loadAnalyticsData, loadPerformanceData]);

  // Champion Calculation Effect
  useEffect(() => {
      if (!currentUser || currentUser.role !== 'admin' || sites.length === 0) return;
      
      const adminUsername = currentUser.username;
      const lastMonth = new Date();
      lastMonth.setDate(0); // Go to last day of previous month
      const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const lastMonthChampionInHistory = championHistory[lastMonthKey];
      
      if(lastMonthChampionInHistory && vas.length > 0) {
          const championVA = vas.find(v => v.id === lastMonthChampionInHistory);
          if (championVA) {
              // We need the score, so we still need to calculate. 
              // Optimization: store score in history too. For now, re-calc is fine.
          }
      }

      if (lastMonthPostsData.length > 0 && vas.length > 0) {
          const ranked = calculateRankedPerformance(lastMonthPostsData, vas, 'last');
          const champion = ranked.find(r => r.rank === 1 && r.totalPosts > 0);
          
          if (champion) {
              setLastMonthChampion({
                  vaId: champion.vaId,
                  vaName: champion.vaName,
                  score: champion.score,
                  month: lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
              });

              if (!lastMonthChampionInHistory) {
                  const newHistory = { ...championHistory, [lastMonthKey]: champion.vaId };
                  setChampionHistory(newHistory);
                  localStorage.setItem(`contentHubChampionHistory_${adminUsername}`, JSON.stringify(newHistory));
              }
          } else {
            setLastMonthChampion(null);
          }
      } else {
        setLastMonthChampion(null);
      }

  }, [lastMonthPostsData, vas, championHistory, currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin' || sites.length === 0) return;
    const lastMonth = new Date();
    lastMonth.setDate(0);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    
    if (!championHistory[lastMonthKey]) {
      loadLastMonthPerformanceData();
    } else {
       loadLastMonthPerformanceData();
    }

  }, [championHistory, currentUser, sites.length, loadLastMonthPerformanceData]);


  const handleDateRangeChange = useCallback((newRange: DateRange) => {
      setDateRange(newRange);
  }, []);

  const handleRefreshAnalytics = useCallback(() => {
      loadAnalyticsData(dateRange, true);
  }, [loadAnalyticsData, dateRange]);
  
  const handleRefreshPerformance = useCallback(() => {
    loadPerformanceData(true);
  }, [loadPerformanceData]);

 const completeLoginProcess = async (user: LoggedInUser, pKey: CryptoKey): Promise<{ success: boolean, error?: string }> => {
    // If the user is the owner, bypass all data loading logic.
    if (user.role === 'owner') {
        setCurrentUser(user);
        setCurrentPage('owner');
        return { success: true };
    }

    const adminUsername = user.role === 'admin' ? user.username : (user as VirtualAssistant).adminUsername;
    const keysDataString = localStorage.getItem(`contentHubKeys_${adminUsername}`);

    if (keysDataString) { // New system: Workspace key exists
        const keysData = JSON.parse(keysDataString);
        const encryptedWKey = keysData[user.username];

        if (!encryptedWKey) {
            return { success: false, error: "Your account is not properly configured. Please contact your administrator to reset your password to regain access." };
        }
        try {
            const wKeyString = await cryptoService.decryptData(encryptedWKey, pKey);
            const wKey = await cryptoService.stringToKey(wKeyString);
            setWorkspaceKey(wKey);
            await loadUserData(adminUsername, wKey);
        } catch (e) {
            return { success: false, error: 'Invalid password or corrupted data.' };
        }
    } else { // Old system: No workspace key, requires migration
        if (user.role !== 'admin') {
            return { success: false, error: "This workspace requires an update. Please ask your administrator to log in first to complete the migration." };
        }
        
        try { // Attempt to decrypt old data with password key
            const encryptedData = localStorage.getItem(`contentHubData_${adminUsername}`);
            if (encryptedData) {
                const decryptedJson = await cryptoService.decryptData(encryptedData, pKey);
                
                // --- MIGRATION ---
                console.log("Migrating account to new encryption format...");
                const wKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
                setWorkspaceKey(wKey);

                const dataToMigrate = JSON.parse(decryptedJson);
                await saveUserData(adminUsername, dataToMigrate, wKey);

                const wKeyString = await cryptoService.keyToString(wKey);
                const encryptedWKey = await cryptoService.encryptData(wKeyString, pKey);
                const keysData = { [user.username]: encryptedWKey };
                localStorage.setItem(`contentHubKeys_${adminUsername}`, JSON.stringify(keysData));

                const { sites, vas, tasks } = dataToMigrate;
                setSites(sites || []);
                setVas(vas || []);
                setTasks(tasks || []);
                alert("Your account has been successfully migrated to a more secure format. To re-enable VA access, please update each VA's password in the Hub.");
            } else {
              // This is an old admin account with no data, just start fresh with new system
               const wKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
                setWorkspaceKey(wKey);
                 const wKeyString = await cryptoService.keyToString(wKey);
                const encryptedWKey = await cryptoService.encryptData(wKeyString, pKey);
                const keysData = { [user.username]: encryptedWKey };
                localStorage.setItem(`contentHubKeys_${user.username}`, JSON.stringify(keysData));
                await loadUserData(adminUsername, wKey);
            }
        } catch (e) {
            return { success: false, error: 'Invalid password or corrupted data.' };
        }
    }

    setCurrentUser(user);
    if (user.role === 'admin') setCurrentPage('dashboard');
    else if (user.role === 'va') setCurrentPage('workflow');
    else if (user.role === 'owner') setCurrentPage('owner');

    return { success: true };
};


 const handleLogin = async (identifier: string, password: string): Promise<{success: boolean, error?: string, needsVerification?: boolean, email?: string}> => {
    const user = allUsers.find(u => u.username === identifier || ('email' in u && u.email === identifier));
    if (!user || !('passwordHash' in user) || !('salt' in user)) {
        return { success: false, error: 'Invalid username/email or password.' };
    }

    const { salt, passwordHash } = user as { salt: string; passwordHash: string; };
    const isValid = await cryptoService.verifyPassword(password, salt, passwordHash);

    if (!isValid) {
        return { success: false, error: 'Invalid username/email or password.' };
    }

    const loggedInUser = user as LoggedInUser;
    const pKey = await cryptoService.deriveEncryptionKey(password, salt);

    if (loggedInUser.role === 'admin' || loggedInUser.role === 'owner') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingLogin({ user: loggedInUser, pKey, code });

        setTimeout(() => {
            const now = new Date();
            const dateTime = now.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });
            const userAgent = navigator.userAgent;

            const alertMessage = `
ContentHub Security
----------------------------------------

Your Security Code
Please return to the login screen and enter your code:

${code}

This code expires in 30 minutes.

----------------------------------------
Account: ${loggedInUser.username}
When: ${dateTime}
IP Address: 127.0.0.1 (Local)
Device: ${userAgent}
----------------------------------------

If the login attempt above was not you, please secure your account immediately.
This is a simulated email for demonstration purposes sent to ${obfuscateEmail(loggedInUser.email)}.
            `;
            alert(alertMessage);
        }, 300);

        return { success: true, needsVerification: true, email: loggedInUser.email };
    }
    
    // For VAs, log in directly
    const result = await completeLoginProcess(loggedInUser, pKey);
    return { ...result };
};

const handleVerifyCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!pendingLogin || code !== pendingLogin.code) {
      return { success: false, error: 'Invalid verification code.' };
    }
  
    const { user, pKey } = pendingLogin;
    setPendingLogin(null); // Clear pending state
  
    const result = await completeLoginProcess(user, pKey);
    return { ...result };
};


  const handleSignUp = async (username: string, password: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (allUsers.some(u => u.username === username)) {
      return { success: false, error: "Username already exists. Please choose a different one." };
    }
    if (allUsers.some(u => 'email' in u && u.email === email)) {
      return { success: false, error: "Email is already in use. Please choose a different one." };
    }

    const { hash, salt } = await cryptoService.hashPassword(password);
    const newUser: User = { username, email, passwordHash: hash, salt, role: 'admin' };
    
    // Create new workspace and keys
    const pKey = await cryptoService.deriveEncryptionKey(password, salt);
    const wKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const wKeyString = await cryptoService.keyToString(wKey);
    const encryptedWKey = await cryptoService.encryptData(wKeyString, pKey);
    const keysData = { [username]: encryptedWKey };
    localStorage.setItem(`contentHubKeys_${username}`, JSON.stringify(keysData));

    setWorkspaceKey(wKey);
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    await loadUserData(newUser.username, wKey);
    setCurrentPage('dashboard');
    
    return { success: true };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setWorkspaceKey(null);
    setCurrentPage('dashboard');
    setLoginView('landing');
    setPublicPage('home');
    setSites([]);
    setVas([]);
    setTasks([]);
    setPostsData([]);
    setDateRange('yesterday');
    setAnalyticsError(null);
    setMonthlyPostsData([]);
    setPerformanceError(null);
    setChampionHistory({});
    setLastMonthPostsData([]);
    setLastMonthChampion(null);
    setPendingLogin(null);
  };
  
  const handleAddAdmin = async (username: string, password: string, email: string): Promise<{success: boolean, error?: string}> => {
    if (allUsers.some(u => u.username === username)) {
        return { success: false, error: "Username already exists." };
    }
    if (allUsers.some(u => 'email' in u && u.email === email)) {
        return { success: false, error: "Email is already in use." };
    }
    const { hash, salt } = await cryptoService.hashPassword(password);
    const newAdmin: User = { username, email, passwordHash: hash, salt, role: 'admin' };
    setAllUsers(prev => [...prev, newAdmin]);
    return { success: true };
  };

  const handleSaveVA = async (vaData: Omit<VirtualAssistant, 'id' | 'createdAt' | 'role' | 'adminUsername' | 'passwordHash' | 'salt'> & {password?: string}, isEditing: boolean, existingVA: VirtualAssistant | null): Promise<{success: boolean, error?: string}> => {
    const adminUsername = currentUser!.username;
    
    if (isEditing && existingVA) {
        let { password, ...restData } = vaData;
        let newPasswordData = {};
        
        if (allUsers.some(u => u.username !== existingVA.username && 'email' in u && u.email === vaData.email)) {
            return { success: false, error: "Email is already in use by another account." };
        }

        if (password && workspaceKey) {
            const { hash, salt } = await cryptoService.hashPassword(password);
            newPasswordData = { passwordHash: hash, salt: salt };

            const vaPKey = await cryptoService.deriveEncryptionKey(password, salt);
            const wKeyString = await cryptoService.keyToString(workspaceKey);
            const encryptedWKey = await cryptoService.encryptData(wKeyString, vaPKey);

            const keysDataString = localStorage.getItem(`contentHubKeys_${adminUsername}`);
            const keysData = keysDataString ? JSON.parse(keysDataString) : {};
            keysData[vaData.username] = encryptedWKey;
            localStorage.setItem(`contentHubKeys_${adminUsername}`, JSON.stringify(keysData));
        }
        
        const updatedVA = { ...existingVA, ...restData, ...newPasswordData };
        setVas(prev => prev.map(v => v.id === existingVA.id ? updatedVA : v));
        setAllUsers(prev => prev.map(u => u.username === updatedVA.username ? updatedVA : u));
        return { success: true };

    } else { // Handle adding a new VA
        if (allUsers.some(u => u.username === vaData.username)) {
            return { success: false, error: "Username already exists." };
        }
         if (allUsers.some(u => 'email' in u && u.email === vaData.email)) {
            return { success: false, error: "Email is already in use." };
        }
        if (!vaData.password) {
            return { success: false, error: "A password is required for new VA accounts." };
        }
        if (!workspaceKey) {
            return { success: false, error: "Workspace key is not available. Please log in again." };
        }

        const { hash, salt } = await cryptoService.hashPassword(vaData.password);
        
        const newVA: VirtualAssistant = {
            ...vaData,
            id: vaData.username,
            role: 'va',
            adminUsername: adminUsername,
            createdAt: new Date().toISOString(),
            passwordHash: hash,
            salt,
        };
        delete (newVA as any).password;

        // Encrypt workspace key for the new VA
        const vaPKey = await cryptoService.deriveEncryptionKey(vaData.password, salt);
        const wKeyString = await cryptoService.keyToString(workspaceKey);
        const encryptedWKey = await cryptoService.encryptData(wKeyString, vaPKey);

        const keysDataString = localStorage.getItem(`contentHubKeys_${adminUsername}`);
        const keysData = keysDataString ? JSON.parse(keysDataString) : {};
        keysData[vaData.username] = encryptedWKey;
        localStorage.setItem(`contentHubKeys_${adminUsername}`, JSON.stringify(keysData));

        setVas(prev => [...prev, newVA]);
        setAllUsers(prev => [...prev, newVA]);

        return { success: true };
    }
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    const userToDelete = allUsers.find(u => u.username === usernameToDelete);
    if (!userToDelete) return;

    const adminUsername = userToDelete.role === 'admin' 
        ? userToDelete.username 
        : (userToDelete as VirtualAssistant).adminUsername;
    
    // Remove user and associated VAs if admin is deleted
    const usersToKeep = allUsers.filter(u => {
        if (u.username === usernameToDelete) return false; // remove the user
        if (userToDelete.role === 'admin' && u.role === 'va' && (u as VirtualAssistant).adminUsername === usernameToDelete) {
            // Also remove the VA's key entry
            const keysDataString = localStorage.getItem(`contentHubKeys_${adminUsername}`);
            if (keysDataString) {
                const keysData = JSON.parse(keysDataString);
                delete keysData[u.username];
                localStorage.setItem(`contentHubKeys_${adminUsername}`, JSON.stringify(keysData));
            }
            return false;
        }
        return true;
    });

    setAllUsers(usersToKeep);
    setVas(prevVAs => usersToKeep.filter(u => u.role === 'va') as VirtualAssistant[]);

    // Clean up VA's key from keys object if they are deleted individually
    if (userToDelete.role === 'va') {
        const keysDataString = localStorage.getItem(`contentHubKeys_${adminUsername}`);
        if (keysDataString) {
            const keysData = JSON.parse(keysDataString);
            delete keysData[usernameToDelete];
            localStorage.setItem(`contentHubKeys_${adminUsername}`, JSON.stringify(keysData));
        }
    }
    
    // If an admin is deleted, clean up all their data
    if (userToDelete.role === 'admin') {
        localStorage.removeItem(`contentHubData_${usernameToDelete}`);
        localStorage.removeItem(`contentHubChampionHistory_${usernameToDelete}`);
        localStorage.removeItem(`contentHubKeys_${usernameToDelete}`);
        localStorage.removeItem(`contentHubMetadata_${usernameToDelete}`);
        // Also clear session storage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(`analyticsData_${usernameToDelete}`) || key.startsWith(`monthlyPosts_${usernameToDelete}`)) {
                sessionStorage.removeItem(key);
            }
        });
    }
  };

  const handleAddTask = (taskData: Omit<ArticleTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: ArticleTask = {
      ...taskData,
      id: new Date().toISOString() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleBulkAddTask = (newTasksData: Omit<ArticleTask, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newTasks: ArticleTask[] = newTasksData.map(taskData => ({
        ...taskData,
        id: new Date().toISOString() + Math.random(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));
    setTasks(prev => [...prev, ...newTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleUpdateTask = (updatedTask: ArticleTask) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : t
      )
    );
  };
  
  const handleDeleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleBulkDeleteTasks = (taskIds: string[]) => {
    const idsToDelete = new Set(taskIds);
    setTasks(prev => prev.filter(t => !idsToDelete.has(t.id)));
  };

  const handleBulkUpdateTasks = (taskIds: string[], updates: Partial<Omit<ArticleTask, 'id'>>) => {
    const idsToUpdate = new Set(taskIds);
    const newTimestamp = new Date().toISOString();
    setTasks(prev => 
      prev.map(task => 
        idsToUpdate.has(task.id)
          ? { ...task, ...updates, updatedAt: newTimestamp }
          : task
      )
    );
  };

  const rankedPerformanceData = useMemo(() => calculateRankedPerformance(monthlyPostsData, vas, 'current'), [monthlyPostsData, vas]);
  const lastMonthRankedData = useMemo(() => calculateRankedPerformance(lastMonthPostsData, vas, 'last'), [lastMonthPostsData, vas]);

  if (!currentUser) {
    if (publicPage === 'guide') {
        return <GuidePage onBack={() => setPublicPage('home')} />;
    }

    switch (loginView) {
      case 'admin':
        return <AdminLoginPage onLogin={handleLogin} onVerifyCode={handleVerifyCode} onSignUp={handleSignUp} onBack={() => setLoginView('landing')} />;
      case 'va':
        return <VALoginPage onLogin={async (u,p) => (await handleLogin(u,p)).success} onBack={() => setLoginView('landing')} />;
      case 'landing':
      default:
        return <HomePage onSelectAdmin={() => setLoginView('admin')} onSelectVA={() => setLoginView('va')} onSelectGuide={() => setPublicPage('guide')} />;
    }
  }

  const PageComponent = {
    dashboard: <Dashboard 
                  tasks={tasks} 
                  sites={sites} 
                  vas={vas}
                  onNavigateToHub={() => setCurrentPage('hub')}
                  postsData={postsData}
                  isLoading={isLoadingAnalytics}
                  error={analyticsError}
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  onRefresh={handleRefreshAnalytics}
                  rankedPerformanceData={rankedPerformanceData}
                  isLoadingPerformance={isLoadingPerformance}
                  performanceError={performanceError}
                  onRefreshPerformance={handleRefreshPerformance}
                  championHistory={championHistory}
                  lastMonthChampion={lastMonthChampion}
                  onUpdateTask={handleUpdateTask}
                />,
    workflow: <WorkflowPage 
                user={currentUser}
                tasks={tasks}
                sites={sites}
                vas={vas}
                onAddTask={handleAddTask}
                onBulkAddTask={handleBulkAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onBulkDeleteTasks={handleBulkDeleteTasks}
                onBulkUpdateTasks={handleBulkUpdateTasks}
              />,
    hub: <HubPage 
          user={currentUser as User} 
          sites={sites} 
          setSites={setSites} 
          vas={vas}
          setVas={setVas}
          allUsers={allUsers}
          onAddAdmin={handleAddAdmin}
          onSaveVA={handleSaveVA}
          onDeleteUser={handleDeleteUser}
         />,
    performance: <PerformancePage 
                  user={currentUser}
                  sites={sites}
                  vas={vas}
                  rankedPerformanceData={rankedPerformanceData}
                  isLoading={isLoadingPerformance}
                  error={performanceError}
                  onRefresh={handleRefreshPerformance}
                  championHistory={championHistory}
                  lastMonthChampion={lastMonthChampion}
                 />,
    owner: <OwnerDashboard allUsers={allUsers} setAllUsers={setAllUsers} />,
  }[currentPage];

  return (
    <div className="flex h-screen bg-light dark:bg-slate-900 overflow-hidden">
      <Sidebar 
        user={currentUser}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />
       <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 flex-shrink-0">
             <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div className="flex-1 min-w-0">
                 <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 truncate md:ml-2">
                    {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                </h1>
            </div>
            {/* Header content can go here if needed */}
          </header>
        <main className="flex-1 overflow-y-auto p-6">
          {PageComponent}
        </main>
      </div>
       <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </div>
  );
};

export default App;