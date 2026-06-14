import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDevConnect } from '../context/DevConnectContext';
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  RefreshCw, 
  Cpu, 
  CheckCircle, 
  AlertTriangle,
  FileCode,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { registerUser, loginUser, checkUsernameExists } = useDevConnect();

  const [fullName, setFullName] = useState('Varun Sai');
  const [username, setUsername] = useState('varun_dev');
  const [email, setEmail] = useState('varun.sai@devconnect.io');
  const [password, setPassword] = useState('SecurePass123!');
  const [confirmPassword, setConfirmPassword] = useState('SecurePass123!');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Uniqueness check state
  const [usernameStatus, setUsernameStatus] = useState({ checked: false, exists: false });
  // Password strength checker state
  const [passStrength, setPassStrength] = useState({ text: 'Weak', score: 0, color: 'text-rose-500 bg-rose-950/40 border-rose-900/60' });

  // Evaluate Username Uniqueness instantly on edit
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({ checked: false, exists: false });
      return;
    }
    const timer = setTimeout(() => {
      const exists = checkUsernameExists(username);
      setUsernameStatus({ checked: true, exists });
    }, 400);

    return () => clearTimeout(timer);
  }, [username, checkUsernameExists]);

  // Evaluate Password Strength instantly on edit
  useEffect(() => {
    if (!password) {
      setPassStrength({ text: 'Weak', score: 0, color: 'text-rose-500 bg-rose-950/40 border-rose-900/40' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      setPassStrength({ text: 'Weak - Needs uppercase, number or special char', score, color: 'text-rose-400 bg-rose-950/40 border-rose-900/40' });
    } else if (score === 2 || score === 3) {
      setPassStrength({ text: 'Medium - Good security posture', score, color: 'text-amber-400 bg-amber-950/40 border-amber-900/40' });
    } else {
      setPassStrength({ text: 'Strong - High integrity key', score, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-950/40' });
    }
  }, [password]);

  // Handle Register submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!acceptTerms) {
      setError('You must accept the terms of tunnel connectivity to register.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (username.length < 3) {
      setError('Username identifier must be at least 3 characters.');
      return;
    }

    if (usernameStatus.exists) {
      setError('Username channel is already occupied. Choose another.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Confirm key value does not match your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must feature at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        registerUser(username, fullName, email, password);
        setSuccess('Developer account tunnel initialized successfully! Dynamic verification code triggered.');
        
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/verify-email');
        }, 1100);
      } catch (err) {
        setError('Failed to complete. Please try again.');
        setIsSubmitting(false);
      }
    }, 1300);
  };

  // Google SSO mock for registration
  const handleGoogleMock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const user = loginUser('google.dev@devconnect.io', 'GoogleMockPass');
      setSuccess('OAuth2 profile connected successfully.');
      setTimeout(() => {
        setIsSubmitting(false);
        if (!user.skills || user.skills.length === 0) {
          navigate('/profile-setup');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    }, 1200);
  };

  return (
    <div id="signup-root" className="min-h-screen bg-[#020617] text-slate-150 font-sans flex flex-col justify-center relative py-12 px-6">
      
      {/* Absolute Geometric Grid Background Theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Decorative Blur Ambient Backgrounds */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/30 group-hover:bg-indigo-500 transition">
            <Shield className="h-2.5 w-2.5 text-indigo-400 transform -rotate-45" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">DEVCONNECT</span>
        </Link>
      </div>

      <div className="w-full max-w-lg mx-auto relative z-10 bg-slate-900/95 border border-slate-800/90 rounded-2xl p-9 shadow-2xl backdrop-blur-md">
        
        <div className="text-center mb-7">
          <h2 className="text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">Create Profile Engine</h2>
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
            Mount your unique developer profile onto our zero-trust tunnel network.
          </p>
        </div>

        {/* Action Feedbacks */}
        {error && (
          <div className="mb-4 p-4 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-xs rounded-lg flex items-start gap-2.5 leading-normal">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-xs rounded-lg flex items-start gap-2.5">
            <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-400 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2 font-bold">Developer Full Name</label>
              <div className="relative">
                <FileCode className="absolute left-3.5 top-4 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Varun Sai"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-3 py-3.5 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-700 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Username + unique UI check feedback */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">Unique Username</label>
                {usernameStatus.checked && (
                  usernameStatus.exists ? (
                    <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-0.5">
                      <X className="w-2.5 h-2.5" /> Taken
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Available
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-4 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. varunsai"
                  disabled={isSubmitting}
                  className={`w-full bg-slate-950 border rounded-xl pl-11 pr-3 py-3.5 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-705 disabled:opacity-50 ${
                    usernameStatus.checked 
                      ? (usernameStatus.exists ? 'border-rose-900/40 ring-1 ring-rose-500/20' : 'border-emerald-900/40 ring-1 ring-emerald-500/10') 
                      : 'border-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2 font-bold">Credentials Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-4 h-4 w-4 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. varun.sai@devconnect.io"
                disabled={isSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-3 py-3.5 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-700 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2 font-bold">Passkey Secret</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-4 h-4 w-4 text-slate-500 pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-10 py-3.5 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-750 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2 font-bold">Confirm Secret</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-4 h-4 w-4 text-slate-500 pointer-events-none" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-10 py-3.5 text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-750 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350 transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Password Strength Indicator */}
          {password && (
            <div className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center gap-2 transition ${passStrength.color}`}>
              <Cpu className="w-4 h-4 shrink-0 animate-pulse" />
              <span>STRENGTH LEVEL: <span className="font-bold">{passStrength.text}</span></span>
            </div>
          )}

          {/* Checkbox */}
          <div className="flex items-start gap-2.5 pt-1.5">
            <input 
              type="checkbox" 
              id="terms_agree" 
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 uppercase font-bold"
            />
            <label htmlFor="terms_agree" className="text-xs text-slate-400 leading-normal select-none">
              I agree to comply with standard security filter intercept policies and establish zero-trust validation tunnels across DevConnect channels.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-2.5 text-base shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Assembling Container Profile Bean...</span>
              </>
            ) : (
              <span>Create Account Tunnel</span>
            )}
          </button>
        </form>

        <div className="my-7 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800"></div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OR REGISTER VIA GATEWAY</span>
          <div className="flex-1 h-[1px] bg-slate-800"></div>
        </div>

        {/* Google Register */}
        <button
          type="button"
          onClick={handleGoogleMock}
          disabled={isSubmitting}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-4 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-3.5 text-base disabled:opacity-50 shadow-md"
        >
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
          <span>Sign up with Google</span>
        </button>

        {/* Redirect */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Already verified your identity channel?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 underline transition ml-1">
              Connect Session
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
