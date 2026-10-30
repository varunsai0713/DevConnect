import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Check, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useDevConnect } from '../context/DevConnectContext';

export default function ActivityPage() {
  const { 
    activityNotifications, 
    fetchActivityNotifications, 
    markActivityNotificationRead 
  } = useDevConnect();

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  useEffect(() => {
    fetchActivityNotifications();
  }, []);

  const filteredNotifications = activityNotifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'JOIN_REQUEST_RECEIVED':
        return <UserPlus className="w-4 h-4 text-amber-400" />;
      case 'JOIN_REQUEST_ACCEPTED':
      case 'WORKSPACE_ADDED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'JOIN_REQUEST_DECLINED':
      case 'WORKSPACE_REMOVED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
      
      {/* Activity Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-400" />
            <span>Activity Feed</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time server notifications for workspace invites, handshakes, and role updates.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({activityNotifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              filter === 'UNREAD'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({activityNotifications.filter(n => !n.read).length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filter === 'UNREAD' ? 'You have caught up with all activity!' : 'No system notifications currently.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markActivityNotificationRead(notif.id)}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
                  : 'bg-slate-900/90 border-indigo-500/40 shadow-sm shadow-indigo-600/10 hover:border-indigo-500'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      {notif.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markActivityNotificationRead(notif.id);
                  }}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white hover:border-slate-700 shrink-0 transition"
                  title="Mark as read"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

