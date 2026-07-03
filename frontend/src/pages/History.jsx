import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const History = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat/histories');
      setChats(response.data);
    } catch (error) {
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      await axios.delete(`/api/chat/${chatId}`);
      setChats(prev => prev.filter(chat => chat._id !== chatId));
      toast.success('Chat deleted');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  // Only Friendly Mode now
  const getModeIcon = () => <MessageSquare size={16} className="text-blue-400" />;

  const getModeColor = () => 'bg-blue-600/20 text-blue-400';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
        Chat History
      </h1>

      {chats.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-dark-muted mb-4" />
          <p className="text-dark-muted">No chat history yet</p>
          <Link 
            to="/"
            className="inline-block mt-4 px-4 py-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Start a new chat
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {chats.map((chat, index) => (
            <motion.div
              key={chat._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/chat/${chat._id}`}
                className="glass-card p-4 block hover:bg-dark-border/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getModeIcon()}
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        getModeColor()
                      )}>
                        Friendly Mode
                      </span>
                      <span className="text-xs text-dark-muted">
                        {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{chat.title}</h3>
                    <p className="text-sm text-dark-muted">
                      {chat.messages?.length || 0} messages
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => deleteChat(chat._id, e)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-dark-muted hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;