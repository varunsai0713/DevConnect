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
  X
} from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { registerUser, checkUsernameExists } = useDevConnect();

  const [fullName, setFullName] = useState('Varun Sai');
  const [username, setUsername] = useState('varun_dev');
  const [email, setEmail] = useState('varun.sai@devconnect.io');
  const [password, setPassword] = useState('SecurePass123!');
  const [confirmPassword, setConfirmPassword] = useState('SecurePass123!');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      registerUser('google_coder', 'Google Developer', 'google.dev@devconnect.io', 'GoogleMockPass');
      setSuccess('OAuth2 profile connected successfully.');
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/verify-email');
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

      <div className="w-full max-w-lg mx-auto relative z-10 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">Create Profile Engine</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Developer Full Name</label>
              <div className="relative">
                <FileCode className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Varun Sai"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-700 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Username + unique UI check feedback */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500">Unique Username</label>
                {usernameStatus.checked && (
                  usernameStatus.exists ? (
                    <span className="text-[9px] font-mono text-rose-400 font-bold flex items-center gap-0.5">
                      <X className="w-2.5 h-2.5" /> Taken
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Available
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. varunsai"
                  disabled={isSubmitting}
                  className={`w-full bg-slate-950 border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-705 disabled:opacity-50 ${
                    usernameStatus.checked 
                      ? (usernameStatus.exists ? 'border-rose-900/40 ring-1 ring-rose-500/20' : 'border-emerald-900/40 ring-1 ring-emerald-500/10') 
                      : 'border-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Credentials Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. varun.sai@devconnect.io"
                disabled={isSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-700 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Passkey Secret</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-750 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Confirm Secret</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-750 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Interactive Password Strength Indicator */}
          {password && (
            <div className={`p-2 rounded-lg border text-[11px] font-mono flex items-center gap-2 transition ${passStrength.color}`}>
              <Cpu className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span>STRENGTH LEVEL: <span className="font-bold">{passStrength.text}</span></span>
            </div>
          )}

          {/* Checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input 
              type="checkbox" 
              id="terms_agree" 
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 uppercase font-bold"
            />
            <label htmlFor="terms_agree" className="text-[11px] text-slate-400 leading-normal select-none">
              I agree to comply with standard security filter intercept policies and establish zero-trust validation tunnels across DevConnect channels.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Assembling Container Profile Bean...</span>
              </>
            ) : (
              <span>Create Account Tunnel</span>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-2">
          <div className="flex-1 h-[1px] bg-slate-800"></div>
          <span className="text-[9px] font-mono text-slate-505 uppercase tracking-wider">OR REGISTER VIA</span>
          <div className="flex-1 h-[1px] bg-slate-800"></div>
        </div>

        {/* Google Register */}
        <button
          type="button"
          onClick={handleGoogleMock}
          disabled={isSubmitting}
          className="w-full bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-800 font-bold py-2.5 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-xs"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.578 0-6.49-2.912-6.49-6.49s2.912-6.49 6.49-6.49c1.678 0 3.102.61 4.182 1.628l3.102-3.102C19.23 2.13 15.93 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c6.82 0 12.76-4.91 12.76-12.24 0-.71-.08-1.53-.16-2.2H12.24z"/>
          </svg>
          <span>Continue with Google Single-Sign-On</span>
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
