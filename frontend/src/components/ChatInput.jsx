import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Camera, X } from 'lucide-react';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import SpeechRecognition from './SpeechRecognition';

const ChatInput = ({ onSendMessage, isLoading, onFileUpload, showFileUpload }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceInput = (transcript) => {
    setMessage(transcript);
    toast.success('Voice captured!', { icon: '🎤' });
  };

  const canSend = message.trim() && !isLoading;

  return (
    <div className="input-container">
      {/* Camera / attachment button — teal + X when panel is open */}
      <motion.button
        type="button"
        onClick={onFileUpload}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        title={showFileUpload ? 'Close file panel' : 'Upload file'}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          background: showFileUpload ? 'rgba(0,229,192,0.12)' : 'transparent',
          color: showFileUpload ? '#00e5c0' : '#6b8a94',
          transition: 'all 0.2s',
        }}
      >
        <AnimatePresence mode="wait">
          {showFileUpload ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={17} />
            </motion.div>
          ) : (
            <motion.div key="camera" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Camera size={17} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What is on your mind?"
        className="input-simple"
        rows={1}
        disabled={isLoading}
        style={{
          maxHeight: 140,
          lineHeight: '1.5',
          paddingTop: '10px',
          paddingBottom: '10px',
        }}
      />

      {/* Mic (voice input) */}
      <SpeechRecognition
        onTranscript={handleVoiceInput}
        isListening={isListening}
        setIsListening={setIsListening}
      />

      {/* Send button */}
      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={!canSend}
        whileHover={canSend ? { scale: 1.08 } : {}}
        whileTap={canSend ? { scale: 0.94 } : {}}
        className="send-btn"
        title="Send message"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 18,
              height: 18,
              border: '2.5px solid rgba(12,20,25,0.3)',
              borderTopColor: '#0c1419',
              borderRadius: '50%',
            }}
          />
        ) : (
          <ArrowUp size={18} strokeWidth={2.5} color="#0c1419" />
        )}
      </motion.button>
    </div>
  );
};

export default ChatInput;