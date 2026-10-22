import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  ArrowRight,
  Send,
  Cpu
} from 'lucide-react';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleResend = () => {
    setIsResending(true);
    setResendStatus('');

    setTimeout(() => {
      setIsResending(false);
      setResendStatus('A fresh verification payload hash has been transmitted of type OUTBOUND_HMAC_SHA256.');
    }, 1200);
  };

  const handleManualVerifyBypass = () => {
    navigate('/profile-setup');
  };

  return (
    <div id="verify-root" className="min-h-screen bg-[#020617] text-slate-150 font-sans flex flex-col justify-center relative py-12 px-6">
      
      {/* Absolute Geometric Grid Background Theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Decorative Blob */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/5 blur-[90px] rounded-full pointer-events-none z-0" />

      <div className="w-full max-w-md mx-auto relative z-10 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl text-center backdrop-blur-sm">
        
        {/* Success Illustration (Geometric Terminal Animation Pattern) */}
        <div className="mx-auto w-16 h-16 bg-indigo-950 border border-indigo-900 rounded-2xl flex items-center justify-center mb-6 transform rotate-12 relative shadow-lg shadow-indigo-500/10">
          <div className="absolute inset-1 border border-indigo-800/40 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h2>
        
        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
          We have generated an encrypted handshake link and sent it to your registered credentials address. Please inspect your inbox container to authorize the session.
        </p>

        {/* Resend status alert banner */}
        {resendStatus && (
          <div className="my-5 p-3.5 bg-indigo-950/40 border border-indigo-900/50 rounded-lg text-indigo-300 text-[11px] font-mono leading-normal text-left flex items-start gap-2">
            <Cpu className="w-3.5 h-3.5 scale-90 text-indigo-400 shrink-0 mt-0.5 animate-spin" />
            <span>{resendStatus}</span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {/* Main Action Button - Setup Profile Setup Direct Bypass for easy UX */}
          <button
            onClick={handleManualVerifyBypass}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-xs font-mono tracking-wide"
          >
            <span>CONFIRM INTERCEPT & MOVE TO SETUP</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full bg-[#020617] hover:bg-slate-950 text-slate-300 hover:text-white border border-slate-850 py-3 px-4 rounded-lg cursor-pointer font-bold transition flex items-center justify-center gap-2 text-xs"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span>Generating payload...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-slate-400" />
                <span>Resend Verification Link</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/50">
          <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition">
            Disconnect registration stream & sign out
          </Link>
        </div>

      </div>
    </div>
  );
}
