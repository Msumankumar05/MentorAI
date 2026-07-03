import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

const SpeechButton = ({ text }) => {
    const { speak, cancel, isSpeaking, supported } = useSpeech();
    const [error, setError] = useState(null);

    const handleToggleSpeak = useCallback(() => {
        console.log('🔘 SpeechButton clicked, isSpeaking:', isSpeaking);
        try {
            if (!supported) {
                console.warn('❌ SpeechButton: Speech not supported');
                setError('Speech not supported');
                return;
            }

            if (isSpeaking) {
                console.log('⏹️ SpeechButton: Stopping speech');
                cancel();
            } else {
                setError(null);
                // Remove markdown formatting before speaking for better UX
                const cleanText = text
                    .replace(/[*#_`~]/g, '') // Remove formatting characters
                    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep link text, remove URL
                    .trim();

                if (!cleanText) {
                    console.warn('⚠️ SpeechButton: No text to speak');
                    setError('No text to speak');
                    return;
                }

                console.log('🔊 SpeechButton: Requesting speak');
                speak(cleanText);
            }
        } catch (err) {
            console.error('❌ SpeechButton error:', err);
            setError('Failed to process speech');
        }
    }, [text, isSpeaking, supported, speak, cancel]);

    if (!supported) return null;

    if (error) {
        return (
            <button
                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                title={error}
                onClick={() => setError(null)}
            >
                <AlertCircle size={12} className="text-red-400" />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleSpeak}
            className={`
        p-1 rounded hover:bg-dark-border transition-all duration-200
        ${isSpeaking
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-dark-muted hover:text-primary-400'
            }
      `}
            title={isSpeaking ? 'Stop' : 'Read aloud'}
        >
            {isSpeaking ? (
                <VolumeX size={12} className="animate-pulse" />
            ) : (
                <Volume2 size={12} />
            )}
        </button>
    );
};

export default SpeechButton;
