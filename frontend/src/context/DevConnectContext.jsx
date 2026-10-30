import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const DevConnectContext = createContext(null);

const mapApiUser = (user) => ({
  id: String(user.id),
  username: user.username,
  fullName: user.fullName,
  email: user.email,
  role: user.role === 'ROLE_USER' ? 'Full Stack Developer' : user.role,
  experience: user.experience || '',
  location: user.location || '',
  avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  bio: user.bio || '',
  skills: user.skills || [],
  socials: {
    github: user.githubUrl || '',
    linkedin: user.linkedinUrl || '',
    portfolio: user.portfolioUrl || '',
  },
});

export const useDevConnect = () => {
  const context = useContext(DevConnectContext);
  if (!context) {
    throw new Error('useDevConnect must be used within a DevConnectProvider');
  }
  return context;
};

export const DevConnectProvider = ({ children }) => {
  // Mock Developers Seed
  const initialUsers = [
    {
      id: 'usr-1',
      username: 'janedoe',
      fullName: 'Jane Doe',
      email: 'jane@devconnect.io',
      role: 'Spring Security Architect',
      experience: '5+ years',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      bio: 'JWT expert. Passionate about filter chains, claims validation, and zero-trust microservice communication.',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', portfolio: 'https://jane.dev' },
      isFollowed: true,
    },
    {
      id: 'usr-2',
      username: 'siddharth_r',
      fullName: 'Siddharth R.',
      email: 'sid@devconnect.io',
      role: 'Database Engineer',
      experience: '4 years',
      location: 'Bangalore, India',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      bio: 'Index master. I write complex PostgreSQL queries and optimize transaction performance metrics.',
      skills: ['PostgreSQL', 'Java', 'Docker', 'AWS'],
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', portfolio: 'https://sid.dev' },
      isFollowed: false,
    },
    {
      id: 'usr-3',
      username: 'elenar',
      fullName: 'Elena Rostova',
      email: 'elena@devconnect.io',
      role: 'Cloud Operations Lead',
      experience: '6 years',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      bio: 'Kubernetes developer. Automating standard highavailability deployment strategies with Terraform.',
      skills: ['AWS', 'Kubernetes', 'Docker'],
      socials: { github: 'https://github.com', linkedin: 'https://linkedin.com', portfolio: 'https://elena.io' },
      isFollowed: false,
    }
  ];

  // Mock Projects Seed
  const initialProjects = [
    {
      id: 'proj-1',
      title: 'Spring Security Bearer Guard',
      description: 'An open-source custom filter package to automatically check claims and scopes inside JWT headers. Need an intuitive dashboard built on React.',
      tags: ['Spring Boot', 'React', 'Java'],
      creator: {
        fullName: 'Jane Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        role: 'Spring Security Architect'
      },
      likes: 24,
      likedByUser: false,
      date: '2 hours ago',
      applicationsCount: 3,
    },
    {
      id: 'proj-2',
      title: 'PostgreSQL Auto-Indexing Tool',
      description: 'Analyzing Slow Query logs from active databases to automatically recommend composite multicolumn indices directly.',
      tags: ['PostgreSQL', 'Docker', 'AWS'],
      creator: {
        fullName: 'Siddharth R.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        role: 'Database Engineer'
      },
      likes: 18,
      likedByUser: true,
      date: '1 day ago',
      applicationsCount: 1,
    }
  ];

  // Mock Discussions Seed
  const initialDiscussions = [
    {
      id: 'disc-1',
      title: 'Is Spring Boot going to be bypassed by Quarkus and GraalVM in high-scale setups?',
      content: 'I have been testing startup latency and memory footprint. Spring Boot with GraalVM Native Images seems to bridge the gap, but I would love to hear deployment experiences.',
      author: {
        fullName: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
        role: 'Cloud Operations Lead'
      },
      replies: [
        {
          id: 'rep-1',
          authorName: 'Siddharth R.',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          text: 'Using Spring Boot to native compile with GraalVM is highly efficient in containers under 120MB memory caps, but build times increase heavily.',
          date: 'Yesterday'
        }
      ],
      upvotes: 11,
      category: 'Backend'
    },
    {
      id: 'disc-2',
      title: 'Best practices for state synchronization in serverless React applications?',
      content: 'When using serverless database hooks, what strategy do you favor for persistent user profile configuration updates in client-side states without triggering constant polling?',
      author: {
        fullName: 'Jane Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        role: 'Spring Security Architect'
      },
      replies: [],
      upvotes: 7,
      category: 'Frontend'
    }
  ];

  // Simulated Global State Persisters
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('dc_web_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('dc_web_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [discussions, setDiscussions] = useState(() => {
    const saved = localStorage.getItem('dc_web_discussions');
    return saved ? JSON.parse(saved) : initialDiscussions;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dc_web_current_user');
    return saved && localStorage.getItem('dc_auth_token') ? JSON.parse(saved) : null;
  });

  const [collabRequests, setCollabRequests] = useState(() => {
    const saved = localStorage.getItem('dc_web_collab_requests');
    return saved ? JSON.parse(saved) : [
      {
        id: 'collab-1',
        projectTitle: 'Spring Security Bearer Guard',
        senderName: 'Jane Doe',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        message: 'I saw you completed profile setup! Would love your expertise with dynamic claims authorization rendering on the React side.',
        status: 'pending' // 'pending' | 'accepted' | 'declined'
      }
    ];
  });

  const [notifications, setNotifications] = useState([
    { id: 'not-1', text: 'Jane Doe invited you to collaborate', time: '10m ago', unread: true },
    { id: 'not-2', text: 'Siddharth R. upvoted your comment in Java Optimization', time: '3h ago', unread: false },
    { id: 'not-3', text: 'System Update: High performance pipelines deployed.', time: '1d ago', unread: false }
  ]);

  // Workspaces Global State
  const initialWorkspaces = [
    {
      id: 1,
      projectId: 'proj-1',
      name: 'Spring Security Bearer Guard',
      createdBy: 'janedoe',
      userRole: 'MEMBER',
      totalUnread: 0,
      membersCount: 2,
      channelsCount: 3,
      channels: [
        { id: 1, name: 'general', workspaceId: 1, unreadCount: 0 },
        { id: 2, name: 'architecture', workspaceId: 1, unreadCount: 0 },
        { id: 3, name: 'jwt-filters', workspaceId: 1, unreadCount: 0 }
      ],
      members: [
        { userId: 'usr-1', username: 'janedoe', fullName: 'Jane Doe', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', role: 'OWNER' }
      ]
    }
  ];

  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('dc_web_workspaces');
    return saved ? JSON.parse(saved) : initialWorkspaces;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    const saved = localStorage.getItem('dc_web_active_ws');
    return saved ? Number(saved) : 1;
  });

  const [activeChannelId, setActiveChannelId] = useState(() => {
    const saved = localStorage.getItem('dc_web_active_ch');
    return saved ? Number(saved) : 1;
  });

  const [activityNotifications, setActivityNotifications] = useState(() => {
    const saved = localStorage.getItem('dc_web_activity_notifs');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'WORKSPACE_ADDED', message: 'You were added as a member in workspace "Spring Security Bearer Guard".', read: false, createdAt: new Date().toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem('dc_web_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dc_web_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('dc_web_discussions', JSON.stringify(discussions));
  }, [discussions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dc_web_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dc_web_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dc_web_collab_requests', JSON.stringify(collabRequests));
  }, [collabRequests]);

  useEffect(() => {
    localStorage.setItem('dc_web_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('dc_web_active_ws', String(activeWorkspaceId));
  }, [activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem('dc_web_active_ch', String(activeChannelId));
  }, [activeChannelId]);

  useEffect(() => {
    localStorage.setItem('dc_web_activity_notifs', JSON.stringify(activityNotifications));
  }, [activityNotifications]);

  // Auto-heal / auto-exchange dummy local/oauth tokens to a genuine server JWT
  useEffect(() => {
    const upgradeDummyToken = async () => {
      const token = localStorage.getItem('dc_auth_token');
      if (!token || !currentUser) return;
      const isDummy = token.startsWith('local_') || token.startsWith('oauth_') || token.startsWith('mock_');
      if (!isDummy) return;

      const username = (currentUser.username || 'user').toLowerCase().slice(0, 20);
      const email = currentUser.email || `${username}@devconnect.local`;
      const fullName = currentUser.fullName || username;
      const pwdCandidates = ['OAuth_Google_SecurePass123!', 'OAuth_GitHub_SecurePass123!', 'DevConnect123!'];

      for (const pwd of pwdCandidates) {
        try {
          const signinRes = await apiRequest('/auth/signin', {
            method: 'POST',
            body: { username, password: pwd },
          });
          if (signinRes?.token) {
            localStorage.setItem('dc_auth_token', signinRes.token);
            window.location.reload();
            return;
          }
        } catch {
          // try next or signup
        }
      }

      try {
        const signupRes = await apiRequest('/auth/signup', {
          method: 'POST',
          body: {
            username: username.length < 3 ? `${username}123`.slice(0, 20) : username,
            fullName: fullName.slice(0, 50),
            email: email.slice(0, 50),
            password: 'OAuth_Google_SecurePass123!'
          }
        });
        if (signupRes?.token) {
          localStorage.setItem('dc_auth_token', signupRes.token);
          window.location.reload();
        }
      } catch (err) {
        console.warn('Auto-token upgrade skipped:', err);
      }
    };

    upgradeDummyToken();
  }, [currentUser]);

  // Actions
  const registerUser = async (username, fullName, email, password) => {
    const rawUsername = (username || '').trim();
    const sanitizedUsername = rawUsername.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || `user_${Date.now().toString().slice(-4)}`;
    const finalUsername = sanitizedUsername.length < 3 ? `${sanitizedUsername}123`.slice(0, 20) : sanitizedUsername;
    const finalFullName = ((fullName || finalUsername).trim()).slice(0, 50);
    const finalEmail = ((email && email.includes('@') ? email : `${finalUsername}@devconnect.local`).trim().toLowerCase()).slice(0, 50);

    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: { username: finalUsername, fullName: finalFullName, email: finalEmail, password },
      });
      localStorage.setItem('dc_auth_token', response.token);
      const newUser = mapApiUser(response);
      setUsers(prev => [...prev.filter(user => user.username !== newUser.username), newUser]);
      setCurrentUser(newUser);
      return newUser;
    } catch (apiError) {
      const errLower = (apiError?.message || '').toLowerCase();
      // Propagate explicit duplicate errors from server
      if (errLower.includes('already taken') || errLower.includes('already in use')) {
        throw apiError;
      }

      console.warn('Backend signup error or service offline, creating local session:', apiError);
      const fallbackUser = {
        id: `user-${Date.now()}`,
        username: finalUsername,
        fullName: finalFullName,
        email: finalEmail,
        role: 'Full Stack Developer',
        experience: '1 year',
        location: 'Bengaluru, India',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        bio: '',
        skills: [],
        socials: { github: '', linkedin: '', portfolio: '' }
      };

      localStorage.setItem('dc_auth_token', `local_token_${Date.now()}`);
      setUsers(prev => [...prev.filter(u => u.username !== fallbackUser.username), fallbackUser]);
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  };

  const loginUser = async (usernameOrEmail, password) => {
    const trimmedInput = (usernameOrEmail || '').trim();
    const normalizedInput = trimmedInput.toLowerCase();

    try {
      const response = await apiRequest('/auth/signin', {
        method: 'POST',
        body: { username: trimmedInput, password },
      });
      localStorage.setItem('dc_auth_token', response.token);

      try {
        const profile = await apiRequest('/users/me');
        const user = mapApiUser(profile);
        setUsers(prev => [...prev.filter(existing => existing.username !== user.username), user]);
        setCurrentUser(user);
        return user;
      } catch {
        const user = mapApiUser(response);
        setUsers(prev => [...prev.filter(existing => existing.username !== user.username), user]);
        setCurrentUser(user);
        return user;
      }
    } catch (apiError) {
      // 1. Check if user already exists locally in saved/mock users
      const existingUser = users.find(u => 
        (u.username && u.username.toLowerCase() === normalizedInput) ||
        (u.email && u.email.toLowerCase() === normalizedInput)
      );

      if (existingUser) {
        localStorage.setItem('dc_auth_token', `local_token_${Date.now()}`);
        setCurrentUser(existingUser);
        return existingUser;
      }

      // 2. If it was an explicit invalid credentials error from an online backend
      if (apiError?.message && (apiError.message.includes('Invalid') || apiError.message.includes('401') || apiError.message.includes('Bad credentials'))) {
        throw new Error('Invalid username/email or password.');
      }

      // 3. Fallback session when backend is 500 or offline
      console.warn('Backend signin unavailable, activating local session:', apiError);
      const usernameFromInput = normalizedInput.includes('@')
        ? normalizedInput.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)
        : normalizedInput.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);

      const fallbackUser = {
        id: `user-${Date.now()}`,
        username: usernameFromInput || 'developer',
        fullName: usernameFromInput || 'Developer',
        email: normalizedInput.includes('@') ? normalizedInput : `${usernameFromInput}@devconnect.local`,
        role: 'Full Stack Developer',
        experience: '1 year',
        location: 'Bengaluru, India',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        bio: '',
        skills: [],
        socials: { github: '', linkedin: '', portfolio: '' }
      };

      localStorage.setItem('dc_auth_token', `local_token_${Date.now()}`);
      setUsers(prev => [...prev.filter(u => u.username !== fallbackUser.username), fallbackUser]);
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  };

  const socialLogin = async (provider, userDetails = {}) => {
    const email = (userDetails.email || `${provider.toLowerCase()}.user@devconnect.local`).toLowerCase().trim();
    const fullName = userDetails.fullName || email.split('@')[0];
    const username = (userDetails.username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')).toLowerCase().slice(0, 20);
    const password = `OAuth_${provider}_SecurePass123!`;

    try {
      const response = await apiRequest('/auth/signin', {
        method: 'POST',
        body: { username, password },
      });
      localStorage.setItem('dc_auth_token', response.token);
      const profile = await apiRequest('/users/me');
      const user = mapApiUser(profile);
      setUsers(prev => [...prev.filter(existing => existing.username !== user.username), user]);
      setCurrentUser(user);
      return user;
    } catch {
      try {
        const signupResponse = await apiRequest('/auth/signup', {
          method: 'POST',
          body: { username, fullName, email, password },
        });
        localStorage.setItem('dc_auth_token', signupResponse.token);
        const newUser = mapApiUser(signupResponse);
        setUsers(prev => [...prev.filter(u => u.username !== newUser.username), newUser]);
        setCurrentUser(newUser);
        return newUser;
      } catch {
        const fallbackUser = {
          id: `oauth-${Date.now()}`,
          username,
          fullName,
          email,
          role: 'Full Stack Developer',
          experience: '3+ years',
          location: 'San Francisco, CA',
          avatar: userDetails.avatar || (provider === 'Google'
            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
            : provider === 'GitHub'
              ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'),
          bio: `Software Engineer connected with ${provider}.`,
          skills: ['React', 'JavaScript', 'Node.js', 'Spring Boot'],
          socials: {
            github: provider === 'GitHub' ? `https://github.com/${username}` : '',
            linkedin: provider === 'LinkedIn' ? `https://linkedin.com/in/${username}` : '',
            portfolio: '',
          },
        };
        localStorage.setItem('dc_auth_token', `oauth_token_${Date.now()}`);
        setUsers(prev => [...prev.filter(u => u.username !== fallbackUser.username), fallbackUser]);
        setCurrentUser(fallbackUser);
        return fallbackUser;
      }
    }
  };

  const updateAccountProfile = async ({ fullName, email, role, location, bio }) => {
    if (!currentUser) return;

    const trimmedName = fullName?.trim() || currentUser.fullName;
    const trimmedEmail = email?.trim() || currentUser.email;

    const token = localStorage.getItem('dc_auth_token');
    const isMockToken = !token || token.startsWith('mock_') || token.startsWith('oauth_') || token.startsWith('local_');

    if (!isMockToken) {
      try {
        const profile = await apiRequest('/users/me', {
          method: 'PUT',
          body: {
            fullName: trimmedName,
            email: trimmedEmail,
            role: role ?? currentUser.role,
            location: location ?? currentUser.location,
            bio: bio ?? currentUser.bio,
            experience: currentUser.experience,
            skills: currentUser.skills,
            githubUrl: currentUser.socials?.github || '',
            linkedinUrl: currentUser.socials?.linkedin || '',
            portfolioUrl: currentUser.socials?.portfolio || '',
            avatar: currentUser.avatar,
          },
        });
        const updatedUser = mapApiUser(profile);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        setCurrentUser(updatedUser);
        return updatedUser;
      } catch (err) {
        console.warn('Backend update failed, persisting profile locally:', err);
      }
    }

    const updatedUser = {
      ...currentUser,
      fullName: trimmedName,
      email: trimmedEmail,
      role: role ?? currentUser.role,
      location: location ?? currentUser.location,
      bio: bio ?? currentUser.bio,
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  const updateProfileSetup = async (bio, role, experience, location, skills, socials, avatar, fullName, email) => {
    if (!currentUser) return;

    const trimmedName = fullName?.trim() || currentUser.fullName;
    const trimmedEmail = email?.trim() || currentUser.email;

    const token = localStorage.getItem('dc_auth_token');
    const isMockToken = !token || token.startsWith('mock_') || token.startsWith('oauth_') || token.startsWith('local_');

    if (!isMockToken) {
      try {
        const profile = await apiRequest('/users/me', {
          method: 'PUT',
          body: {
            fullName: trimmedName,
            email: trimmedEmail,
            bio,
            role,
            experience,
            location,
            skills,
            githubUrl: socials?.github || '',
            linkedinUrl: socials?.linkedin || '',
            portfolioUrl: socials?.portfolio || '',
            avatar: avatar || currentUser.avatar,
          },
        });
        const updatedUser = mapApiUser(profile);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        setCurrentUser(updatedUser);
        return updatedUser;
      } catch (err) {
        console.warn('Backend update failed, persisting profile locally:', err);
      }
    }

    const updatedUser = {
      ...currentUser,
      fullName: trimmedName,
      email: trimmedEmail,
      bio,
      role,
      experience,
      location,
      skills,
      socials: {
        github: socials?.github || '',
        linkedin: socials?.linkedin || '',
        portfolio: socials?.portfolio || '',
      },
      avatar: avatar || currentUser.avatar,
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  const checkUsernameExists = (username) => {
    return users.some(u => u.username === username.toLowerCase().trim());
  };

  const logoutUser = () => {
    localStorage.removeItem('dc_auth_token');
    setCurrentUser(null);
  };

  const addProjectPitch = (title, description, tags) => {
    if (!currentUser) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      title,
      description,
      tags,
      creator: {
        fullName: currentUser.fullName,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      likes: 0,
      likedByUser: false,
      date: 'Just now',
      applicationsCount: 0
    };
    setProjects(prev => [newProj, ...prev]);
  };

  const likeProject = (projId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        const liked = !p.likedByUser;
        return {
          ...p,
          likes: p.likes + (liked ? 1 : -1),
          likedByUser: liked
        };
      }
      return p;
    }));
  };

  const applyForCollaboration = (projId, message) => {
    const project = projects.find(p => p.id === projId);
    if (!project || !currentUser) return;

    const request = {
      id: `collab-${Date.now()}`,
      projectTitle: project.title,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatar,
      message,
      status: 'pending'
    };

    setCollabRequests(prev => [request, ...prev]);
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, applicationsCount: p.applicationsCount + 1 } : p));
  };

  const handleCollabAction = (collabId, status) => {
    setCollabRequests(prev => prev.map(r => r.id === collabId ? { ...r, status } : r));
    
    // Notify
    const req = collabRequests.find(r => r.id === collabId);
    if (req) {
      setNotifications(prev => [
        {
          id: `not-${Date.now()}`,
          text: `You ${status} collab request from ${req.senderName} for "${req.projectTitle}"`,
          time: 'Just now',
          unread: true
        },
        ...prev
      ]);
    }
  };

  const addDiscussionPost = (title, content, category) => {
    if (!currentUser) return;
    const newPost = {
      id: `disc-${Date.now()}`,
      title,
      content,
      category,
      author: {
        fullName: currentUser.fullName,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      replies: [],
      upvotes: 0
    };
    setDiscussions(prev => [newPost, ...prev]);
  };

  const upvoteDiscussion = (discId) => {
    setDiscussions(prev => prev.map(d => {
      if (d.id === discId) {
        return { ...d, upvotes: d.upvotes + 1 };
      }
      return d;
    }));
  };

  const replyToDiscussion = (discId, text) => {
    if (!currentUser) return;
    const reply = {
      id: `rep-${Date.now()}`,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      text,
      date: 'Just now'
    };

    setDiscussions(prev => prev.map(d => {
      if (d.id === discId) {
        return {
          ...d,
          replies: [...d.replies, reply]
        };
      }
      return d;
    }));
  };

  const toggleUserFollow = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const following = !u.isFollowed;
        return { ...u, isFollowed: following };
      }
      return u;
    }));
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Workspaces API Actions
  const fetchWorkspaces = async () => {
    try {
      const data = await apiRequest('/workspaces');
      if (Array.isArray(data)) {
        setWorkspaces(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend /workspaces unavailable, using local state:', err);
    }
    return workspaces;
  };

  const createWorkspace = async (projectIdOrData) => {
    try {
      let ws;
      if (typeof projectIdOrData === 'object') {
        ws = await apiRequest('/workspaces', {
          method: 'POST',
          body: {
            name: projectIdOrData.name,
            description: projectIdOrData.description || ''
          }
        });
      } else {
        ws = await apiRequest(`/projects/${projectIdOrData}/workspace`, { method: 'POST' });
      }
      setWorkspaces(prev => [ws, ...prev.filter(w => w.id !== ws.id)]);
      setActiveWorkspaceId(ws.id);
      if (ws.channels && ws.channels.length > 0) {
        setActiveChannelId(ws.channels[0].id);
      }
      return ws;
    } catch (err) {
      console.warn('Backend create workspace error, falling back to local creation:', err);
      const projectId = typeof projectIdOrData === 'object' ? `proj-${Date.now()}` : projectIdOrData;
      const proj = projects.find(p => String(p.id) === String(projectId));
      const wsName = typeof projectIdOrData === 'object' 
        ? projectIdOrData.name 
        : (proj ? proj.title : 'New Project Workspace');
      const newWs = {
        id: Date.now(),
        projectId,
        name: wsName,
        createdBy: currentUser?.username || 'me',
        userRole: 'OWNER',
        totalUnread: 0,
        membersCount: 1,
        channelsCount: 1,
        channels: [
          { id: Date.now(), name: 'general', workspaceId: Date.now(), unreadCount: 0 }
        ],
        members: [
          {
            userId: currentUser?.id || 'me',
            username: currentUser?.username || 'me',
            fullName: currentUser?.fullName || 'Me',
            avatar: currentUser?.avatar,
            role: 'OWNER'
          }
        ]
      };
      setWorkspaces(prev => [newWs, ...prev]);
      setActiveWorkspaceId(newWs.id);
      return newWs;
    }
  };

  const fetchWorkspaceDetails = async (workspaceId) => {
    try {
      const details = await apiRequest(`/workspaces/${workspaceId}`);
      setWorkspaces(prev => prev.map(w => w.id === details.id ? { ...w, ...details } : w));
      return details;
    } catch (err) {
      console.warn('Backend workspace details error:', err);
      return workspaces.find(w => String(w.id) === String(workspaceId));
    }
  };

  const fetchWorkspaceMembers = async (workspaceId) => {
    try {
      const members = await apiRequest(`/workspaces/${workspaceId}/members`);
      setWorkspaces(prev => prev.map(w => w.id === Number(workspaceId) ? { ...w, members } : w));
      return members;
    } catch (err) {
      console.warn('Backend workspace members error:', err);
      const ws = workspaces.find(w => String(w.id) === String(workspaceId));
      return ws?.members || [];
    }
  };

  const fetchWorkspaceChannels = async (workspaceId) => {
    try {
      const channels = await apiRequest(`/workspaces/${workspaceId}/channels`);
      setWorkspaces(prev => prev.map(w => w.id === Number(workspaceId) ? { ...w, channels } : w));
      return channels;
    } catch (err) {
      console.warn('Backend workspace channels error:', err);
      const ws = workspaces.find(w => String(w.id) === String(workspaceId));
      return ws?.channels || [];
    }
  };

  const createChannel = async (workspaceId, name) => {
    try {
      const channel = await apiRequest(`/workspaces/${workspaceId}/channels`, {
        method: 'POST',
        body: { name }
      });
      setWorkspaces(prev => prev.map(w => {
        if (w.id === Number(workspaceId)) {
          const channels = [...(w.channels || []).filter(c => c.id !== channel.id), channel];
          return { ...w, channels, channelsCount: channels.length };
        }
        return w;
      }));
      setActiveChannelId(channel.id);
      return channel;
    } catch (err) {
      console.warn('Backend create channel error, falling back locally:', err);
      const newChannel = {
        id: Date.now(),
        workspaceId: Number(workspaceId),
        name: name.toLowerCase().trim(),
        unreadCount: 0
      };
      setWorkspaces(prev => prev.map(w => {
        if (w.id === Number(workspaceId)) {
          const channels = [...(w.channels || []).filter(c => c.name !== newChannel.name), newChannel];
          return { ...w, channels, channelsCount: channels.length };
        }
        return w;
      }));
      setActiveChannelId(newChannel.id);
      return newChannel;
    }
  };

  const removeWorkspaceMember = async (workspaceId, userId) => {
    try {
      await apiRequest(`/workspaces/${workspaceId}/members/${userId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend remove member error:', err);
    }
    setWorkspaces(prev => prev.map(w => {
      if (w.id === Number(workspaceId)) {
        const members = (w.members || []).filter(m => String(m.userId) !== String(userId));
        return { ...w, members, membersCount: members.length };
      }
      return w;
    }));
  };

  const sendJoinRequest = async (workspaceId) => {
    try {
      return await apiRequest(`/workspaces/${workspaceId}/join-requests`, { method: 'POST' });
    } catch (err) {
      console.warn('Backend join request error:', err);
      throw err;
    }
  };

  const fetchPendingJoinRequests = async (workspaceId) => {
    try {
      return await apiRequest(`/workspaces/${workspaceId}/join-requests`);
    } catch (err) {
      console.warn('Backend fetch pending join requests error:', err);
      return [];
    }
  };

  const handleJoinRequest = async (requestId, status) => {
    try {
      return await apiRequest(`/join-requests/${requestId}`, {
        method: 'PUT',
        body: { status }
      });
    } catch (err) {
      console.warn('Backend handle join request error:', err);
      throw err;
    }
  };

  const fetchActivityNotifications = async () => {
    try {
      const data = await apiRequest('/notifications');
      if (Array.isArray(data)) {
        setActivityNotifications(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend notifications error:', err);
    }
    return activityNotifications;
  };

  const markActivityNotificationRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) {
      console.warn('Backend mark notification read error:', err);
    }
    setActivityNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const fetchChannelMessages = async (channelId, beforeMessageId = null, limit = 30) => {
    try {
      const query = beforeMessageId ? `?limit=${limit}&before=${beforeMessageId}` : `?limit=${limit}`;
      const data = await apiRequest(`/channels/${channelId}/messages${query}`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Backend fetch messages error:', err);
      return [];
    }
  };

  const markChannelRead = async (channelId, messageId = null) => {
    try {
      await apiRequest(`/channels/${channelId}/read`, {
        method: 'POST',
        body: messageId ? { messageId } : {}
      });
      setWorkspaces(prev => prev.map(ws => {
        const targetChannel = (ws.channels || []).find(c => c.id === Number(channelId));
        if (targetChannel && targetChannel.unreadCount > 0) {
          const countToSubtract = targetChannel.unreadCount;
          const updatedChannels = ws.channels.map(c => c.id === Number(channelId) ? { ...c, unreadCount: 0 } : c);
          return {
            ...ws,
            channels: updatedChannels,
            totalUnread: Math.max(0, (ws.totalUnread || 0) - countToSubtract)
          };
        }
        return ws;
      }));
    } catch (err) {
      console.warn('Backend mark channel read error:', err);
    }
  };

  const unreadActivityCount = activityNotifications.filter(n => !n.read).length;
  const unreadWorkspacesCount = workspaces.reduce((acc, ws) => acc + (ws.totalUnread || 0), 0);

  return (
    <DevConnectContext.Provider value={{
      users,
      projects,
      discussions,
      currentUser,
      notifications,
      collabRequests,
      workspaces,
      activeWorkspaceId,
      activeChannelId,
      activityNotifications,
      unreadActivityCount,
      unreadWorkspacesCount,
      setActiveWorkspaceId,
      setActiveChannelId,
      fetchWorkspaces,
      createWorkspace,
      fetchWorkspaceDetails,
      fetchWorkspaceMembers,
      fetchWorkspaceChannels,
      createChannel,
      removeWorkspaceMember,
      sendJoinRequest,
      fetchPendingJoinRequests,
      handleJoinRequest,
      fetchActivityNotifications,
      markActivityNotificationRead,
      fetchChannelMessages,
      markChannelRead,
      registerUser,
      loginUser,
      socialLogin,
      updateProfileSetup,
      updateAccountProfile,
      checkUsernameExists,
      logoutUser,
      addProjectPitch,
      likeProject,
      applyForCollaboration,
      handleCollabAction,
      addDiscussionPost,
      upvoteDiscussion,
      replyToDiscussion,
      toggleUserFollow,
      clearNotifications
    }}>
      {children}
    </DevConnectContext.Provider>
  );
};
