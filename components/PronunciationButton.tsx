
import React, { useCallback } from 'react';

interface PronunciationButtonProps {
  textToSpeak: string;
  label?: string;
  lang?: string;
  disabled?: boolean;
  className?: string;
}

const PronunciationButton: React.FC<PronunciationButtonProps> = ({
  textToSpeak,
  label,
  lang = 'zh-CN', // Default to Mandarin Chinese
  disabled = false,
  className = '',
}) => {
  const handleSpeak = useCallback(() => {
    if (!textToSpeak || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available or no text to speak.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.lang === lang) || voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      console.warn(`No voice found for lang ${lang}. Using default.`);
    }
    
    window.speechSynthesis.speak(utterance);
  }, [textToSpeak, lang]);

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={disabled || !textToSpeak}
      className={`p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-colors text-sm inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={`Pronounce ${label || textToSpeak}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
      </svg>
      {label ? label : (textToSpeak.length > 15 ? textToSpeak.substring(0,12) + "..." : textToSpeak)}
    </button>
  );
};

export default PronunciationButton;
