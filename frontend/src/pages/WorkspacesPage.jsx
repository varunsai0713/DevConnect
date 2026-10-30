import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Layers, 
  Hash, 
  Plus, 
  Users, 
  UserMinus, 
  UserPlus, 
  ChevronDown, 
  Check, 
  X, 
  Clock, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  AlertTriangle,
  RotateCcw,
  Wifi,
  WifiOff,
  LogOut
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import { useDevConnect } from '../context/DevConnectContext';

export default function WorkspacesPage() {
  const { 
    currentUser, 
    workspaces, 
    activeWorkspaceId, 
    activeChannelId, 
    setActiveWorkspaceId, 
    setActiveChannelId, 
    fetchWorkspaces,
    fetchWorkspaceMembers,
    createChannel,
    removeWorkspaceMember,
    fetchPendingJoinRequests,
    handleJoinRequest,
    fetchChannelMessages,
    markChannelRead
  } = useDevConnect();

  // Mobile navigation pane state: 'channels' | 'chat' | 'members'
  const [mobilePane, setMobilePane] = useState('chat');
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [channelError, setChannelError] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Real-time Chat & STOMP states
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [stompConnected, setStompConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});

  const clientRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isTypingRef = useRef(false);
  const typingTimerRef = useRef(null);
  const typingUserTimersRef = useRef({});
  const initialLoadDoneRef = useRef(false);

  // Initial workspaces fetch
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const currentWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId]);

  const currentChannel = useMemo(() => {
    if (!currentWorkspace?.channels || currentWorkspace.channels.length === 0) return null;
    return currentWorkspace.channels.find(c => c.id === activeChannelId) || currentWorkspace.channels[0];
  }, [currentWorkspace, activeChannelId]);

  const isOwner = currentWorkspace?.userRole === 'OWNER';

  // Load pending join requests if owner
  useEffect(() => {
    if (currentWorkspace?.id && isOwner) {
      fetchPendingJoinRequests(currentWorkspace.id).then(reqs => {
        if (Array.isArray(reqs)) setPendingRequests(reqs);
      });
    }
  }, [currentWorkspace?.id, isOwner]);

  // STOMP WebSocket Connection lifecycle
  useEffect(() => {
    const token = localStorage.getItem('dc_auth_token');
    if (!token) return;

    // Resolve WebSocket URL
    const getWsUrl = () => {
      if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
      }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws`;
    };

    const client = new Client({
      brokerURL: getWsUrl(),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 3000,
      onConnect: () => {
        setStompConnected(true);
        setReconnecting(false);

        // Subscribe to user error queue (rate limits, channel permission errors)
        client.subscribe('/user/queue/errors', (frame) => {
          try {
            const errData = JSON.parse(frame.body);
            setRateLimitError(errData.message || 'Action rejected');
          } catch {
            setRateLimitError(frame.body || 'Action rejected');
          }
          setTimeout(() => setRateLimitError(''), 5000);
        });
      },
      onDisconnect: () => {
        setStompConnected(false);
      },
      onWebSocketClose: () => {
        setStompConnected(false);
        setReconnecting(true);
      },
      onStompError: (frame) => {
        console.warn('STOMP protocol error:', frame.headers['message']);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  // Subscribe to Workspace Presence whenever workspace or connection changes
  useEffect(() => {
    if (!clientRef.current || !stompConnected || !currentWorkspace?.id) return;

    const presenceSub = clientRef.current.subscribe(
      `/topic/workspaces/${currentWorkspace.id}/presence`,
      (frame) => {
        try {
          const event = JSON.parse(frame.body);
          if (event && event.userId) {
            setOnlineUsers(prev => ({
              ...prev,
              [event.userId]: !!event.online
            }));
          }
        } catch (e) {
          console.warn('Failed to parse presence frame:', e);
        }
      }
    );

    return () => {
      presenceSub.unsubscribe();
    };
  }, [stompConnected, currentWorkspace?.id]);

  // Subscribe to Channel Messages & Typing whenever active channel changes
  useEffect(() => {
    if (!currentChannel?.id) return;

    // Load initial 30 messages
    let isCancelled = false;
    setLoadingMessages(true);
    initialLoadDoneRef.current = false;

    fetchChannelMessages(currentChannel.id, null, 30)
      .then((history) => {
        if (isCancelled) return;
        setMessages(history);
        setHasOlder(history.length === 30);
        setLoadingMessages(false);
        initialLoadDoneRef.current = true;

        // Auto scroll to bottom
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 50);

        // Mark read
        if (history.length > 0) {
          const latestId = history[history.length - 1].id;
          markChannelRead(currentChannel.id, latestId);
        } else {
          markChannelRead(currentChannel.id);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoadingMessages(false);
      });

    // Clear typing users on channel switch
    setTypingUsers({});

    // If STOMP is connected, subscribe to channel topics
    if (!clientRef.current || !stompConnected) {
      return () => { isCancelled = true; };
    }

    // 1. Channel messages subscription
    const messageSub = clientRef.current.subscribe(
      `/topic/channels/${currentChannel.id}`,
      (frame) => {
        try {
          const incoming = JSON.parse(frame.body);
          setMessages(prev => {
            // Check deduplication by server id
            if (prev.some(m => m.id === incoming.id)) {
              return prev;
            }
            // Check if matching optimistic message by clientMessageId
            if (incoming.clientMessageId && prev.some(m => m.clientMessageId === incoming.clientMessageId)) {
              return prev.map(m => m.clientMessageId === incoming.clientMessageId ? { ...incoming, status: 'delivered' } : m);
            }
            // Otherwise append new message
            return [...prev, { ...incoming, status: 'delivered' }];
          });

          // Mark channel read immediately
          markChannelRead(currentChannel.id, incoming.id);

          // Auto-scroll if user is near bottom
          setTimeout(() => {
            if (chatContainerRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
              const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
              if (isNearBottom) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            }
          }, 50);
        } catch (e) {
          console.warn('Failed to parse incoming message frame:', e);
        }
      }
    );

    // 2. Channel typing indicator subscription
    const typingSub = clientRef.current.subscribe(
      `/topic/channels/${currentChannel.id}/typing`,
      (frame) => {
        try {
          const event = JSON.parse(frame.body);
          // Ignore own typing events
          if (String(event.userId) === String(currentUser?.id) || event.username === currentUser?.username) {
            return;
          }

          if (event.typing) {
            // Clear existing timeout for this user if any
            if (typingUserTimersRef.current[event.userId]) {
              clearTimeout(typingUserTimersRef.current[event.userId]);
            }

            // Set user as typing
            setTypingUsers(prev => ({
              ...prev,
              [event.userId]: event.fullName || event.username
            }));

            // Auto expire after 3.5 seconds
            typingUserTimersRef.current[event.userId] = setTimeout(() => {
              setTypingUsers(prev => {
                const next = { ...prev };
                delete next[event.userId];
                return next;
              });
            }, 3500);
          } else {
            // User stopped typing
            if (typingUserTimersRef.current[event.userId]) {
              clearTimeout(typingUserTimersRef.current[event.userId]);
            }
            setTypingUsers(prev => {
              const next = { ...prev };
              delete next[event.userId];
              return next;
            });
          }
        } catch (e) {
          console.warn('Failed to parse typing frame:', e);
        }
      }
    );

    return () => {
      isCancelled = true;
      messageSub.unsubscribe();
      typingSub.unsubscribe();
    };
  }, [currentChannel?.id, stompConnected]);

  // Cursor-based pagination: fetch older messages on scroll to top
  const handleScroll = useCallback(async () => {
    if (!chatContainerRef.current || loadingOlder || !hasOlder || messages.length === 0) return;

    if (chatContainerRef.current.scrollTop === 0) {
      const oldestMessage = messages[0];
      if (!oldestMessage || !oldestMessage.id || String(oldestMessage.id).startsWith('temp-')) return;

      setLoadingOlder(true);
      const prevScrollHeight = chatContainerRef.current.scrollHeight;

      try {
        const older = await fetchChannelMessages(currentChannel.id, oldestMessage.id, 30);
        if (older.length < 30) {
          setHasOlder(false);
        }
        if (older.length > 0) {
          setMessages(prev => [...older, ...prev]);
          // Restore scroll position so user experience is smooth
          requestAnimationFrame(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - prevScrollHeight;
            }
          });
        }
      } catch (err) {
        console.warn('Failed to load older messages:', err);
      } finally {
        setLoadingOlder(false);
      }
    }
  }, [loadingOlder, hasOlder, messages, currentChannel?.id]);

  // Handle Send Message
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed || !currentChannel?.id) return;
    if (trimmed.length > 4000) {
      setRateLimitError('Message exceeds maximum length of 4000 characters.');
      setTimeout(() => setRateLimitError(''), 4000);
      return;
    }

    // Stop active typing notification immediately
    if (isTypingRef.current && clientRef.current && stompConnected) {
      isTypingRef.current = false;
      clearTimeout(typingTimerRef.current);
      clientRef.current.publish({
        destination: `/app/channels/${currentChannel.id}/typing`,
        body: JSON.stringify({ typing: false })
      });
    }

    const clientMessageId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);

    const optimisticMsg = {
      id: 'temp-' + clientMessageId,
      channelId: currentChannel.id,
      senderId: currentUser?.id,
      senderUsername: currentUser?.username,
      senderFullName: currentUser?.fullName || currentUser?.username,
      senderAvatar: currentUser?.avatar,
      content: trimmed,
      clientMessageId,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setMessageInput('');

    // Scroll to bottom
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 30);

    // Publish STOMP message
    if (clientRef.current && stompConnected) {
      try {
        clientRef.current.publish({
          destination: `/app/channels/${currentChannel.id}/send`,
          body: JSON.stringify({
            content: trimmed,
            clientMessageId
          })
        });
      } catch (err) {
        console.error('Failed to send STOMP message:', err);
        setMessages(prev => prev.map(m => m.clientMessageId === clientMessageId ? { ...m, status: 'failed' } : m));
      }
    } else {
      setMessages(prev => prev.map(m => m.clientMessageId === clientMessageId ? { ...m, status: 'failed' } : m));
    }
  };

  // Retry sending a failed message
  const handleRetryMessage = (failedMsg) => {
    setMessages(prev => prev.map(m => m.clientMessageId === failedMsg.clientMessageId ? { ...m, status: 'sending' } : m));
    if (clientRef.current && stompConnected) {
      try {
        clientRef.current.publish({
          destination: `/app/channels/${failedMsg.channelId}/send`,
          body: JSON.stringify({
            content: failedMsg.content,
            clientMessageId: failedMsg.clientMessageId
          })
        });
      } catch (err) {
        setMessages(prev => prev.map(m => m.clientMessageId === failedMsg.clientMessageId ? { ...m, status: 'failed' } : m));
      }
    } else {
      setMessages(prev => prev.map(m => m.clientMessageId === failedMsg.clientMessageId ? { ...m, status: 'failed' } : m));
    }
  };

  // Handle typing key events & debounce
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (clientRef.current && stompConnected && currentChannel?.id) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        clientRef.current.publish({
          destination: `/app/channels/${currentChannel.id}/typing`,
          body: JSON.stringify({ typing: true })
        });
      }

      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        if (clientRef.current && stompConnected && currentChannel?.id) {
          clientRef.current.publish({
            destination: `/app/channels/${currentChannel.id}/typing`,
            body: JSON.stringify({ typing: false })
          });
        }
      }, 2500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Channel Creation
  const handleCreateChannelSubmit = async (e) => {
    e.preventDefault();
    setChannelError('');

    const trimmed = newChannelName.trim().toLowerCase();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setChannelError('Channel name must be between 2 and 30 characters.');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      setChannelError('Only lowercase letters, numbers, and hyphens are allowed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createChannel(currentWorkspace.id, trimmed);
      setNewChannelName('');
      setShowCreateChannelModal(false);
      setActionMessage(`Channel #${trimmed} created successfully.`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setChannelError(err.message || 'Failed to create channel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessRequest = async (requestId, status) => {
    try {
      await handleJoinRequest(requestId, status);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setActionMessage(`Request ${status.toLowerCase()} successfully.`);
      setTimeout(() => setActionMessage(''), 3000);
      fetchWorkspaceMembers(currentWorkspace.id);
    } catch (err) {
      setActionMessage(err.message || 'Failed to process request.');
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) return;
    try {
      await removeWorkspaceMember(currentWorkspace.id, userId);
      setActionMessage(`${memberName} removed from workspace.`);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage(err.message || 'Failed to remove member.');
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!window.confirm('Are you sure you want to leave this workspace?')) return;
    try {
      await removeWorkspaceMember(currentWorkspace.id, currentUser?.id);
      fetchWorkspaces();
    } catch (err) {
      alert(err.message || 'Failed to leave workspace.');
    }
  };

  // Format message timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Typing users label
  const typingNames = Object.values(typingUsers);
  const typingText = useMemo(() => {
    if (typingNames.length === 0) return '';
    if (typingNames.length === 1) return `${typingNames[0]} is typing...`;
    if (typingNames.length === 2) return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    return `${typingNames[0]} and ${typingNames.length - 1} others are typing...`;
  }, [typingNames]);

  if (!currentWorkspace) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-black text-white">No Workspaces Joined Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">
          Workspaces are collaborative project hubs with dedicated channels and real-time chat. Launch a handshake proposal on the Feed or create a workspace for your own project!
        </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
        >
          Explore Projects Feed
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#020617]">
      
      {/* Toast Alert / Action Message */}
      {actionMessage && (
        <div className="absolute top-3 right-4 z-50 bg-indigo-950 border border-indigo-600 text-indigo-200 text-xs px-3.5 py-2 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2">
          {actionMessage}
        </div>
      )}

      {/* Rate Limit Alert */}
      {rateLimitError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-rose-950/95 border border-rose-700 text-rose-200 text-xs px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{rateLimitError}</span>
        </div>
      )}

      {/* Reconnecting Banner */}
      {reconnecting && (
        <div className="absolute top-0 inset-x-0 z-40 bg-amber-950/90 border-b border-amber-800 text-amber-200 text-[11px] font-mono py-1 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Reconnecting to live chat...</span>
        </div>
      )}

      {/* =========================================================================
          PANE 1: LEFT WORKSPACE & CHANNELS LIST (Desktop & Mobile view)
          ========================================================================= */}
      <div 
        className={`${
          mobilePane === 'channels' ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 lg:w-72 bg-slate-950/80 border-r border-slate-800/80 shrink-0 z-20`}
      >
        {/* Workspace Switcher Header */}
        <div className="p-3 border-b border-slate-800/80 relative">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition text-left cursor-pointer"
            aria-expanded={showWorkspaceDropdown}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center shrink-0 font-black text-xs text-white">
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold text-white truncate">{currentWorkspace.name}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    isOwner ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {currentWorkspace.userRole || 'MEMBER'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {currentWorkspace.membersCount || currentWorkspace.members?.length || 1} members
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Workspace Switcher Dropdown */}
          {showWorkspaceDropdown && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowWorkspaceDropdown(false)} 
              />
              <div className="absolute left-3 right-3 top-16 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-40 space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1 block">Your Workspaces</span>
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setShowWorkspaceDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition cursor-pointer ${
                      ws.id === currentWorkspace.id 
                        ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === currentWorkspace.id && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Channels Section Header with Action Buttons */}
        <div className="px-3.5 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400">
            Channels ({currentWorkspace.channels?.length || 1})
          </span>

          <div className="flex items-center gap-1">
            {/* Join Requests badge button (visible to owner) */}
            {isOwner && (
              <button
                onClick={() => setShowJoinRequestsModal(true)}
                className="relative p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="View Pending Join Requests"
                aria-label="View Pending Join Requests"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 bg-amber-500 text-slate-950 font-black text-[8px] rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            )}

            {/* Add Channel button (visible to owner) */}
            {isOwner && (
              <button
                onClick={() => setShowCreateChannelModal(true)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Create New Channel"
                aria-label="Create New Channel"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {currentWorkspace.channels?.map(ch => {
            const isChActive = currentChannel?.id === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChannelId(ch.id);
                  setMobilePane('chat');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                  isChActive
                    ? 'bg-indigo-600/20 text-white font-semibold border-l-2 border-indigo-500'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className={`w-3.5 h-3.5 shrink-0 ${isChActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="truncate">{ch.name}</span>
                </div>

                {ch.unreadCount > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {ch.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Workspace Actions (Leave) */}
        {!isOwner && (
          <div className="p-3 border-t border-slate-800/80">
            <button
              onClick={handleLeaveWorkspace}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-rose-900/30 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          PANE 2: MIDDLE CHAT / MESSAGES AREA (Active Channel)
          ========================================================================= */}
      <div 
        className={`${
          mobilePane === 'chat' ? 'flex' : 'hidden'
        } md:flex flex-col flex-1 bg-slate-900/50 min-w-0 z-10`}
      >
        {/* Channel Top Header Bar */}
        <div className="h-12 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5 truncate">
            {/* Mobile back to channels button */}
            <button
              onClick={() => setMobilePane('channels')}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded"
              aria-label="Back to channels"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <Hash className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-sm font-bold text-white truncate">
              {currentChannel?.name || 'general'}
            </span>
            <span className="hidden sm:inline-block text-[9.5px] font-mono text-slate-500 uppercase tracking-wider">
              {currentWorkspace.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* STOMP Realtime status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono">
              <span className={`w-2 h-2 rounded-full ${stompConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-400">{stompConnected ? 'LIVE' : 'CONNECTING'}</span>
            </div>

            {/* Mobile members toggle button */}
            <button
              onClick={() => setMobilePane('members')}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono"
              aria-label="Toggle workspace members"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentWorkspace.members?.length || 1}</span>
            </button>
          </div>
        </div>

        {/* Message History Container with Cursor-Based Pagination */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {/* Older messages loading spinner */}
          {loadingOlder && (
            <div className="py-2 flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading older messages...</span>
            </div>
          )}

          {/* Beginning of channel indicator */}
          {!hasOlder && !loadingMessages && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-center space-y-1 my-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 mb-2">
                <Hash className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">This is the start of #{currentChannel?.name || 'general'}</h3>
              <p className="text-[10px] text-slate-400">Welcome to the channel. Send the first message below!</p>
            </div>
          )}

          {/* Initial Loading State */}
          {loadingMessages && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Loading channel history...</span>
            </div>
          )}

          {/* Messages list */}
          {!loadingMessages && messages.map((msg) => {
            const isMe = String(msg.senderId) === String(currentUser?.id) || msg.senderUsername === currentUser?.username;
            const isFailed = msg.status === 'failed';
            const isSending = msg.status === 'sending';

            return (
              <div 
                key={msg.clientMessageId || msg.id}
                className={`flex gap-3 text-left group ${isFailed ? 'opacity-90' : ''}`}
              >
                <img 
                  src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
                  alt={msg.senderFullName || msg.senderUsername || 'Member'}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-800 mt-0.5" 
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white truncate">
                      {msg.senderFullName || msg.senderUsername || 'Member'}
                    </span>
                    {isMe && <span className="text-[9px] text-indigo-400 font-mono">(You)</span>}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTime(msg.createdAt)}
                    </span>
                    {isSending && (
                      <span className="text-[9px] text-slate-400 font-mono italic">sending...</span>
                    )}
                  </div>

                  {/* Plain Text Message Body (Plain text only, never HTML) */}
                  <div className="text-xs sm:text-[13px] text-slate-200 whitespace-pre-wrap break-words leading-relaxed selection:bg-indigo-600 selection:text-white">
                    {msg.content}
                  </div>

                  {/* Failed status & retry button */}
                  {isFailed && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-rose-400 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Message failed to send.</span>
                      <button
                        onClick={() => handleRetryMessage(msg)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-200 hover:bg-rose-900 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ephemeral Typing Indicator Area */}
        {typingText && (
          <div className="px-4 py-1 text-[11px] text-indigo-400 font-mono flex items-center gap-2 animate-in fade-in">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            </span>
            <span>{typingText}</span>
          </div>
        )}

        {/* Message Input Box with Enter to send & Shift+Enter newline */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800/80">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500/60 transition">
            <input
              type="text"
              placeholder={`Message #${currentChannel?.name || 'general'} (Press Enter to send, Shift+Enter for newline)`}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              maxLength={4000}
              className="flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-500 font-mono">
            <span>Plain text only • Max 4000 chars</span>
            <span>{messageInput.length} / 4000</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PANE 3: RIGHT MEMBERS LIST (With Live Presence Indicators)
          ========================================================================= */}
      <div 
        className={`${
          mobilePane === 'members' ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-60 xl:w-64 bg-slate-950/90 border-l border-slate-800/80 shrink-0 z-20`}
      >
        <div className="h-12 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
          {/* Mobile back to chat button */}
          <button
            onClick={() => setMobilePane('chat')}
            className="lg:hidden p-1 text-slate-400 hover:text-white mr-2"
            aria-label="Back to chat"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono tracking-wider">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Members ({currentWorkspace.members?.length || 1})</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {currentWorkspace.members?.map(m => {
            const isMe = String(m.userId) === String(currentUser?.id) || m.username === currentUser?.username;
            const isMemberOwner = m.role === 'OWNER';
            const isOnline = isMe ? stompConnected : !!onlineUsers[m.userId];

            return (
              <div 
                key={m.userId}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850 hover:border-slate-800 transition group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="relative shrink-0">
                    <img 
                      src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
                      alt={m.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700" 
                    />
                    {/* Live Online Presence Indicator Dot */}
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-slate-950 rounded-full ${
                        isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {m.fullName} {isMe && <span className="text-[9px] text-indigo-400">(You)</span>}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                        isMemberOwner 
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.role}
                      </span>
                      <span className="text-[8.5px] font-mono text-slate-500">
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remove member button (owner removing other member) */}
                {isOwner && !isMe && (
                  <button
                    onClick={() => handleRemoveMember(m.userId, m.fullName)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                    title={`Remove ${m.fullName}`}
                    aria-label={`Remove ${m.fullName}`}
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL: CREATE CHANNEL (Owner only)
          ========================================================================= */}
      {showCreateChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                <span>Create Channel</span>
              </h3>
              <button 
                onClick={() => setShowCreateChannelModal(false)}
                className="text-slate-500 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                  Channel Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-mono text-sm">#</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. backend-api"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">2-30 characters, lowercase letters, numbers, and hyphens.</p>
              </div>

              {channelError && (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-900/50 text-rose-300 text-xs">
                  {channelError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateChannelModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PENDING JOIN REQUESTS (Owner only)
          ========================================================================= */}
      {showJoinRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Pending Join Requests ({pendingRequests.length})</span>
              </h3>
              <button 
                onClick={() => setShowJoinRequestsModal(false)}
                className="text-slate-500 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2.5">
              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No pending join requests currently.
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div 
                    key={req.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img 
                        src={req.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
                        alt={req.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700" 
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{req.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{req.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => handleProcessRequest(req.id, 'ACCEPTED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleProcessRequest(req.id, 'DECLINED')}
                        className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800/50 text-rose-300 rounded text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <X className="w-3 h-3" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
