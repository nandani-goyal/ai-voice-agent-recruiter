import { useState, useCallback, useRef } from "react";

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const speak = useCallback((text, onEndCallback) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a natural sounding English female voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en") && v.name.toLowerCase().includes("female")) 
                        || voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"))
                        || voices[0];
                        
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) {
        onEndCallback();
      }
    };

    utterance.onerror = (e) => {
      // 'interrupted' fires when cancel() is called deliberately — not a real error
      if (e.error === "interrupted") {
        setIsSpeaking(false);
        return;
      }
      console.error("[SpeechSynthesis] Error:", e);
      setIsSpeaking(false);
      if (onEndCallback) {
        onEndCallback();
      }
    };

    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    speak,
    stopSpeaking
  };
}
