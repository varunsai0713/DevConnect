import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevConnect } from '../context/DevConnectContext';
import { 
  Shield, 
  User, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Github, 
  Linkedin, 
  Globe, 
  Check, 
  RefreshCw,
  Sparkles,
  Award
} from 'lucide-react';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateProfileSetup } = useDevConnect();

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Avatar Presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', // Varun
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', // Jane
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', // Siddharth
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'  // Elena
  ];

  const availableSkills = [
    'Java', 'Spring Boot', 'React', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'
  ];

  // State values holding completed credentials
  const [avatar, setAvatar] = useState(currentUser?.avatar || avatarPresets[0]);
  const [bio, setBio] = useState(currentUser?.bio || 'Designing resilient systems with Spring Cloud API gateways and high-fidelity React interfaces. Passionate about JPA performance optimization.');
  const [role, setRole] = useState(currentUser?.role || 'Lead Full Stack Engineer (React / Spring Boot)');
  const [experience, setExperience] = useState('5 years');
  const [location, setLocation] = useState('Bangalore, India');
  const [selectedSkills, setSelectedSkills] = useState(['Java', 'Spring Boot', 'React', 'PostgreSQL']);
  
  const [github, setGithub] = useState('https://github.com/varun_sai');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/varunsai');
  const [portfolio, setPortfolio] = useState('https://varunsai.dev');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle skills selections
  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const handleCustomFileBypass = (e) => {
    // Mock files select trigger
    if (e.target.files && e.target.files[0]) {
      const src = URL.createObjectURL(e.target.files[0]);
      setAvatar(src);
    }
  };

  const handleCompleteSetupSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      updateProfileSetup(
        bio,
        role,
        experience,
        location,
        selectedSkills,
        { github, linkedin, portfolio },
        avatar
      );
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 1200);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div id="setup-root" className="min-h-screen bg-[#020617] text-slate-150 font-sans py-12 px-6">
      
      {/* Absolute Geometric Grid Background Theme */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-0" style={{ 
        backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />

      <div className="w-full max-w-2xl mx-auto relative z-10 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-800/60">
          <div className="w-10 h-10 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/30">
            <Shield className="h-3.5 w-3.5 text-indigo-400 transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">Complete Profile Setup</h1>
            <p className="text-[11px] text-slate-400 tracking-wide font-mono uppercase">Identity Channel Tuning</p>
          </div>
        </div>

        <form onSubmit={handleCompleteSetupSubmit} className="space-y-6">
          
          {/* Avatar Picture Selections */}
          <div>
            <label className="block text-[10.5px] font-mono uppercase tracking-widest text-slate-400 mb-3.5">1. Profile Picture Selection</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
              
              <div className="relative w-16 h-16 mx-auto sm:mx-0">
                <img 
                  src={avatar} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500/60 shadow" 
                />
                <span className="absolute bottom-[-2px] right-[-2px] bg-indigo-600 text-white rounded-full p-0.5">
                  <Check className="w-2.5 h-2.5" />
                </span>
              </div>

              {avatarPresets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  className={`relative rounded-lg p-1 border-2 transition hidden md:block bg-slate-950 ${
                    avatar === preset ? 'border-indigo-500' : 'border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <img src={preset} alt={`Preset ${index}`} className="w-full h-10 rounded object-cover" />
                </button>
              ))}

              <label className="col-span-2 md:col-span-1 border border-dashed border-slate-700 hover:border-indigo-500/70 rounded-lg h-12 flex items-center justify-center cursor-pointer transition p-2 text-center text-[10px] text-slate-400 uppercase font-mono bg-slate-950/40">
                <span>Upload file</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCustomFileBypass} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Role, Experience, Location, Bio */}
          <div>
            <label className="block text-[10.5px] font-mono uppercase tracking-widest text-slate-400 mb-2.5">2. Fundamental Dev Context Attributes</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Primary Job Alignment Tag</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                  <input 
                    type="text" 
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Full Stack Developer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Experience Gauge</label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                  <select 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-[11.5px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                    <option value="3 years">3 years</option>
                    <option value="4 years">4 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Dev Location Code</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-600" />
                  <input 
                    type="text" 
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Biography details (Passionate summary focus)</label>
              <textarea 
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
                placeholder="Review details on Spring Boot microservices, high-traffic PostgreSQL scaling, or elegant responsive React architectures you build."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition h-20"
              />
            </div>
          </div>

          {/* Interactive Skills Toggles */}
          <div>
            <label className="block text-[10.5px] font-mono uppercase tracking-widest text-slate-400 mb-2">3. Technical Stacks Capabilities</label>
            <p className="text-[10px] text-slate-500 mb-3.5">
              Select specific technologies representing your primary development pipeline:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {availableSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-mono font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/65 shadow-md shadow-indigo-500/5' 
                        : 'bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <span>{skill}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Connections */}
          <div>
            <label className="block text-[10.5px] font-mono uppercase tracking-widest text-slate-400 mb-2.5">4. Developer Web Endpoint Links</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">GitHub URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
                  <input 
                    type="url" 
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
                  <input 
                    type="url" 
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Portfolio or Blog Address</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-650" />
                  <input 
                    type="url" 
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yourpage.dev"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submission button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 text-xs uppercase font-mono tracking-wider shadow-lg shadow-indigo-600/10"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Assembling Developer Schema Cache...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4 text-white" />
                <span>Complete Setup & Run Dashboard</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
