import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, RefreshCw, Shield, User } from 'lucide-react';
import { useDevConnect } from '../context/DevConnectContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { registerUser } = useDevConnect();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername.length < 3) {
      setError('Your username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      setError('Your password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser(normalizedUsername, normalizedUsername, `${normalizedUsername}@devconnect.local`, password);
      navigate('/profile-setup');
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    setError('Google sign-up is not configured yet. Please create an account with a username and password.');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-150 font-sans flex flex-col justify-center relative py-12 px-6">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] z-0"
        style={{
          backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/30 group-hover:bg-indigo-500 transition">
            <Shield className="h-2.5 w-2.5 text-indigo-400 transform -rotate-45" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">DEVCONNECT</span>
        </Link>
      </div>

      <main className="w-full max-w-md mx-auto relative z-10 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-black text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-slate-400 mt-2">Choose a username and password to get started.</p>
        </div>

        {error && (
          <div role="alert" className="mb-5 p-3.5 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-sm rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="signup-username" className="block text-xs font-medium text-slate-300">Username</label>
            </div>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                value={username}
                onChange={(event) => setUsername(event.target.value.replace(/\s+/g, ''))}
                placeholder="Choose a username"
                disabled={isSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                disabled={isSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isSubmitting}
          className="w-full bg-[#020617] hover:bg-slate-950 text-slate-200 hover:text-white border border-slate-800 font-semibold py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2.5 text-sm disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.578 0-6.49-2.912-6.49-6.49s2.912-6.49 6.49-6.49c1.678 0 3.102.61 4.182 1.628l3.102-3.102C19.23 2.13 15.93 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c6.82 0 12.76-4.91 12.76-12.24 0-.71-.08-1.53-.16-2.2H12.24z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
