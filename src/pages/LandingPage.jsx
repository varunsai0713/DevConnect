import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Terminal, 
  Code, 
  Cpu, 
  Zap, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  Network, 
  CornerDownRight,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Network className="w-5 h-5 text-indigo-400" />,
      title: "Project Collaboration",
      desc: "Pitch system tools, set stack criteria, and invite skilled peers directly into real-time workspaces."
    },
    {
      icon: <Users className="w-5 h-5 text-teal-400" />,
      title: "Developer Networking",
      desc: "Connect seamlessly based on specific runtime profiles. Track contributions in custom dashboards."
    },
    {
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      title: "Secure Authentication",
      desc: "Verify identity with secure Bearer keys. Maintain access credentials cleanly across dev sessions."
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-teal-400" />,
      title: "Real-Time Discussions",
      desc: "Create and search threads about GraalVM, Spring Security, DB query planning, and React rendering pipelines."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Create Account",
      desc: "Register your unique handle identifier and credential endpoints in seconds."
    },
    {
      num: "02",
      title: "Complete Profile",
      desc: "Select specific stack capabilities and detail your real-world architecture background."
    },
    {
      num: "03",
      title: "Discover Developers",
      desc: "Filter through verified specialists matching PostgreSQL or high-level React environments."
    },
    {
      num: "04",
      title: "Collaborate on Projects",
      desc: "Review proposals, accept handshakes, and build resilient modern software solutions."
    }
  ];

  return (
    <div id="landing-root" className="min-h-screen bg-[#020617] text-slate-150 font-sans relative overflow-hidden">
      
      {/* Absolute Geometric Grid Background Theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Glowing Ambient Radial Balls */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Top Header Navbar */}
      <nav id="landing-nav" className="relative z-10 border-b border-slate-900/80 bg-[#020617]/70 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/40 shadow-lg shadow-indigo-600/20">
            <div className="w-5 h-5 bg-slate-950 rounded-sm transform rotate-45 flex items-center justify-center">
              <Shield className="h-3 w-3 text-indigo-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-white">DEV<span className="text-indigo-400 font-bold">CONNECT</span></span>
            <span className="block text-[8px] text-slate-500 font-mono tracking-widest uppercase">Collaborator Shell</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Link 
            to="/login"
            className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition px-3 py-2 cursor-pointer"
          >
            Sign In
          </Link>
          <button
            onClick={() => navigate('/signup')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg border border-indigo-400/30 transition shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="landing-hero" className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center lg:pt-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-900/50 text-[10.5px] font-mono font-medium text-indigo-300 uppercase tracking-wider mb-6">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>ZERO-TRUST DEVELOPER NETWORK CONNECTION</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto font-sans">
          Connect. Collaborate.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400">Build Together.</span>
        </h1>

        <p className="mt-6 text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Skip standard empty noise. DevConnect links verified full-stack teams, database strategists, and Operations Leads on realistic, resilient project boards. Optimize high performance pipelines starting today.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm px-8 py-4 rounded-lg border border-indigo-400/40 transition-all cursor-pointer transform hover:-translate-y-0.5 shadow-xl shadow-indigo-600/15 flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-sm px-8 py-4 rounded-lg border border-slate-800 transition cursor-pointer"
          >
            Sign In with Session
          </button>
        </div>

        {/* Visual Terminal Placeholder */}
        <div className="mt-16 max-w-4xl mx-auto bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-2xl p-4 text-left backdrop-blur-sm relative">
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">TLS INSTALLED</span>
          </div>

          <div className="flex items-center gap-1.5 border-b border-slate-950 pb-3 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]/80"></span>
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]/85"></span>
            <span className="w-3 h-3 rounded-full bg-[#10b981]/80"></span>
            <span className="ml-2 text-xs font-mono text-slate-600 truncate">devconnect-broadcast-gateway://listen</span>
          </div>

          <div className="font-mono text-[11px] text-slate-400 space-y-2 select-none overflow-x-auto">
            <p className="text-indigo-400">$ npx devconnect init-handshake --profile=varunsai</p>
            <p className="text-slate-500">{"[INFO] Loading custom runtime credentials..."}</p>
            <p className="text-slate-500">{"[INFO] Initializing bearer session and verification filtering protocols..."}</p>
            <p className="text-teal-400">⚡ COMPLETED DIRECT HANDSHAKE : [Varun Sai - Lead Full Stack Engineer]</p>
            <p className="text-slate-500">{"[DEBUG] Listening on broadcast websocket socket: wss://channel-active.devconnect.org"}</p>
          </div>
        </div>
      </header>

      {/* Features Grid Section */}
      <section id="features-section" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">PLATFORM CAPABILITIES</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 text-white">Engineered For High Performance</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Eliminate low-quality clutter. Discover key capabilities crafted exactly to support real software deployment workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-6 transition hover:border-indigo-500/50 backdrop-blur-sm">
              <div className="p-3 bg-slate-950 rounded-lg w-fit border border-slate-850 mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 bg-slate-950/30">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">THE WORKFLOW</span>
          <h2 className="text-3xl font-black mt-2 text-white">How It Works</h2>
          <p className="text-xs text-slate-500 mt-2">
            Incredibly easy, highly technical. Get active from setup to deployment in four simple phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, i) => (
            <div key={i} className="bg-[#020617] border border-slate-900 rounded-xl p-6 transition relative">
              <span className="block text-3xl font-black text-slate-800 font-mono mb-4">{s.num}</span>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{s.title}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action center section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center my-12 bg-gradient-to-br from-indigo-950/40 to-slate-950/20 border border-indigo-900/60 rounded-3xl backdrop-blur-md">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to connect with top-tier practitioners?</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Create validation credentials, specify skills tags, and pitch real tasks directly. Connect with absolute JPA or frontend visual wizards.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-8 py-3 rounded-lg border border-indigo-500/40 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
        >
          Begin Setup Tunnel
        </button>
      </section>

      {/* Footer Area */}
      <footer id="landing-footer" className="relative z-10 border-t border-slate-900 bg-[#020617] px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/40">
              <Shield className="h-2.5 w-2.5 text-indigo-400 transform -rotate-45" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white">DEVCONNECT</span>
              <span className="block text-[7px] text-slate-500 font-mono">PORTAL TUNNELS SECURED</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
            <Link to="/" className="hover:text-slate-300">About</Link>
            <Link to="/" className="hover:text-slate-300">Contact</Link>
            <Link to="/" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/" className="hover:text-slate-300">Terms of Service</Link>
          </div>

          <div className="text-[10px] text-slate-650 font-mono">
            © {new Date().getFullYear()} DEVCONNECT INC. BYPASS CODES TRUSTED.
          </div>
        </div>
      </footer>
    </div>
  );
}
