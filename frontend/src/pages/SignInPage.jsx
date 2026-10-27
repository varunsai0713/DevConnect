import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDevConnect } from '../context/DevConnectContext';
import OAuthModal from '../components/OAuthModal';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';

export default function SignInPage() {
  const navigate = useNavigate();
  const { loginUser, socialLogin } = useDevConnect();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OAuth modal states
  const [activeOAuthProvider, setActiveOAuthProvider] = useState(null);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);

  // Standard Username/Email & Password Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your username or email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await loginUser(email, password);
      setSuccess('Signed in successfully.');
      setIsSubmitting(false);
      navigate(user.skills && user.skills.length === 0 ? '/profile-setup' : '/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Invalid username/email or password.');
      setIsSubmitting(false);
    }
  };

  // Open Social / OAuth dialog
  const handleSocialClick = (provider) => {
    setError('');
    setActiveOAuthProvider(provider);
  };

  // Process Social Authenticate callback
  const handleOAuthAuthenticate = async (accountData) => {
    setIsOAuthSubmitting(true);
    setError('');

    try {
      const user = await socialLogin(activeOAuthProvider, accountData);
      setIsOAuthSubmitting(false);
      setActiveOAuthProvider(null);
      setSuccess(`Signed in with ${activeOAuthProvider} as ${accountData.email}`);
      navigate(user.skills && user.skills.length === 0 ? '/profile-setup' : '/dashboard');
    } catch (err) {
      setIsOAuthSubmitting(false);
      setError(err.message || `Failed to sign in with ${activeOAuthProvider}.`);
    }
  };

  return (
    <div id="signin-root" className="min-h-screen bg-[#020617] text-slate-150 font-sans flex flex-col justify-center relative py-12 px-4 sm:px-6">
      
      {/* Absolute Geometric Grid Background Theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Ambient Radial Glows */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* DevConnect Brand in Header */}
      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/30 group-hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20">
            <Shield className="h-2.5 w-2.5 text-indigo-300 transform -rotate-45" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">DEVCONNECT</span>
        </Link>
      </div>

      {/* Main Login Card - Unified Website Theme */}
      <div className="w-full max-w-md mx-auto relative z-10 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-7 sm:p-9 shadow-2xl backdrop-blur-sm">
        
        {/* Continue with Google */}
        <button
          type="button"
          onClick={() => handleSocialClick('Google')}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-950 hover:bg-slate-800/80 active:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Social Provider Icons Row - LinkedIn and GitHub only */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* LinkedIn */}
          <button
            type="button"
            onClick={() => handleSocialClick('LinkedIn')}
            className="w-11 h-11 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center hover:border-slate-700 hover:bg-slate-900 transition shadow-xs cursor-pointer group"
            title="Continue with LinkedIn"
          >
            <svg className="w-5 h-5 shrink-0 transition group-hover:scale-105" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleSocialClick('GitHub')}
            className="w-11 h-11 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center hover:border-slate-700 hover:bg-slate-900 transition shadow-xs cursor-pointer group"
            title="Continue with GitHub"
          >
            <svg className="w-5 h-5 shrink-0 transition group-hover:scale-105" viewBox="0 0 24 24" fill="#FFFFFF">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </button>
        </div>

        {/* Divider lines */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-slate-900 px-3 text-xs text-slate-500 font-normal">
            or
          </span>
        </div>

        {/* Validation Errors & Success messages */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-xs rounded-lg flex items-start gap-2 leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-xs rounded-lg flex items-start gap-2 leading-relaxed">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username or Email
            </label>
            <input 
              type="text"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your username or email"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isSubmitting}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <Eye className="w-4 h-4 text-slate-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>
            <div className="mt-2 text-left">
              <Link 
                to="/forgot-password" 
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-normal"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Sign In submit button (Website Indigo/Blue theme) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg cursor-pointer transition duration-150 flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/20 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Agreement / Privacy & Cookie Policy Disclaimer */}
        <p className="text-xs text-center text-slate-400 mt-6 leading-relaxed">
          By signing in, you agree to our{' '}
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-slate-300 font-medium hover:underline">
            Privacy Policy
          </a>{' '}
          &amp;{' '}
          <a href="#cookie" onClick={(e) => e.preventDefault()} className="text-slate-300 font-medium hover:underline">
            Cookie Policy
          </a>.
        </p>

        {/* Sign up Link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 underline ml-1">
              Sign up
            </Link>
          </p>
        </div>

      </div>

      {/* Interactive OAuth Modal Dialog (Google / LinkedIn / GitHub) */}
      <OAuthModal
        isOpen={!!activeOAuthProvider}
        provider={activeOAuthProvider}
        onClose={() => setActiveOAuthProvider(null)}
        onAuthenticate={handleOAuthAuthenticate}
        isSubmitting={isOAuthSubmitting}
      />
    </div>
  );
}
