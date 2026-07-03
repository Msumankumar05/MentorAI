import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/**
 * Inline mic button that fits inside the ChatInput pill.
 * No absolute positioning — renders as a normal flex child.
 */
const SpeechRecognition = ({ onTranscript, isListening, setIsListening }) => {
  const recognitionRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return; // browser doesn't support it

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      onTranscript(transcript);
    };

    rec.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow mic access.');
      } else if (event.error === 'no-speech') {
        toast.error('No speech detected — try again.');
      } else {
        toast.error('Voice error: ' + event.error);
      }
    };

    rec.onend = () => {
      setIsListening(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };

    recognitionRef.current = rec;

    return () => {
      rec.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in this browser (use Chrome/Edge).');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening… speak now 🎤', { duration: 2000 });
      } catch {
        toast.error('Microphone access denied');
      }
    }
  };

  return (
    <motion.button
      type="button"
      onClick={toggleListening}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      title={isListening ? 'Stop listening' : 'Voice to text'}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.2s',
        background: isListening ? 'rgba(239,68,68,0.15)' : 'transparent',
        color: isListening ? '#ef4444' : '#6b8a94',
      }}
      onMouseEnter={e => {
        if (!isListening) e.currentTarget.style.color = '#00e5c0';
      }}
      onMouseLeave={e => {
        if (!isListening) e.currentTarget.style.color = '#6b8a94';
      }}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="active"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="relative flex items-center justify-center"
          >
            <Mic size={17} />
            {/* Pulse ring */}
            <motion.span
              animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                border: '1.5px solid #ef4444',
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
          >
            <Mic size={17} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SpeechRecognition;