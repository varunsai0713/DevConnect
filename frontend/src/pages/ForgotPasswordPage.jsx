import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  RefreshCw, 
  KeyRound, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex.mercer@devconnect.io');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid credentials email format.');
      return;
    }

    setIsSubmitting(true);

    // Dynamic rotation simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div id="forgot-root" className="min-h-screen bg-[#020617] text-slate-150 font-sans flex flex-col justify-center relative py-12 px-6">
      
      {/* Absolute Geometric Grid Background Theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Navigation Brand */}
      <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/30">
            <Shield className="h-2.5 w-2.5 text-indigo-400 transform -rotate-45" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">DEVCONNECT</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group mb-3">
            <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition" />
            <span>Back to Connect Session</span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">Key Rotation Request</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Enter your email to request the generation of an out-of-band JWT validation secret code.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-xs rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Registered Identity Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex.mercer@devconnect.io"
                  disabled={isSubmitting}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Requesting New Claims Signature Token...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Outbound Claims Link Dispatched</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              An encryption bypass link was triggered and delivered to <span className="font-mono font-bold text-white">{email}</span>. Click this placeholder to access credential updates securely.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full bg-slate-950 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-850 py-2.5 px-3 rounded-lg font-bold transition"
              >
                Proceed to Connect Portal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
