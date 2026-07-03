import React, { useState, useEffect, useRef } from 'react';
import userConfig from '../config/userConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import FileUpload from '../components/FileUpload';
import PDFExport from '../components/PDFExport';
import SpeechButton from '../components/SpeechButton';
import { cn } from '../utils/cn';
import {
  Bot,
  User,
  FileText,
  Plus,
  Menu,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ChevronDown,
  GraduationCap,
  Zap,
  Heart,
  Code,
  BookOpen,
  Star,
  Sparkles,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
} from 'lucide-react';

const TOPICS = [
  {
    icon: <GraduationCap size={20} className="text-primary-400" />,
    title: 'Education',
    subtitle: 'How to apply to universities?',
    query: 'How to apply to universities?',
    color: '#00e5c0'
  },
  {
    icon: <Zap size={20} className="text-primary-400" />,
    title: 'Productivity',
    subtitle: 'Be 10x more productive with your work',
    query: 'How can I be 10x more productive with my work?',
    color: '#fbbf24'
  },
  {
    icon: <Heart size={20} className="text-primary-400" />,
    title: 'Health and wellness',
    subtitle: 'Make your health better than ever',
    query: 'Give me tips to improve my health and wellness',
    color: '#ef4444'
  },
  {
    icon: <Code size={20} className="text-primary-400" />,
    title: 'Coding Help',
    subtitle: 'Debug, learn, and build projects',
    query: 'Help me with a coding problem',
    color: '#8b5cf6'
  },
];

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileContext, setFileContext] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatId) fetchChatHistory();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100 && messages.length > 0);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages]);

  const createNewChat = () => {
    setMessages([]);
    setFileContext([]);
    navigate('/');
    toast.success('New chat started');
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chat/history/${chatId}`);
      setMessages(response.data.messages);
      if (response.data.fileContext) setFileContext(response.data.fileContext);
    } catch {
      toast.error('Failed to load chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    const userMessage = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat/message', {
        message: content,
        chatId,
        mode: 'friendly',
        fileContext: fileContext.map(f => ({ fileName: f.fileName, content: f.content })),
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      }]);
      if (!chatId && response.data.chatId) {
        window.history.pushState({}, '', `/chat/${response.data.chatId}`);
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (chatId) formData.append('chatId', chatId);
      const response = await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileContext(prev => [...prev, { fileName: response.data.fileName, content: response.data.content }]);
      toast.success('File uploaded successfully');
    } catch {
      toast.error('Failed to upload file');
    }
  };

  const handleCopyMessage = async (content, index) => {
    try {
      const plainText = content.replace(/\*\*/g, '').replace(/`/g, '');
      await navigator.clipboard.writeText(plainText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleRegenerateResponse = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;
    if (messages[messages.length - 1]?.role === 'assistant') {
      setMessages(prev => prev.slice(0, -1));
    }
    await handleSendMessage(lastUserMessage.content);
  };

  const handleDeleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const hasMessages = messages.length > 0;
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ 
        background: 'linear-gradient(180deg, #0a1419 0%, #0f1d25 100%)',
      }}
    >
      {/* ──────── HEADER ──────── */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(12, 20, 25, 0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(30, 45, 56, 0.6)',
        }}
      >
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-[#1e2d38] transition-colors"
          >
            <Menu size={20} className="text-[#6b8a94]" />
          </button>
          
          {hasMessages && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00e5c0] to-[#00a88d] shadow-lg shadow-[#00e5c0]/20">
                <Bot size={16} className="text-[#0c1419]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Chat</h2>
                <p className="text-[10px] text-[#6b8a94]">Active conversation</p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Title for empty state */}
        {!hasMessages && (
          <h1
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: '#f0f7f4', letterSpacing: '0.15em' }}
          >
            MentorAI
          </h1>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={createNewChat}
            className="p-2 rounded-lg hover:bg-[#1e2d38] transition-colors"
            title="New Chat"
          >
            <Plus size={18} className="text-[#6b8a94]" />
          </button>
          <PDFExport messages={messages} />
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="p-2 rounded-lg hover:bg-[#1e2d38] transition-colors"
            title="Upload File"
          >
            <FileText size={18} className="text-[#6b8a94]" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1e2d38] transition-colors">
            <MoreVertical size={18} className="text-[#6b8a94]" />
          </button>
        </div>
      </div>

      {/* ──────── FILE UPLOAD PANEL ──────── */}
      <AnimatePresence>
        {showFileUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ borderBottom: '1px solid #1e2d38', background: 'rgba(17,27,34,0.6)' }}
          >
            <div className="p-4">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Context Chips */}
      {fileContext.length > 0 && (
        <div className="px-6 py-2 flex flex-wrap gap-2" style={{ borderBottom: '1px solid #1e2d38' }}>
          {fileContext.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full"
              style={{ background: 'rgba(0,229,192,0.08)', border: '1px solid rgba(0,229,192,0.2)', color: '#00e5c0' }}
            >
              <FileText size={12} />
              <span className="truncate max-w-[150px]">{file.fileName}</span>
              <button
                onClick={() => setFileContext(prev => prev.filter((_, i) => i !== index))}
                className="opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ──────── MESSAGES / WELCOME ──────── */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar px-4">
        <div className="max-w-4xl mx-auto w-full">
          {!hasMessages ? (
            /* ── WELCOME SCREEN ── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center min-h-[80vh] py-10"
            >
              {/* Greeting */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #00e5c0 0%, #00a88d 100%)',
                    boxShadow: '0 0 40px rgba(0,229,192,0.2)',
                  }}
                >
                  <Sparkles size={32} className="text-[#0c1419]" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-display font-bold text-white mb-2"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Hi {userConfig.firstName}! 👋
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ color: '#6b8a94', fontSize: '16px' }}
                >
                  What would you like to chat about today?
                </motion.p>
              </div>

              {/* Topic cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto w-full">
                {TOPICS.map((topic, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="p-4 rounded-xl text-left transition-all group"
                    style={{
                      background: 'rgba(17,27,34,0.6)',
                      border: '1px solid #1e2d38',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${topic.color}40`;
                      e.currentTarget.style.background = 'rgba(17,27,34,0.8)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#1e2d38';
                      e.currentTarget.style.background = 'rgba(17,27,34,0.6)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleSendMessage(topic.query)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${topic.color}15` }}
                      >
                        {topic.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#f0f7f4' }}>
                          {topic.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#6b8a94' }}>
                          {topic.subtitle}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── MESSAGES LIST ── */
            <div className="py-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex gap-3 group',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* AI Avatar */}
                    {message.role === 'assistant' && (
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-[#00e5c0] to-[#00a88d] shadow-lg shadow-[#00e5c0]/20">
                        <Bot size={16} color="#0c1419" strokeWidth={2.2} />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="relative flex flex-col max-w-[85%]">
                      {/* Role Label */}
                      <span
                        className="text-xs mb-1.5 font-medium px-1"
                        style={{
                          color: '#6b8a94',
                          textAlign: message.role === 'user' ? 'right' : 'left',
                        }}
                      >
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>

                      <div
                        className={cn(
                          "rounded-2xl px-5 py-3.5 shadow-lg relative",
                          message.role === 'user' 
                            ? "bg-gradient-to-br from-[#00e5c0] to-[#00c9a8] text-[#0c1419]" 
                            : "bg-[#1a2a33]/90 text-[#f0f7f4] border border-[#1e2d38] backdrop-blur-sm"
                        )}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ) : (
                          <ReactMarkdown
                            className="prose prose-invert max-w-none text-sm leading-relaxed"
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-[#f0f7f4]">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="text-[#00e5c0]">{children}</strong>
                              ),
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="relative group/code mt-2 mb-2">
                                    <button
                                      onClick={() => handleCopyMessage(String(children), index)}
                                      className="absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
                                      style={{ 
                                        background: 'rgba(12,20,25,0.9)',
                                        border: '1px solid #1e2d38'
                                      }}
                                    >
                                      {copiedIndex === index ?
                                        <Check size={14} color="#00e5c0" /> :
                                        <Copy size={14} color="#6b8a94" />
                                      }
                                    </button>
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-xl !mt-0 !mb-0"
                                      customStyle={{ 
                                        background: 'rgba(8,14,18,0.95)', 
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontSize: '13px',
                                      }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code
                                    style={{
                                      background: 'rgba(0,229,192,0.1)',
                                      color: '#00e5c0',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.85em',
                                      fontFamily: 'Fira Code, monospace',
                                    }}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <span className="text-[10px] opacity-50">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Message Actions */}
                      <div
                        className={cn(
                          'flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity',
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <button
                          onClick={() => handleCopyMessage(message.content, index)}
                          className="p-1.5 rounded-lg hover:bg-[#1e2d38] transition-colors"
                          title="Copy"
                        >
                          {copiedIndex === index ?
                            <Check size={14} className="text-[#00e5c0]" /> :
                            <Copy size={14} className="text-[#6b8a94]" />
                          }
                        </button>
                        {message.role === 'assistant' && (
                          <SpeechButton text={message.content} />
                        )}
                        {message.role === 'user' && (
                          <button
                            onClick={() => handleDeleteMessage(index)}
                            className="p-1.5 rounded-lg hover:bg-[#1e2d38] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-[#6b8a94]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-[#6b8a94] to-[#4a6a74] shadow-lg">
                        <User size={16} className="text-white" strokeWidth={2.2} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#00e5c0] to-[#00a88d] shadow-lg shadow-[#00e5c0]/20">
                    <Bot size={16} color="#0c1419" />
                  </div>
                  <div className="bg-[#1a2a33]/90 rounded-2xl px-5 py-3.5 border border-[#1e2d38] backdrop-blur-sm">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ──────── SCROLL TO BOTTOM ──────── */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 right-6 z-10 p-2.5 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #00e5c0 0%, #00a88d 100%)',
              boxShadow: '0 4px 14px rgba(0,229,192,0.3)',
            }}
            title="Scroll to bottom"
          >
            <ChevronDown size={16} color="#0c1419" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ──────── REGENERATE ──────── */}
      {hasMessages && messages[messages.length - 1]?.role === 'assistant' && !isLoading && (
        <div className="flex justify-center py-2">
          <button
            onClick={handleRegenerateResponse}
            className="flex items-center gap-2 px-4 py-2 text-xs rounded-full transition-all"
            style={{
              background: 'rgba(17,27,34,0.9)',
              border: '1px solid #1e2d38',
              color: '#6b8a94',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,229,192,0.3)';
              e.currentTarget.style.color = '#00e5c0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1e2d38';
              e.currentTarget.style.color = '#6b8a94';
            }}
          >
            <RefreshCw size={13} />
            <span>Regenerate response</span>
          </button>
        </div>
      )}

      {/* ──────── INPUT BAR ──────── */}
      <div
        className="px-4 py-4"
        style={{
          background: 'rgba(12, 20, 25, 0.95)',
          borderTop: '1px solid rgba(30,45,56,0.6)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onFileUpload={() => setShowFileUpload(v => !v)}
            showFileUpload={showFileUpload}
          />
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e2d38;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2a3d48;
        }
        .prose {
          color: #f0f7f4;
        }
        .prose p {
          margin-bottom: 0.75rem;
        }
        .prose p:last-child {
          margin-bottom: 0;
        }
        .prose strong {
          color: #00e5c0;
        }
        .prose ul, .prose ol {
          margin-bottom: 0.75rem;
        }
        .prose li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default Chat;