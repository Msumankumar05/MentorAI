import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  History,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Sparkles,
  Clock,
  Trash2,
  LogOut,
} from 'lucide-react';
import axios from 'axios';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [user] = useState({ name: 'M Suman Kumar', avatar: 'MS', plan: 'Pro' });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      setFilteredChats(chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())));
    }
  }, [searchQuery, chats]);

  const fetchChats = async () => {
    try {
      const res = await axios.get('/api/chat/histories');
      setChats(res.data);
      setFilteredChats(res.data);
    } catch { /* silent */ }
  };

  const createNewChat = () => { navigate('/'); };

  const deleteChat = async (chatId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this chat?')) return;
    try {
      await axios.delete(`/api/chat/${chatId}`);
      setChats(prev => prev.filter(c => c._id !== chatId));
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (date) => {
    const diff = Math.ceil(Math.abs(new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const sidebarW = isCollapsed ? '72px' : '260px';

  return (
    <motion.aside
      animate={{ width: sidebarW }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-screen flex flex-col overflow-hidden flex-shrink-0"
      style={{
        background: '#0f1d25',
        borderRight: '1px solid #1e2d38',
        width: sidebarW,
      }}
    >
      {/* Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 z-20 w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: '#111b22',
          border: '1px solid #1e2d38',
          color: '#00e5c0',
        }}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </motion.button>

      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: '1px solid #1e2d38' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #00e5c0 0%, #00a88d 100%)',
            boxShadow: '0 0 14px rgba(0,229,192,0.3)',
          }}
        >
          <Sparkles size={16} color="#0c1419" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <p className="font-bold text-sm" style={{ color: '#f0f7f4', fontFamily: "'Space Grotesk', sans-serif" }}>
                MentorAI
              </p>
              <p className="text-xs" style={{ color: '#6b8a94' }}>Study Assistant</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Chat */}
      <div className="px-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={createNewChat}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #00e5c0 0%, #00c9a8 100%)',
            color: '#0c1419',
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 4px 14px rgba(0,229,192,0.25)',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <Plus size={18} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                New Chat
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 mt-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b8a94' }} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-colors"
              style={{
                background: 'rgba(17,27,34,0.8)',
                border: '1px solid #1e2d38',
                color: '#f0f7f4',
                fontSize: 13,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,229,192,0.35)'}
              onBlur={e => e.target.style.borderColor = '#1e2d38'}
            />
          </div>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto mt-4 px-3">
        {!isCollapsed && (
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: '#6b8a94' }}>
            Recent Chats
          </p>
        )}
        <div className="space-y-0.5">
          {filteredChats.slice(0, 10).map((chat) => {
            const isActive = location.pathname.includes(chat._id);
            return (
              <Link key={chat._id} to={`/chat/${chat._id}`} className="block group">
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 3 }}
                  className="p-2.5 rounded-xl flex items-center gap-3 relative transition-all"
                  style={{
                    background: isActive ? 'rgba(0,229,192,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,229,192,0.2)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(30,45,56,0.5)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(30,45,56,0.6)' }}
                  >
                    <MessageSquare size={13} style={{ color: isActive ? '#00e5c0' : '#6b8a94' }} />
                  </div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 min-w-0"
                      >
                        <p className="text-xs font-medium truncate" style={{ color: '#f0f7f4' }}>
                          {chat.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={9} style={{ color: '#6b8a94' }} />
                          <p className="text-[11px]" style={{ color: '#6b8a94' }}>{formatDate(chat.updatedAt)}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isCollapsed && (
                    <button
                      onClick={e => deleteChat(chat._id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={12} style={{ color: '#6b8a94' }} />
                    </button>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {filteredChats.length === 0 && !isCollapsed && (
            <p className="text-xs text-center py-6" style={{ color: '#6b8a94' }}>No chats yet</p>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid #1e2d38' }}
      >
        {/* User row */}
        <div className="flex items-center gap-3 p-2 rounded-xl mb-2" style={{ background: 'rgba(17,27,34,0.6)' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #00e5c0 0%, #00a88d 100%)',
              color: '#0c1419',
            }}
          >
            {user.avatar}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-semibold truncate" style={{ color: '#f0f7f4' }}>{user.name}</p>
                <p className="text-[11px]" style={{ color: '#6b8a94' }}>{user.plan} Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links */}
        <div className="flex gap-1">
          <Link
            to="/history"
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-all text-xs"
            style={{
              color: location.pathname === '/history' ? '#00e5c0' : '#6b8a94',
              background: location.pathname === '/history' ? 'rgba(0,229,192,0.08)' : 'transparent',
            }}
          >
            <History size={15} />
            {!isCollapsed && <span>History</span>}
          </Link>
          <Link
            to="/settings"
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-all text-xs"
            style={{ color: '#6b8a94' }}
          >
            <Settings size={15} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;