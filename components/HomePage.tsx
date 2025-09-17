import React, { useState, useEffect, useRef } from 'react';

interface HomePageProps {
  onSelectAdmin: () => void;
  onSelectVA: () => void;
  onSelectGuide: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);

const FaqItem: React.FC<{ question: string; children: React.ReactNode; }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left text-gray-800 dark:text-gray-100"
            >
                <span className="font-semibold">{question}</span>
                <svg
                    className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                <p className="text-gray-600 dark:text-gray-400 text-sm pt-2">
                    {children}
                </p>
            </div>
        </div>
    );
};

const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
];

const testimonials = [
    {
        quote: "ContentHub transformed how I manage my 10+ sites. The analytics are a game-changer for tracking VA performance and identifying top performers.",
        author: "Sarah L.",
        role: "Blog Network Owner",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        quote: "As a VA, ContentHub makes my job so much easier. I can see all my assigned articles in one place, know exactly what's expected, and track my progress.",
        author: "Maria G.",
        role: "Virtual Assistant",
        avatar: "https://randomuser.me/api/portraits/women/75.jpg"
    },
    {
        quote: "Not only did it save me time, but it also helped me produce content that was more engaging and effective than what I had been creating on my own.",
        author: "Peline Jan",
        role: "Entrepreneur",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
        quote: "The AI tools save us hours every week. We can go from idea to a fully prepped article draft with SEO keywords and a great title in minutes.",
        author: "Mike R.",
        role: "Content Manager",
        avatar: "https://randomuser.me/api/portraits/men/62.jpg"
    },
    {
        quote: "The performance leaderboard has introduced a fun, competitive edge to our team. It's fantastic for motivation and rewarding our top-performing VAs.",
        author: "Alex Johnson",
        role: "SEO Specialist",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg"
    }
];

const partners = ['Logoipsum', 'BrandCo', 'Acme', 'Stark Inc.', 'Wayne Ent.'];


const HomePage: React.FC<HomePageProps> = ({ onSelectAdmin, onSelectVA, onSelectGuide }) => {
    const [activeSection, setActiveSection] = useState('home');
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
    
    const [currentTestimonial, setCurrentTestimonial] = useState(2); // Start with the middle one
    const [isAnimating, setIsAnimating] = useState(false);

    const handleTestimonialChange = (newIndex: number) => {
        if (newIndex === currentTestimonial) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentTestimonial(newIndex);
            setIsAnimating(false);
        }, 200); // match transition duration
    };

    const handleNextTestimonial = () => {
        handleTestimonialChange((currentTestimonial + 1) % testimonials.length);
    };

    const handlePrevTestimonial = () => {
        handleTestimonialChange((currentTestimonial - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-30% 0px -70% 0px' }
        );

        navLinks.forEach(link => {
            const id = link.href.substring(1);
            const el = document.getElementById(id);
            if (el) {
                sectionRefs.current[id] = el;
                observer.observe(el);
            }
        });

        return () => {
            Object.values(sectionRefs.current).forEach(el => {
                if (el) observer.unobserve(el);
            });
        };
    }, []);

    const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const targetElement = document.getElementById(targetId.substring(1));
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };


    return (
        <div className="bg-light dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
                <div className="container mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
                    <a href="#home" onClick={handleNavClick} className="flex items-center">
                        <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                            <path d="M2 17l10 5 10-5"></path>
                            <path d="M2 12l10 5 10-5"></path>
                        </svg>
                        <span className="hidden sm:inline text-xl font-bold text-gray-800 dark:text-gray-200 ml-2">ContentHub</span>
                    </a>
                    
                    <nav className="hidden md:flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full">
                         {navLinks.map(link => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={handleNavClick}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
                                    activeSection === link.href.substring(1)
                                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button onClick={onSelectGuide} className="hidden sm:block text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Guide</button>
                        <div className="hidden sm:block w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
                        <button onClick={onSelectVA} className="hidden sm:block text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">VA Portal</button>
                        <button onClick={onSelectAdmin} className="text-sm font-semibold py-2 px-4 bg-primary text-white rounded-md shadow-sm hover:bg-primary-dark transition-colors">
                            Login
                        </button>
                    </div>
                </div>
            </header>
            
            <main>
                {/* Hero Section */}
                <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-violet-300 to-sky-200 dark:from-slate-900 dark:via-indigo-900/30 dark:to-slate-900 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}></div>
                    <div className="absolute top-0 -left-1/4 w-96 h-96 md:w-[32rem] md:h-[32rem] bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-blob-1"></div>
                    <div className="absolute bottom-0 -right-1/4 w-96 h-96 md:w-[32rem] md:h-[32rem] bg-secondary/10 dark:bg-secondary/20 rounded-full filter blur-3xl opacity-50 animate-blob-2"></div>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                            The Ultimate Command Center for Your <span className="text-primary">Content Empire</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                            Streamline your workflow, empower your VAs, and analyze performance with powerful AI tools—all with unparalleled privacy.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <a href="#features" onClick={handleNavClick} className="py-3 px-8 bg-primary border border-transparent rounded-md shadow-lg text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform hover:scale-105 transition-all">
                                Learn More
                            </a>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="features" className="py-20 bg-white dark:bg-gray-800/20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything You Need to Scale Your Content</h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">From idea to analytics, ContentHub has you covered.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard title="Unified Workflow" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}>
                                Manage your entire content pipeline with intuitive Kanban boards and detailed table views. Track progress from idea to publication effortlessly.
                            </FeatureCard>
                             <FeatureCard title="AI Content Assistant" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                                Leverage the power of Google's Gemini API to generate SEO keywords and catchy titles, accelerating your content creation process.
                            </FeatureCard>
                             <FeatureCard title="Data-Driven Analytics" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
                                Monitor VA performance with a detailed dashboard, monthly leaderboards, and historical champion tracking. Make informed decisions with clear data.
                            </FeatureCard>
                            <FeatureCard title="Secure & Private" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}>
                                Your data is yours. With industry-standard, client-side encryption, all your sensitive information is secured directly on your device.
                            </FeatureCard>
                            <FeatureCard title="Team Management" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.428 0m.707 0a3.002 3.002 0 013.428 0M4 11c0-1.1.9-2 2-2h3.28a1 1 0 01.948.684l1.472 4.418a.998.998 0 001.896 0l1.472-4.418A1 1 0 0114.72 9H18c1.1 0 2 .9 2 2v2a2 2 0 01-2 2h-1m-6 0h-1a2 2 0 01-2-2v-2" /></svg>}>
                                Create and manage accounts for your Admins and Virtual Assistants. Link VAs to specific WordPress sites and authors for a seamless workflow.
                            </FeatureCard>
                             <FeatureCard title="Direct WP Integration" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}>
                                Securely connect multiple WordPress sites. Fetch authors and analyze published posts directly, without any middleman.
                            </FeatureCard>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="py-20 bg-light dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Get Started in 3 Simple Steps</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                             {/* Step 1 */}
                            <div className="relative">
                                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <div className="text-4xl mb-4">1.</div>
                                    <h3 className="text-lg font-semibold mb-2">Create Account</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Sign up for a free admin account. Your workspace is instantly created and secured on your device.</p>
                                </div>
                            </div>
                            {/* Step 2 */}
                            <div className="relative">
                                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <div className="text-4xl mb-4">2.</div>
                                    <h3 className="text-lg font-semibold mb-2">Connect Sites</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Add your WordPress sites using Application Passwords for a secure, direct connection.</p>
                                </div>
                            </div>
                            {/* Step 3 */}
                            <div className="relative">
                                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <div className="text-4xl mb-4">3.</div>
                                    <h3 className="text-lg font-semibold mb-2">Invite Your Team</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Add your Virtual Assistants, link them to sites, and start managing your content workflow.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Partners Carousel */}
                <section id="partners" className="py-12 bg-gray-800 dark:bg-gray-900/70 overflow-hidden relative">
                    <div className="absolute inset-0 z-0 opacity-20">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="wave-pattern-dark" patternUnits="userSpaceOnUse" width="80" height="40" patternTransform="scale(1)">
                                    <path d="M 0 20 C 20 20 20 0 40 0 C 60 0 60 20 80 20" stroke="#4f46e5" fill="none" strokeWidth="1"></path>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#wave-pattern-dark)"></rect>
                        </svg>
                    </div>
                    <div className="relative z-10 w-full inline-flex flex-nowrap">
                        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-marquee">
                            {partners.map((logo, index) => (
                                <li key={`p1-${index}`} className="text-2xl font-bold text-gray-400 hover:text-white transition-colors duration-300 whitespace-nowrap">
                                    {logo}
                                </li>
                            ))}
                        </ul>
                        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-marquee" aria-hidden="true">
                            {partners.map((logo, index) => (
                                <li key={`p2-${index}`} className="text-2xl font-bold text-gray-400 hover:text-white transition-colors duration-300 whitespace-nowrap">
                                    {logo}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                
                {/* Testimonials Section */}
                <section id="testimonials" className="py-20 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-black">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div 
                            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 border border-gray-200 dark:border-gray-700 bg-[url('data:image/svg+xml,%3Csvg%20id%3D%22pattern%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22wave%22%20patternUnits%3D%22userSpaceOnUse%22%20width%3D%2240%22%20height%3D%2220%22%20patternTransform%3D%22scale(2)%22%3E%3Cpath%20d%3D%22M%200%2010%20C%2010%2010%2010%200%2020%200%20C%2030%200%2030%2010%2040%2010%22%20stroke%3D%22%23818cf822%22%20fill%3D%22none%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23wave)%22%2F%3E%3C%2Fsvg%3E')]"
                        >
                            <div className="text-center relative z-10">
                                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 text-sm font-bold px-3 py-1 rounded-full mb-4">
                                    <span>Testimonials</span>
                                    <span className="text-indigo-400 dark:text-indigo-500">•</span>
                                    <span>Trustpilot</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Trusted by millions.</h2>

                                <div className="flex items-center justify-center gap-4 md:gap-8 mb-4">
                                    {testimonials.map((testimonial, index) => (
                                        <button key={index} onClick={() => handleTestimonialChange(index)} className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary transition-all duration-300">
                                            <img
                                                src={testimonial.avatar}
                                                alt={testimonial.author}
                                                className={`rounded-full object-cover transition-all duration-300 ease-in-out ${
                                                    currentTestimonial === index
                                                        ? 'w-20 h-20 md:w-24 md:h-24 ring-4 ring-offset-4 dark:ring-offset-gray-800 ring-primary'
                                                        : 'w-12 h-12 md:w-16 md:h-16 opacity-50 hover:opacity-100'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className={`transition-opacity duration-200 ease-in-out ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{testimonials[currentTestimonial].author}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{testimonials[currentTestimonial].role}</p>

                                    <div className="flex items-center justify-center min-h-[120px]">
                                        <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 italic">
                                            “{testimonials[currentTestimonial].quote}”
                                        </p>
                                    </div>
                                </div>

                                {/* Navigation Arrows */}
                                <button onClick={handlePrevTestimonial} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-md z-20">
                                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button onClick={handleNextTestimonial} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-md z-20">
                                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-light dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Start for free. No credit card required.</p>
                        </div>
                        <div className="flex justify-center">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-primary w-full max-w-sm text-center">
                                <h3 className="text-2xl font-bold mb-2">Free</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">For individuals and small teams</p>
                                <p className="text-5xl font-extrabold mb-6">$0 <span className="text-lg font-normal">/ month</span></p>
                                <ul className="text-left space-y-3 mb-8">
                                    <li className="flex items-center gap-3"><span className="text-primary">✓</span> Free forever</li>
                                    <li className="flex items-center gap-3"><span className="text-primary">✓</span> Unlimited Sites</li>
                                    <li className="flex items-center gap-3"><span className="text-primary">✓</span> Unlimited VAs</li>
                                    <li className="flex items-center gap-3"><span className="text-primary">✓</span> Core Features Included</li>
                                </ul>
                                <button onClick={onSelectAdmin} className="w-full py-3 px-8 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-20 bg-white dark:bg-gray-800/20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                        </div>
                        <FaqItem question="Is my data secure?">
                            Absolutely. Security is our top priority. All your sensitive data, including site credentials and tasks, is encrypted using the AES-GCM algorithm directly on your device before being stored in your browser's local storage. Your password acts as the master key, and it is never stored or transmitted. This means only you can access your data.
                        </FaqItem>
                        <FaqItem question="Can I use ContentHub on multiple devices?">
                            Because all data is stored locally in your browser for maximum privacy, it does not automatically sync between devices. Each browser on each device will have its own separate, encrypted data store.
                        </FaqItem>
                        <FaqItem question="Do I need to install anything?">
                            No. ContentHub is a web-based application that runs entirely in your browser. There's nothing to download or install.
                        </FaqItem>
                         <FaqItem question="Is it really free?">
                            Yes. The current version of ContentHub is completely free to use. We believe in providing powerful tools to content creators to help them succeed.
                        </FaqItem>
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="py-20 bg-light dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ready to Revolutionize Your Workflow?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                            Stop juggling spreadsheets and start scaling your content production. Get started with ContentHub today.
                        </p>
                         <div className="mt-8">
                            <button onClick={onSelectAdmin} className="py-3 px-8 bg-primary border border-transparent rounded-md shadow-lg text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform hover:scale-105 transition-all">
                                Sign Up Now
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            
            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800/20 border-t border-gray-200 dark:border-gray-700">
                <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} ContentHub. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;