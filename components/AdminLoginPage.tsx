import React, { useState } from 'react';

interface AdminLoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean; email?: string; error?: string }>;
  onVerifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (username: string, password: string, email: string) => Promise<{ success: boolean, error?: string }>;
  onBack: () => void;
}

const obfuscateEmail = (email: string): string => {
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

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onVerifyCode, onSignUp, onBack }) => {
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await onLogin(identifier, password);
    if (result.success) {
      if (result.needsVerification) {
        setVerificationEmail(result.email || '');
        setStep('verification');
      }
      // On direct success (no verification needed), App component will handle navigation
    } else {
      setError(result.error || 'Invalid username/email or password.');
    }
    setIsLoading(false);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await onVerifyCode(verificationCode);
    if (!result.success) {
        setError(result.error || 'An error occurred during verification.');
    }
    // On success, App component will handle navigation
    setIsLoading(false);
  }

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    const result = await onSignUp(username, password, email);
    if (!result.success) {
      setError(result.error || 'An error occurred during sign up.');
    }
    // on success, App component will re-render and this component will be unmounted
    setIsLoading(false);
  }
  
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setIdentifier('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setStep('credentials');
  };
  
  const handleGoBackToCredentials = () => {
    setStep('credentials');
    setError('');
    setPassword('');
    setVerificationCode('');
  }

  const renderCredentialsForm = () => (
    <form className="space-y-6" onSubmit={handleCredentialSubmit}>
      <div>
        <label htmlFor="identifier-login" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Username or Email
        </label>
        <div className="mt-1">
          <input
            id="identifier-login"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );

  const renderSignUpForm = () => (
    <form className="space-y-6" onSubmit={handleSignUpSubmit}>
       <div>
        <label htmlFor="username-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Username
        </label>
        <div className="mt-1">
          <input
            id="username-signup"
            name="username-signup"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
        <div>
        <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <div className="mt-1">
          <input
            id="email-signup"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password-signup"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password-signup"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
       <div>
        <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Sign up'}
        </button>
      </div>
    </form>
  );

  const renderVerificationForm = () => (
     <form className="space-y-6" onSubmit={handleVerificationSubmit}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Check your email</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            A verification code has been sent to <br/>
            <strong className="font-medium text-gray-800 dark:text-gray-200">{obfuscateEmail(verificationEmail)}</strong>.
            <br/>(For this demo, the code will appear in an alert.)
        </p>
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
          Verification Code
        </label>
        <div className="mt-1">
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 dark:text-white text-center text-lg tracking-[0.5em]"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
         <svg className="h-12 w-auto text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
        </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {isSignUp ? 'Create Admin Account' : 'Admin & Owner Login'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {step === 'credentials' && (isSignUp ? renderSignUpForm() : renderCredentialsForm())}
            {step === 'verification' && renderVerificationForm()}
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mt-4 text-center">
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
            )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {step === 'verification' ? 'Need to re-enter credentials?' : (isSignUp ? 'Already have an account?' : "Need a new admin space?")}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {step === 'credentials' && (
                <button
                    onClick={toggleMode}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    {isSignUp ? 'Sign in instead' : 'Create new account'}
                </button>
              )}
               {step === 'verification' && (
                 <button
                    onClick={handleGoBackToCredentials}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                   &larr; Back to Sign In
                </button>
              )}
              <button
                onClick={onBack}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-dark"
              >
                &larr; Back to portal selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;