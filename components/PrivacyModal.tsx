import React from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyFeature: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    </div>
);


const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Privacy & Security</h3>
          <button type="button" onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="text-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-primary">Your Data Stays on Your Device</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">We believe in privacy by design. This application operates entirely within your browser and uses strong cryptography to protect your information.</p>
            </div>
            
            <div className="space-y-5">
                 <PrivacyFeature
                    title="Password Hashing"
                    description="Your password is never stored. It is securely hashed using the industry-standard PBKDF2 algorithm, making it virtually impossible to reverse-engineer."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                />
                <PrivacyFeature
                    title="Workspace Encryption"
                    description="Your data (sites, tasks, etc.) is encrypted on your device using your password as the key (AES-GCM). Only you can decrypt it when you log in."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.789-2.756 9.356-1.749 2.567-2.756 5.39-2.756 8.144H12a10 10 0 0010-10c0-5.523-4.477-10-10-10S2 5.477 2 11c0 2.754 1.007 5.577 2.756 8.144C6.502 21.789 7.51 25 12 25h.008" /></svg>}
                />
                 <PrivacyFeature
                    title="100% Client-Side Storage"
                    description="All your encrypted data and hashed passwords are stored securely in your browser's local storage. They never leave your computer."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>}
                />
                 <PrivacyFeature
                    title="Direct API Connections"
                    description="When fetching data from WordPress or using the Gemini API, your browser connects directly to those services. Your credentials are not routed through our systems."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                />
            </div>
             <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p><strong>Note:</strong> Because data is stored locally, it will not sync between different browsers or computers. Logging out securely clears the decryption key from memory.</p>
            </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;