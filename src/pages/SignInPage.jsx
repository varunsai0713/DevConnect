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
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SignInPage() {
  const navigate = useNavigate();
  const { loginUser } = useDevConnect();

  const [email, setEmail] = useState('alex.mercer@devconnect.io');
  const [password, setPassword] = useState('Pass123!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle Form Submission with validations
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address credential.');
      return;
    }

    // Password validation (simple: at least 6 characters)
    if (password.length < 6) {
      setError('Password security constraints require at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    // Emulate TLS login validation handshake
    setTimeout(() => {
      try {
        const user = loginUser(email, password);
        setSuccess(`TLS handshake verified securely. Minted role scope [ROLE_DEVELOPER].`);
        
        setTimeout(() => {
          setIsSubmitting(false);
          // If the bio or skills are empty, redirect them to complete profile setup, otherwise dashboard
          if (!user.skills || user.skills.length === 0) {
            navigate('/profile-setup');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } catch (err) {
        setError('Verification rejected: Database endpoint connection refused.');
        setIsSubmitting(false);
      }
    }, 1200);
  };

  // Google Emulation Authentication
  const handleGoogleSignIn = () => {
    setError('');
    setIsGoogleSubmitting(true);
    
    setTimeout(() => {
      const user = loginUser('google.dev@devconnect.io', 'GoogleAuthBypass');
      setSuccess('OAuth2 authentication accepted. Mounted external token context.');
      
      setTimeout(() => {
        setIsGoogleSubmitting(false);
        // Direct route bypass if user profile checks out, otherwise to setup
        if (!user.skills || user.skills.length === 0) {
          navigate('/profile-setup');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    }, 1500);
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

      <div className="w-full max-w-lg mx-auto relative z-10 bg-slate-900/95 border border-slate-800/90 rounded-2xl p-9 shadow-2xl backdrop-blur-md">
        
        <div className="text-center mb-9">
          <h2 className="text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">Access Session</h2>
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2 font-bold">Developer Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4.5 h-4.5 w-4.5 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.mercer@devconnect.io"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-700 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">Passkey Secret</label>
              <Link to="/forgot-password" className="text-xs font-bold text-indigo-400 hover:text-indigo-350 transition">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4.5 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-12 py-4 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-750 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 px-1 py-0.5 text-slate-500 hover:text-slate-350 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Sign In submit button */}
          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-2.5 text-base shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Interpreting Token Filter Keys...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                <span>Sign In Securely</span>
              </>
            )}
          </button>
        </form>

        {/* Divider lines */}
        <div className="my-7 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800"></div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OR VERIFY VIA ENDPOINT</span>
          <div className="flex-1 h-[1px] bg-slate-800"></div>
        </div>

        {/* Google Authentication */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-4 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-3.5 text-base disabled:opacity-50 shadow-md"
        >
          {isGoogleSubmitting ? (
            <RefreshCw className="w-5 h-5 animate-spin text-slate-500" />
          ) : (
            <svg className="h-5.5 w-5.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.15-.45-.22-.92-.22-1.41z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
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
