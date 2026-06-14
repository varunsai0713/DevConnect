import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDevConnect } from '../context/DevConnectContext';
import { 
  Shield, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Plus, 
  Heart, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  X, 
  Terminal, 
  Cpu, 
  Users, 
  Sliders, 
  ExternalLink,
  ThumbsUp,
  MapPin,
  Globe,
  Settings,
  FolderPlus,
  ChevronDown,
  Github,
  Linkedin
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    projects, 
    discussions, 
    users, 
    notifications, 
    collabRequests, 
    likeProject, 
    addProjectPitch, 
    applyForCollaboration, 
    addDiscussionPost, 
    upvoteDiscussion, 
    replyToDiscussion, 
    handleCollabAction,
    toggleUserFollow, 
    clearNotifications,
    logoutUser 
  } = useDevConnect();

  // Redirect if session state is missing
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  // Component UI States
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'discussions' | 'invitations'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create project pitch state
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [pitchTitle, setPitchTitle] = useState('');
  const [pitchDesc, setPitchDesc] = useState('');
  const [pitchTags, setPitchTags] = useState('React, Spring Boot');

  // Create discussion state
  const [showDiscModal, setShowDiscModal] = useState(false);
  const [discTitle, setDiscTitle] = useState('');
  const [discContent, setDiscContent] = useState('');
  const [discCat, setDiscCat] = useState('Backend');

  // Collaboration application states
  const [applyProjectId, setApplyProjectId] = useState(null);
  const [applyMsg, setApplyMsg] = useState('Hey there! Extremely interested in the layout stack criteria.');

  // Replies states
  const [replyInputMap, setReplyInputMap] = useState({});

  // Show dropdown menus
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Filter projects/discussions lists based on search query
  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

  const filteredDiscussions = useMemo(() => {
    return discussions.filter(d => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [discussions, searchQuery]);

  // Handle post project pitch
  const handlePitchSubmit = (e) => {
    e.preventDefault();
    if (!pitchTitle.trim()) return;
    const tagsArr = pitchTags.split(',').map(t => t.trim()).filter(Boolean);
    addProjectPitch(pitchTitle, pitchDesc, tagsArr);
    
    // Clear & close
    setPitchTitle('');
    setPitchDesc('');
    setPitchTags('React, Spring Boot');
    setShowPitchModal(false);
  };

  // Handle post discussion question
  const handleDiscSubmit = (e) => {
    e.preventDefault();
    if (!discTitle.trim()) return;
    addDiscussionPost(discTitle, discContent, discCat);
    
    // Clear & close
    setDiscTitle('');
    setDiscContent('');
    setShowDiscModal(false);
  };

  // Handle apply to collaboration handshake
  const handleApplyCollab = (e) => {
    e.preventDefault();
    if (!applyProjectId) return;
    applyForCollaboration(applyProjectId, applyMsg);
    setApplyProjectId(null);
    setApplyMsg('Hey there! Extremely interested in the layout stack criteria.');
  };

  // Handle dispatch replies
  const handleReplySubmit = (discId) => {
    const text = replyInputMap[discId];
    if (!text || !text.trim()) return;
    replyToDiscussion(discId, text);
    
    // reset input fields
    setReplyInputMap(prev => ({ ...prev, [discId]: '' }));
  };

  // Connection recommendations (omit current logged in user)
  const recommendations = useMemo(() => {
    return users.filter(u => u.id !== currentUser.id);
  }, [users, currentUser]);

  const liveConnections = useMemo(() => {
    return users.filter(u => u.isFollowed && u.id !== currentUser.id);
  }, [users, currentUser]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div id="dashboard-root" className="min-h-screen bg-[#020617] text-slate-100 font-sans relative">
      
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Top Navbar Header */}
      <nav className="relative z-35 border-b border-slate-900 bg-[#020617]/80 backdrop-blur-md sticky top-0 px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-500/30">
            <Shield className="h-4 w-4 text-indigo-400 transform -rotate-45" />
          </Link>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white leading-tight">DEV<span className="text-indigo-400 font-bold">CONNECT</span></span>
            <span className="text-[8px] text-indigo-400/80 font-mono tracking-widest uppercase">MEMBER CONTEXT v3.00</span>
          </div>
        </div>

        {/* Global Search Filtering */}
        <div className="hidden md:flex items-center bg-slate-950 border border-slate-850 px-3.5 py-1.5 rounded-lg w-96 relative">
          <Search className="w-4 h-4 text-slate-600 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search projects, stack tags, or discussion titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-200 outline-none w-full placeholder:text-slate-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-2.5 text-slate-650 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Alert Notifications bell & user profile controls */}
        <div className="flex items-center gap-3.5 relative">
          
          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); }}
              className={`p-2 bg-slate-950 border rounded-lg hover:border-slate-800 transition cursor-pointer relative ${showNotifMenu ? 'border-indigo-500 text-indigo-400' : 'border-slate-900 text-slate-400'}`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Absolute overlay Dropdown menu */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-40 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">System Broadcasts</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="text-[9.5px] font-mono text-indigo-400 hover:text-white"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {notifications.map((not) => (
                    <div key={not.id} className="p-2.5 bg-slate-950/60 rounded border border-slate-850 flex items-start justify-between text-[11px] leading-normal">
                      <div>
                        {not.unread && <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5" />}
                        <span className="text-slate-300">{not.text}</span>
                        <span className="block text-[8px] text-slate-600 font-mono mt-0.5">{not.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown triggers */}
          <div className="relative">
            <button 
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
              className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-900/90 rounded-lg hover:border-slate-800 transition cursor-pointer"
            >
              <img 
                src={currentUser?.avatar} 
                alt="Avatar" 
                className="w-6 h-6 rounded object-cover border border-indigo-400/30" 
              />
              <span className="text-[11.5px] font-bold text-slate-200 hidden sm:inline max-w-24 truncate">{currentUser?.fullName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Dropdown Menu Overlay */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-[#0b0f19] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-40">
                <div className="p-3 bg-slate-950/60 border-b border-slate-900 flex flex-col">
                  <span className="text-xs font-bold text-white max-w-44 truncate">{currentUser?.fullName}</span>
                  <span className="text-[9px] text-slate-500 font-mono tracking-wide mt-0.5 truncate">{currentUser?.email}</span>
                </div>
                <div className="p-1 space-y-0.5">
                  <Link 
                    to="/profile-setup" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 py-2 px-3 text-xs text-slate-350 hover:text-white hover:bg-slate-900 transition rounded-lg"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Tune Profile setup</span>
                  </Link>

                  <button 
                    onClick={() => { logoutUser(); navigate('/'); }}
                    className="w-full flex items-center gap-2 py-2 px-3 text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/20 transition rounded-lg text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Tunnel</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </nav>

      {/* Main Grid Workspace Container */}
      <main id="dashboard-workspace" className="relative z-10 max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar Layout */}
        <section id="sidebar-left" className="lg:col-span-3 space-y-6">
          
          {/* Profile Card Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800/80">
              <div className="relative">
                <img 
                  src={currentUser?.avatar} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500/30"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <h3 className="text-sm font-black text-white mt-3 truncate max-w-full">{currentUser?.fullName}</h3>
              <p className="text-[11px] text-indigo-400 font-semibold font-mono mt-0.5 line-clamp-1">{currentUser?.role}</p>
              
              <div className="flex items-center gap-1.5 mt-2 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono">
                <MapPin className="w-3 h-3 text-indigo-400" />
                <span>{currentUser?.location || 'San Francisco, CA'}</span>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-400 leading-relaxed text-center mt-3 pt-1">
              "{currentUser?.bio || 'Full stack engineer with deep alignment across Java pipelines and reactive interfaces.'}"
            </p>

            {/* Social handles links */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800/60 mt-4 text-slate-500">
              {currentUser?.socials?.github && (
                <a href={currentUser.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {currentUser?.socials?.linkedin && (
                <a href={currentUser.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {currentUser?.socials?.portfolio && (
                <a href={currentUser.socials.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* User Skills Pills Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-550 block">My Stack Index</span>
            <div className="flex flex-wrap gap-2">
              {currentUser?.skills?.length > 0 ? (
                currentUser.skills.map((skill, index) => (
                  <span key={index} className="bg-slate-950 border border-slate-850 text-indigo-300 font-mono text-[10px] px-2.5 py-1 rounded">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 font-mono italic">No stack tags assigned</span>
              )}
            </div>
          </div>

          {/* Connections list */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-550 block">Connected Peers ({liveConnections.length})</span>
            <div className="space-y-3">
              {liveConnections.length > 0 ? (
                liveConnections.map((peer) => (
                  <div key={peer.id} className="flex items-center gap-2.5">
                    <img src={peer.avatar} alt="Peer avatar" className="w-8 h-8 rounded object-cover border border-slate-800" />
                    <div className="truncate flex-1">
                      <span className="text-xs font-bold text-white block truncate">{peer.fullName}</span>
                      <span className="text-[9.5px] text-indigo-400 font-mono truncate block">{peer.role}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-850 text-center rounded text-[11px] text-slate-500 italic leading-snug">
                  Follow suggestions on the right column sidebar to establish peer tunnels.
                </div>
              )}
            </div>
          </div>

        </section>

        {/* Center Panel (Search/Add Pitch/Tabs Navigation & Cards, Gridspan 6) */}
        <section id="middle-panel" className="lg:col-span-6 space-y-6">
          
          {/* Quick Search Filtering for mobile */}
          <div className="md:hidden">
            <div className="flex items-center bg-slate-950 border border-slate-850 px-3.5 py-1.5 rounded-lg w-full">
              <Search className="w-4 h-4 text-slate-600 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search projects or discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none w-full"
              />
            </div>
          </div>

          {/* Quick Tabs navigations, synced with dynamic lists */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('projects')}
                className={`py-2 text-xs font-mono font-bold uppercase cursor-pointer pb-2.5 relative border-b-2 transition ${
                  activeTab === 'projects' 
                    ? 'text-indigo-400 border-indigo-400' 
                    : 'text-slate-500 hover:text-slate-300 border-transparent'
                }`}
              >
                Project Pitches ({filteredProjects.length})
              </button>
              <button 
                onClick={() => setActiveTab('discussions')}
                className={`py-2 text-xs font-mono font-bold uppercase cursor-pointer pb-2.5 relative border-b-2 transition ${
                  activeTab === 'discussions' 
                    ? 'text-indigo-400 border-indigo-400' 
                    : 'text-slate-500 hover:text-slate-300 border-transparent'
                }`}
              >
                Discussions ({filteredDiscussions.length})
              </button>
              <button 
                onClick={() => setActiveTab('invitations')}
                className={`py-2 text-xs font-mono font-bold uppercase cursor-pointer pb-2.5 relative border-b-2 transition ${
                  activeTab === 'invitations' 
                    ? 'text-indigo-400 border-indigo-400' 
                    : 'text-slate-500 hover:text-slate-300 border-transparent'
                }`}
              >
                Collab Proposals ({collabRequests.length})
              </button>
            </div>

            {/* Float Create action context relative to the selected category */}
            <div>
              {activeTab === 'projects' && (
                <button 
                  onClick={() => setShowPitchModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10.5px] font-black px-3 py-1.5 rounded transition flex items-center gap-1 cursor-pointer border border-indigo-450/40"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>PITCH PROJECT</span>
                </button>
              )}

              {activeTab === 'discussions' && (
                <button 
                  onClick={() => setShowDiscModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10.5px] font-black px-3 py-1.5 rounded transition flex items-center gap-1 cursor-pointer border border-indigo-450/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ASK QUESTION</span>
                </button>
              )}
            </div>
          </div>

          {/* CENTER TABS RENDER CONTENT */}

          {/* TAB 1: PROJECTS BOARD SECTION */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((proj) => (
                  <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 transition">
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Left: Project title & details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                            {proj.date}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white tracking-tight">{proj.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.tags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-950 text-slate-410 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-900">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Pitch Creator avatar summary */}
                      <div className="shrink-0 flex flex-col items-center">
                        <img src={proj.creator?.avatar} alt="Creator" className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                        <span className="block text-[10px] text-slate-450 font-bold mt-1 text-center truncate max-w-[80px]">{proj.creator?.fullName.split(' ')[0]}</span>
                      </div>

                    </div>

                    {/* Bottom stats and interactive buttons row */}
                    <div className="flex items-center justify-between border-t border-slate-850 mt-4 pt-3.5">
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                        <button 
                          onClick={() => likeProject(proj.id)}
                          className={`flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-slate-950 transition cursor-pointer ${proj.likedByUser ? 'text-indigo-400 bg-indigo-950/20' : 'hover:text-slate-300'}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{proj.likes}</span>
                        </button>

                        <span className="text-[11px] text-slate-600 block">
                          ⚡ Handshakes: {proj.applicationsCount}
                        </span>
                      </div>

                      <button 
                        onClick={() => setApplyProjectId(proj.id)}
                        className="text-xs bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-800 font-mono tracking-wide px-3.5 py-1.5 rounded transition cursor-pointer"
                      >
                        CONNECTION HANDSHAKE
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-850/60 text-center py-12 rounded-xl text-xs text-slate-450 italic space-y-2">
                  <p>No project pitches found matching query parameters.</p>
                  <button onClick={() => setSearchQuery('')} className="underline text-indigo-400 hover:text-white">Clear search filters</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISCUSSIONS FORUM SECTION */}
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((disc) => (
                  <div key={disc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-400/20 transition">
                    <div className="flex items-start gap-4">
                      
                      {/* Left Side: Avatar */}
                      <img src={disc.author?.avatar} alt="Author" className="w-9 h-9 rounded object-cover border border-slate-800 shrink-0" />

                      {/* Right Side Info */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-teal-400 font-bold bg-teal-950/40 px-2 py-0.5 rounded border border-teal-900/40">
                            {disc.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{disc.author?.fullName} • {disc.author?.role}</span>
                        </div>
                        <h4 className="text-sm font-black text-white leading-snug tracking-tight">{disc.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{disc.content}</p>
                      </div>

                    </div>

                    {/* Upvote & Reply statistics row */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-850 text-xs font-mono text-slate-500">
                      <button 
                        onClick={() => upvoteDiscussion(disc.id)}
                        className="flex items-center gap-1 hover:text-white transition py-1 px-2.5 rounded bg-slate-950/40 border border-slate-850 cursor-pointer text-[11px]"
                      >
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        <span>Upvote ({disc.upvotes})</span>
                      </button>

                      <span className="text-slate-600">|</span>
                      <span>{disc.replies?.length} nested replies</span>
                    </div>

                    {/* Replies Panel List */}
                    {disc.replies?.length > 0 && (
                      <div className="mt-3.5 space-y-2.5 pl-6 border-l border-slate-800 pt-1">
                        {disc.replies.map((rep) => (
                          <div key={rep.id} className="p-3 bg-slate-950/80 rounded border border-slate-850 flex items-start gap-3">
                            <img src={rep.authorAvatar} alt="Reply Author" className="w-6 h-6 rounded-full object-cover border border-slate-810" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-400 block">{rep.authorName} • {rep.date}</span>
                              <p className="text-xs text-slate-300 leading-normal">{rep.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write customized reply inline panel */}
                    <div className="mt-4 flex items-center gap-2.5 pl-6">
                      <input 
                        type="text" 
                        placeholder="Type standard response thread..."
                        value={replyInputMap[disc.id] || ''}
                        onChange={(e) => setReplyInputMap(prev => ({ ...prev, [disc.id]: e.target.value }))}
                        className="bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 outline-none w-full placeholder:text-slate-800 focus:border-indigo-500 transition"
                      />
                      <button 
                        onClick={() => handleReplySubmit(disc.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-1.5 cursor-pointer shrink-0 transition"
                      >
                        <Send className="w-4.5 h-4.5 text-white" />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-850/60 text-center py-12 rounded-xl text-xs text-slate-450 italic space-y-2">
                  <p>No discussion thread topics matching query parameters.</p>
                  <button onClick={() => setSearchQuery('')} className="underline text-indigo-400 hover:text-white">Clear search filters</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COLLABORATION REQUESTS SECTIONS */}
          {activeTab === 'invitations' && (
            <div className="space-y-4">
              {collabRequests.length > 0 ? (
                collabRequests.map((req) => (
                  <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-400/20 transition relative">
                    <div className="flex items-start gap-4">
                      
                      <img src={req.senderAvatar} alt="Sender" className="w-10 h-10 rounded object-cover border border-slate-850 shrink-0" />
                      
                      <div className="flex-1 space-y-1.5">
                        <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold block">INBOUND PROPOSAL PITCH</span>
                        <h4 className="text-sm font-black text-white tracking-tight">
                          {req.senderName} requested to join "<span className="text-indigo-300">{req.projectTitle}</span>"
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed bg-[#020617] border border-slate-850 p-3 rounded-lg font-serif">
                          "{req.message}"
                        </p>
                      </div>

                    </div>

                    {/* Approve / Decline Buttons */}
                    <div className="flex items-center justify-end gap-3.5 mt-4 pt-3.5 border-t border-slate-850/80">
                      {req.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleCollabAction(req.id, 'declined')}
                            className="text-xs font-mono text-slate-400 hover:text-rose-400 px-3 py-1.5 hover:bg-rose-950/20 rounded cursor-pointer transition border border-transparent hover:border-rose-900/40"
                          >
                            DECLINE
                          </button>
                          <button 
                            onClick={() => handleCollabAction(req.id, 'accepted')}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 font-mono text-white px-4 py-1.5 font-black rounded cursor-pointer transition shadow-lg shadow-indigo-600/10"
                          >
                            ACCEPT HOOK
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>COLLABORATIVE LINK : <span className="font-bold whitespace-nowrap">{req.status}</span></span>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <div className="bg-slate-900/50 border border-slate-850/60 text-center py-12 rounded-xl text-xs text-slate-450 italic">
                  No inbound collaborative handshakes are pending currently.
                </div>
              )}
            </div>
          )}

        </section>

        {/* Right Sidebar Layout (Gridspan 3) */}
        <section id="sidebar-right" className="lg:col-span-3 space-y-6">
          
          {/* Peer Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400 block mb-0.5">PEER SYSTEM DISCOVERY</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Developer Suggestions</h4>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-3 bg-slate-950/60 rounded border border-slate-850 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <img src={rec.avatar} alt={rec.fullName} className="w-8 h-8 rounded object-cover border border-slate-800 shrink-0" />
                    <div className="truncate flex-1">
                      <span className="text-xs font-bold text-white block truncate">{rec.fullName}</span>
                      <span className="text-[9.5px] text-slate-500 font-mono truncate block">{rec.role}</span>
                    </div>
                  </div>

                  {rec.bio && (
                    <p className="text-[10.5px] text-slate-400 leading-normal line-clamp-2 italic">
                      "{rec.bio}"
                    </p>
                  )}

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-1">
                    {rec.skills.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-slate-900 text-slate-450 text-[9px] font-mono px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {rec.skills.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-mono self-center">+{rec.skills.length - 3} more</span>
                    )}
                  </div>

                  <button 
                    onClick={() => toggleUserFollow(rec.id)}
                    className={`w-full py-1.5 text-[10px] font-mono tracking-wider font-bold rounded uppercase cursor-pointer border transition text-center ${
                      rec.isFollowed 
                        ? 'bg-emerald-950/20 text-emerald-300 border-emerald-900/50' 
                        : 'bg-slate-905 hover:bg-indigo-600 text-slate-300 hover:text-white border-slate-800 hover:border-indigo-400/40'
                    }`}
                  >
                    {rec.isFollowed ? 'FOLLOWING LINK' : '+ CONNECT HOOK'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Real-Time System Activity Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-teal-400 block mb-0.5">TLS HANDSHAKES ACTIVITY LOG</span>
              <h4 className="text-sm font-bold text-white tracking-tight">Recent Activity</h4>
            </div>

            <div className="font-mono text-[9.5px] text-slate-500 space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-850">
              
              <div className="flex items-start gap-2.5 relative pl-5">
                <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-indigo-500 border-2 border-slate-900" />
                <div>
                  <span className="text-slate-300 block">System initialization callback parsed</span>
                  <span className="text-slate-600">Port 3000 HTTPS intercept: active</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 relative pl-5">
                <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-teal-400 border-2 border-slate-900" />
                <div>
                  <span className="text-slate-300 block">Varun Sai updated stack profile</span>
                  <span className="text-slate-600">Pushed to user_context schema cache</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 relative pl-5">
                <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-indigo-400 border-2 border-slate-900" />
                <div>
                  <span className="text-slate-300 block">Jane Doe upvoted Quarkus Native Thread</span>
                  <span className="text-slate-600">Claims bypass completed</span>
                </div>
              </div>

            </div>
          </div>

        </section>

      </main>

      {/* CREATE PITCH MODAL */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <h3 className="text-base font-black text-white">Pitch Collaboration Project</h3>
              <button onClick={() => setShowPitchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePitchSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Project Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Redis Cache Sync Middleware"
                  value={pitchTitle}
                  onChange={(e) => setPitchTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 outline-none placeholder:text-slate-750 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Details & Core Proposition</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Detail custom requirements..."
                  value={pitchDesc}
                  onChange={(e) => setPitchDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 outline-none placeholder:text-slate-750 focus:border-indigo-500 transition resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Capabilities Tags (comma separated)</label>
                <input 
                  type="text" 
                  required
                  placeholder="React, Spring Boot, Postgres"
                  value={pitchTags}
                  onChange={(e) => setPitchTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 outline-none placeholder:text-slate-755 focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition text-xs font-mono uppercase tracking-wider"
              >
                COMPILE & PITCH TO CHANNEL
              </button>
            </form>

          </div>
        </div>
      )}

      {/* CREATE DISCUSSION QUESTION MODAL */}
      {showDiscModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <h3 className="text-base font-black text-white">Ask Question Thread</h3>
              <button onClick={() => setShowDiscModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDiscSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Topic Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Best strategies to optimize JPA composite indexes?"
                  value={discTitle}
                  onChange={(e) => setDiscTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 outline-none placeholder:text-slate-750 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Content Details</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Detail exact thread parameters..."
                  value={discContent}
                  onChange={(e) => setDiscContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 outline-none placeholder:text-slate-750 focus:border-indigo-500 transition resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Category Domain</label>
                <select 
                  value={discCat}
                  onChange={(e) => setDiscCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:border-indigo-500 outline-none transition"
                >
                  <option value="Backend">Backend / Microservices</option>
                  <option value="Frontend">Frontend / Visual Core</option>
                  <option value="Database">Database optimizations</option>
                  <option value="Operations">Kubernetes / Clouds</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg cursor-pointer transition text-xs font-mono uppercase tracking-wider"
              >
                DISPATCH THREAD TOPIC
              </button>
            </form>

          </div>
        </div>
      )}

      {/* COLLABORATIVE HANDSHAKE MODAL */}
      {applyProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <h3 className="text-base font-black text-white">Collaboration Connection Proposal</h3>
              <button onClick={() => setApplyProjectId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyCollab} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">Introduce your core alignment background</label>
                <textarea 
                  required
                  rows="3"
                  value={applyMsg}
                  onChange={(e) => setApplyMsg(e.target.value)}
                  placeholder="Hey! Extremely interested in collaborating..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 outline-none placeholder:text-slate-700 focus:border-indigo-500 transition resize-none h-24"
                />
              </div>

              <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-indigo-300 text-[10.5px] leading-normal font-mono">
                ⚡ Handshake request triggers an interactive alert proposal in the creator's panel immediately.
              </div>

              <div className="flex justify-end gap-3.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setApplyProjectId(null)}
                  className="text-xs text-slate-400 hover:text-white px-3.5 py-2 font-bold cursor-pointer transition"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 font-mono text-white text-xs font-black px-4 py-2 rounded transition cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  LAUNCH HANDSHAKE
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
