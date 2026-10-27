import React, { useState } from 'react';
import { X, User, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function OAuthModal({
  isOpen,
  provider,
  onClose,
  onAuthenticate,
  isSubmitting,
}) {
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = (accountData) => {
    setSelectedEmail(accountData.email);
    onAuthenticate(accountData);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const email = customEmail.trim();
    setSelectedEmail(email);
    onAuthenticate({
      email,
      fullName: email.split('@')[0],
      username: email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, ''),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div 
        className="w-full max-w-[420px] bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden relative font-sans text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitting ? (
          /* Loading / Connecting state */
          <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
            <h3 className="text-base font-semibold text-white">
              Connecting with {provider}...
            </h3>
            <p className="text-xs text-slate-400 mt-1.5">
              Authenticating as {selectedEmail || 'selected account'} and preparing your workspace.
            </p>
          </div>
        ) : provider === 'Google' ? (
          /* GOOGLE OAUTH DIALOG */
          <div className="p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h2 className="text-lg font-bold text-white tracking-tight">Sign in with Google</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Choose an account to continue to <span className="font-semibold text-slate-200">DevConnect</span>
            </p>

            {showCustomInput ? (
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Enter your Google email address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="example@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to accounts
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2.5">
                {/* Default Account 1 */}
                <div
                  onClick={() => handleSelectAccount({
                    email: 'alex.rivera@gmail.com',
                    fullName: 'Alex Rivera',
                    username: 'alex_rivera',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
                  })}
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-indigo-500/60 hover:bg-slate-800/50 flex items-center gap-3.5 transition cursor-pointer text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                    alt="Alex Rivera"
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-400 truncate">Alex Rivera</div>
                    <div className="text-xs text-slate-400 truncate">alex.rivera@gmail.com</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </div>

                {/* Account 2 */}
                <div
                  onClick={() => handleSelectAccount({
                    email: 'devconnect.coder@gmail.com',
                    fullName: 'DevConnect Coder',
                    username: 'devconnect_coder',
                    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
                  })}
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-indigo-500/60 hover:bg-slate-800/50 flex items-center gap-3.5 transition cursor-pointer text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150"
                    alt="DevConnect Coder"
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-400 truncate">DevConnect Coder</div>
                    <div className="text-xs text-slate-400 truncate">devconnect.coder@gmail.com</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </div>

                {/* Option to use another custom account */}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full p-3 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-950 flex items-center gap-3.5 transition cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-medium text-slate-300">Use another Google account</div>
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              To continue, Google will share your name, email address, language preference, and profile picture with DevConnect.
            </div>
          </div>
        ) : provider === 'LinkedIn' ? (
          /* LINKEDIN OAUTH DIALOG */
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-1.5">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <h2 className="text-lg font-bold text-white tracking-tight">Sign in with LinkedIn</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Authorize <span className="font-semibold text-slate-200">DevConnect</span> to access your LinkedIn identity.
            </p>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 mb-5">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                  alt="LinkedIn User"
                  className="w-11 h-11 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="text-sm font-semibold text-white">Alex Rivera</div>
                  <div className="text-xs text-slate-400">alex.rivera@linkedin.com</div>
                  <div className="text-[10px] text-indigo-400 font-medium mt-0.5">Full Stack Engineer</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectAccount({
                email: 'alex.rivera@linkedin.com',
                fullName: 'Alex Rivera',
                username: 'alex_linkedin',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
              })}
              className="w-full bg-[#0A66C2] hover:bg-[#084e96] text-white font-medium py-3 px-4 rounded-lg transition duration-150 text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              Continue as Alex Rivera
            </button>
          </div>
        ) : (
          /* GITHUB OAUTH DIALOG */
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-1.5">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="#FFFFFF">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <h2 className="text-lg font-bold text-white tracking-tight">Authorize DevConnect</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Sign in using your <span className="font-semibold text-slate-200">GitHub</span> credentials.
            </p>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 mb-5">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="GitHub Developer"
                  className="w-11 h-11 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="text-sm font-semibold text-white">octodev</div>
                  <div className="text-xs text-slate-400">octodev@github.com</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">Verified GitHub Account</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectAccount({
                email: 'octodev@github.com',
                fullName: 'Octo Developer',
                username: 'octodev',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
              })}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg transition duration-150 text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              Authorize with GitHub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
