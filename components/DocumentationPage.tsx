import React, { useState, useEffect, useRef } from 'react';

const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'getting-started', title: 'Getting Started', subsections: [{ id: 'getting-started-admin', title: 'For Admins' }, { id: 'getting-started-va', title: 'For VAs' }] },
    { id: 'hub', title: 'The Hub (For Admins)', subsections: [{ id: 'hub-sites', title: 'Connecting Sites' }, { id: 'hub-team', title: 'Managing Your Team' }] },
    { id: 'workflow', title: 'Content Workflow', subsections: [{ id: 'workflow-views', title: 'Workflow Views' }, { id: 'workflow-tasks', title: 'Managing Tasks' }, { id: 'workflow-filters', title: 'Filtering' }] },
    { id: 'analytics', title: 'Analytics & Performance', subsections: [{ id: 'analytics-dashboard', title: 'Dashboard' }, { id: 'analytics-leaderboard', title: 'Leaderboard' }, { id: 'analytics-va', title: 'VA Performance Page' }] },
    { id: 'security', title: 'Security & Privacy' },
    { id: 'owner-dashboard', title: 'Owner Dashboard' },
];

const TableOfContents: React.FC<{ activeId: string }> = ({ activeId }) => {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href')?.substring(1);
        if (targetId) {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">On this page</h3>
            <ul className="space-y-2 text-sm">
                {sections.map(section => (
                    <li key={section.id}>
                        <a href={`#${section.id}`} onClick={handleNavClick} className={`block font-medium transition-colors ${activeId === section.id ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{section.title}</a>
                        {section.subsections && (
                            <ul className="pl-4 mt-2 space-y-2 border-l border-gray-200 dark:border-gray-700">
                                {section.subsections.map(sub => (
                                    <li key={sub.id}>
                                        <a href={`#${sub.id}`} onClick={handleNavClick} className={`block transition-colors ${activeId === sub.id ? 'text-primary font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{sub.title}</a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const DocSection: React.FC<{ id: string; title: string; children: React.ReactNode; refProp: React.RefObject<HTMLElement> }> = ({ id, title, children, refProp }) => (
    <section id={id} ref={refProp} className="scroll-mt-20">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white border-b-2 border-primary pb-2 mb-6">{title}</h2>
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-gray-700 dark:text-gray-300">
            {children}
        </div>
    </section>
);

const SubSection: React.FC<{ id: string; title: string; children: React.ReactNode; refProp: React.RefObject<HTMLElement> }> = ({ id, title, children, refProp }) => (
     <div id={id} ref={refProp as React.RefObject<HTMLDivElement>} className="scroll-mt-20 pt-4">
        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{title}</h3>
        {children}
    </div>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-gray-200 dark:bg-gray-700 text-primary font-mono py-0.5 px-1.5 rounded-md text-sm">{children}</code>;

const Callout: React.FC<{ children: React.ReactNode; type?: 'info' | 'warning' }> = ({ children, type = 'info' }) => {
    const colors = {
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200',
    };
    return <div className={`p-4 border-l-4 rounded-r-md ${colors[type]}`}>{children}</div>;
};


const DocumentationPage: React.FC = () => {
    const [activeId, setActiveId] = useState('introduction');
    const sectionRefs = useRef<Record<string, React.RefObject<HTMLElement>>>({});

    sections.forEach(section => {
        sectionRefs.current[section.id] = useRef<HTMLElement>(null);
        if (section.subsections) {
            section.subsections.forEach(sub => {
                sectionRefs.current[sub.id] = useRef<HTMLElement>(null);
            });
        }
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter(e => e.isIntersecting);
                if (visibleEntries.length > 0) {
                    // Find the one that is most visible (closest to the top)
                     visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                     setActiveId(visibleEntries[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -75% 0px', threshold: 0.1 }
        );

        Object.values(sectionRefs.current).forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">
            <main className="w-full lg:w-3/4 space-y-12">
                <DocSection id="introduction" title="Introduction" refProp={sectionRefs.current.introduction}>
                    <p>Welcome to the ContentHub documentation! This guide will walk you through every feature of the application, from setting up your account to analyzing performance.</p>
                    <p>ContentHub is a powerful, privacy-first application designed to streamline the content creation workflow for blog network owners and their teams of Virtual Assistants (VAs). Its core philosophy is that <strong>your data belongs to you</strong>. All your information is encrypted and stored directly on your device, ensuring unparalleled security and privacy.</p>
                </DocSection>

                <DocSection id="getting-started" title="Getting Started" refProp={sectionRefs.current['getting-started']}>
                    <SubSection id="getting-started-admin" title="For Admins" refProp={sectionRefs.current['getting-started-admin']}>
                        <p>Your journey begins by creating an Admin account. This account acts as a self-contained, encrypted workspace for you and your team.</p>
                        <ol>
                            <li>Navigate to the Admin login page and select "Create new account".</li>
                            <li>Enter a unique username, a valid email address, and a strong password.</li>
                            <li>Upon signing up, a secure workspace is created for you. For security, your first login will require a 2-factor authentication code sent to your email (simulated via an alert for this demo).</li>
                        </ol>
                        <Callout type="warning">
                            <strong>Important:</strong> Your password is your master encryption key. It is never stored. If you forget your password, your encrypted data cannot be recovered. Choose a password you will remember.
                        </Callout>
                    </SubSection>
                     <SubSection id="getting-started-va" title="For VAs" refProp={sectionRefs.current['getting-started-va']}>
                        <p>As a Virtual Assistant, you cannot sign up directly. Your Admin must create an account for you inside their workspace.</p>
                        <ol>
                            <li>Your Admin will provide you with a username and a temporary password.</li>
                            <li>Navigate to the VA Portal login page.</li>
                            <li>Enter your credentials to access your assigned tasks and performance dashboard.</li>
                        </ol>
                    </SubSection>
                </DocSection>

                <DocSection id="hub" title="The Hub (For Admins)" refProp={sectionRefs.current.hub}>
                    <p>The Hub is your central command center for managing sites and team members. All data configured here is encrypted and belongs to your specific Admin workspace.</p>
                    <SubSection id="hub-sites" title="Connecting WordPress Sites" refProp={sectionRefs.current['hub-sites']}>
                        <p>To enable analytics and VA author mapping, you must connect your WordPress sites.</p>
                        <ol>
                            <li>In the Hub, navigate to the "Sites" tab and click "Add Site".</li>
                            <li>Fill in the site's name, URL, your WordPress username, and an <strong>Application Password</strong>.</li>
                        </ol>
                        <Callout>
                            An Application Password is a unique password generated within your WordPress profile. It allows ContentHub to connect securely without using your main password. <a href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Learn more here</a>.
                        </Callout>
                         <p>The app will verify the connection. A "Connected" status means it's working correctly. A "Failed" status indicates incorrect credentials, which you can fix by editing the site.</p>
                    </SubSection>
                    <SubSection id="hub-team" title="Managing Your Team" refProp={sectionRefs.current['hub-team']}>
                        <p>Under the "Team" tab, you can manage both Admin and VA accounts.</p>
                        <ul>
                            <li><strong>Add Admin:</strong> You can create additional Admin accounts. Note that each Admin has their own separate, encrypted workspace.</li>
                            <li><strong>Add VA:</strong> Create accounts for your Virtual Assistants. You must provide a display name, username, email, and password.</li>
                            <li><strong>Linking VAs:</strong> When creating or editing a VA, you must link them to one or more connected WordPress sites. For each site, you must also select the corresponding WordPress Author profile that the VA will publish under. This is crucial for tracking their published articles correctly.</li>
                        </ul>
                    </SubSection>
                </DocSection>

                <DocSection id="workflow" title="Content Workflow" refProp={sectionRefs.current.workflow}>
                    <p>The Workflow page is where you manage the entire article lifecycle, from a simple idea to a published piece.</p>
                    <SubSection id="workflow-views" title="Workflow Views" refProp={sectionRefs.current['workflow-views']}>
                        <p>Admins can switch between two powerful views:</p>
                        <ul>
                            <li><strong>Kanban Board:</strong> A visual, card-based view organized by status (Idea, In Progress, Review, Published, Archived). You can drag and drop tasks between columns to update their status.</li>
                            <li><strong>Table View:</strong> A detailed list view that provides more information at a glance. You can select multiple tasks using checkboxes for bulk actions.</li>
                        </ul>
                        <p>VAs only have access to the Kanban view, showing only the tasks assigned to them.</p>
                    </SubSection>
                    <SubSection id="workflow-tasks" title="Managing Tasks" refProp={sectionRefs.current['workflow-tasks']}>
                        <ul>
                            <li><strong>Add Task:</strong> Manually create a new task, providing details like annotated interests and category.</li>
                            <li><strong>AI Assistant:</strong> Use the integrated Gemini AI to automatically generate SEO-friendly keywords from your annotated interests and catchy titles from your keywords.</li>
                            <li><strong>Import Tasks:</strong> Use the "Import Tasks" button to upload a <Code>.csv</Code>, <Code>.tsv</Code>, or <Code>.xlsx</Code> file for bulk task creation. The tool will guide you through mapping your file's columns to the required task fields.</li>
                            <li><strong>Edit Task:</strong> Click "Details" on any task to open a modal where you can update its status, re-assign it to a different VA, or edit its content.</li>
                            <li><strong>Bulk Delete:</strong> In the Table View, select multiple tasks and use the "Delete Selected" button to remove them.</li>
                        </ul>
                    </SubSection>
                    <SubSection id="workflow-filters" title="Filtering" refProp={sectionRefs.current['workflow-filters']}>
                         <p>In the Admin workflow view, you can use the filter dropdowns to narrow down the displayed tasks by blog, VA, or status, helping you focus on what matters most.</p>
                    </SubSection>
                </DocSection>
                
                 <DocSection id="analytics" title="Analytics & Performance" refProp={sectionRefs.current.analytics}>
                    <p>ContentHub provides powerful analytics to help you understand your team's output and performance.</p>
                    <SubSection id="analytics-dashboard" title="Dashboard (For Admins)" refProp={sectionRefs.current['analytics-dashboard']}>
                         <p>The main dashboard gives you a high-level overview:</p>
                        <ul>
                            <li><strong>Workflow Overview:</strong> Quick stats on the total number of tasks in different stages.</li>
                            <li><strong>Publishing Stats:</strong> Fetches data directly from your connected WordPress sites. You can see how many articles were published by each VA on each site within a specific date range (Today, Yesterday, Last 7/30 Days).</li>
                            <li><strong>VA Performance Analysis:</strong> A chart comparing each VA's post count against a target (default is 5 posts/day per site).</li>
                        </ul>
                    </SubSection>
                    <SubSection id="analytics-leaderboard" title="Performance Leaderboard" refProp={sectionRefs.current['analytics-leaderboard']}>
                        <p>This section ranks your VAs based on a comprehensive performance score calculated from data over the current calendar month. The score is broken down as follows:</p>
                        <ul>
                            <li><strong>Article Score (50%):</strong> Based on the total number of articles published.</li>
                            <li><strong>Image Score (25%):</strong> Based on the average number of images per article (capped at 5).</li>
                            <li><strong>Consistency Score (25%):</strong> Based on the number of unique days the VA was active (published at least one article).</li>
                        </ul>
                        <p>At the beginning of each month, the top-ranked VA from the previous month is crowned the "Champion".</p>
                    </SubSection>
                    <SubSection id="analytics-va" title="VA Performance Page" refProp={sectionRefs.current['analytics-va']}>
                        <p>VAs have their own Performance page where they can see their personal rank, score, and stats for the current month. This helps them track their progress and fosters healthy competition.</p>
                    </SubSection>
                </DocSection>

                <DocSection id="security" title="Security & Privacy" refProp={sectionRefs.current.security}>
                    <p>Your privacy is not an afterthought; it's the foundation of ContentHub. The application is architected to ensure you have complete control over your data.</p>
                    <ul>
                        <li><strong>Client-Side Encryption:</strong> All your data—sites, tasks, VA info, and credentials—is encrypted on your device using the AES-GCM algorithm before it is saved. Your password is used to derive the encryption key, meaning only you can decrypt your data when you log in.</li>
                        <li><strong>Local Storage:</strong> Your encrypted data is stored in your web browser's local storage. It never leaves your computer and is never sent to a central server.</li>
                        <li><strong>No Data Syncing:</strong> As a consequence of the local storage model, data does not sync between different computers or browsers. This guarantees that your data remains physically where you put it.</li>
                        <li><strong>Direct API Connections:</strong> When the app fetches posts from WordPress or generates content with the Gemini API, your browser connects directly to those services. Your data is not proxied through any third-party server.</li>
                    </ul>
                </DocSection>
                
                <DocSection id="owner-dashboard" title="Owner Dashboard" refProp={sectionRefs.current['owner-dashboard']}>
                    <p>The "Owner" is a special role designed for the administrator of the ContentHub application itself. This dashboard is separate from the standard Admin workspaces.</p>
                    <p>From here, the Owner can:</p>
                     <ul>
                        <li>View a list of all Admin accounts (tenants) on the platform.</li>
                        <li>See high-level statistics for each Admin, such as the number of sites, VAs, and tasks they manage.</li>
                        <li>Monitor the estimated storage space each Admin's data is consuming in local storage.</li>
                        <li>Permanently delete an Admin account and all of its associated data, including its VAs, sites, and tasks. This is a critical tool for managing the application's resources.</li>
                    </ul>
                </DocSection>

            </main>
            <aside className="w-full lg:w-1/4">
                <div className="lg:sticky lg:top-20">
                    <TableOfContents activeId={activeId} />
                </div>
            </aside>
        </div>
    );
};

export default DocumentationPage;
