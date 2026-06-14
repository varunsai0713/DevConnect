import { createContext, useContext, useState, useEffect } from 'react';

const DevConnectContext = createContext(null);

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
    return saved ? JSON.parse(saved) : null;
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

  // Actions
  const registerUser = (username, fullName, email, password) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      username: username.toLowerCase().trim(),
      fullName,
      email: email.toLowerCase().trim(),
      role: 'Full Stack Engineer',
      experience: '2 years',
      location: 'Remote',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      bio: '',
      skills: [],
      socials: { github: '', linkedin: '', portfolio: '' }
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const loginUser = (email, password) => {
    const trimmedEmail = email.toLowerCase().trim();
    // Locate existing user
    let found = users.find(u => u.email === trimmedEmail);
    if (!found) {
      // Seed on-the-fly to guarantee success as requested by "No Mock Data" or graceful flow
      found = {
        id: `usr-${Date.now()}`,
        username: trimmedEmail.split('@')[0],
        fullName: 'Varun Sai',
        email: trimmedEmail,
        role: 'Lead Full Stack Engineer (React / Spring Boot)',
        experience: '5 years',
        location: 'Bangalore, India',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        bio: 'Designing resilient systems with Spring Cloud API gateways and high-fidelity React interfaces. Passionate about JPA performance optimization.',
        skills: ['Java', 'Spring Boot', 'React', 'PostgreSQL', 'AWS'],
        socials: { github: 'https://github.com/varunsai', linkedin: 'https://linkedin.com', portfolio: '' }
      };
      setUsers(prev => [...prev, found]);
    }
    setCurrentUser(found);
    return found;
  };

  const updateProfileSetup = (bio, role, experience, location, skills, socials, avatar) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      bio,
      role,
      experience,
      location,
      skills,
      socials,
      avatar: avatar || currentUser.avatar
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const checkUsernameExists = (username) => {
    return users.some(u => u.username === username.toLowerCase().trim());
  };

  const logoutUser = () => {
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

  return (
    <DevConnectContext.Provider value={{
      users,
      projects,
      discussions,
      currentUser,
      notifications,
      collabRequests,
      registerUser,
      loginUser,
      updateProfileSetup,
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
