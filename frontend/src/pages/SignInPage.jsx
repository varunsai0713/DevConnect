import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDevConnect } from '../context/DevConnectContext';
import { 
  Shield, 
  Mail, 
  Lock, 
  RefreshCw, 
  KeyRound, 
  Cpu,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function SignInPage() {
  const navigate = useNavigate();
  const { loginUser } = useDevConnect();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Form Submission with validations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your username or email address.');
      return;
    }

    // Password validation (simple: at least 6 characters)
    if (password.length < 6) {
      setError('Password security constraints require at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await loginUser(email, password);
      setSuccess('Signed in successfully.');
      setIsSubmitting(false);
      navigate(user.skills.length === 0 ? '/profile-setup' : '/dashboard');
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('Google sign-in is not configured yet. Please sign in with your username and password.');
  };

  return (
    <div id="signin-root" className="min-h-screen bg-[#020617] text-slate-150 font-sans flex flex-col justify-center relative py-12 px-6">
      
      {/* Absolute Geometric Grid Background Theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/30 group-hover:bg-indigo-500 transition">
            <Shield className="h-2..5 w-2.5 text-indigo-400 transform -rotate-45" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">DEVCONNECT</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight">Access Session</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Enter your validation credentials to bypass standard route guards.
          </p>
        </div>

        {/* Validation Errors & Success logs */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-xs rounded-lg flex items-start gap-2.5 leading-normal">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-xs rounded-lg flex items-start gap-2.5 leading-normal">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Username or Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
              <input 
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username or email"
                disabled={isSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-700 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500">Security Password</label>
              <Link to="/forgot-password" className="text-[10.5px] font-semibold text-indigo-400 hover:text-indigo-300 transition">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-750 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Sign In submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Interpreting Token Filter Keys...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In Securely</span>
              </>
            )}
          </button>
        </form>

        {/* Divider lines */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800"></div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OR CONTINUES</span>
          <div className="flex-1 h-[1px] bg-slate-800"></div>
        </div>

        {/* Google Authentication */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full bg-[#020617] hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-800 font-bold py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2.5 text-xs disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.578 0-6.49-2.912-6.49-6.49s2.912-6.49 6.49-6.49c1.678 0 3.102.61 4.182 1.628l3.102-3.102C19.23 2.13 15.93 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c6.82 0 12.76-4.91 12.76-12.24 0-.71-.08-1.53-.16-2.2H12.24z"/>
          </svg>
          <span>Continue with Google Single-Sign-On</span>
        </button>

        {/* Footer redirection */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            First visit regarding this channel?{' '}
            <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 underline transition ml-1">
              Create Account Tunnel
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
