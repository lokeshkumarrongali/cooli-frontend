import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const VoiceSearch = ({ onResults, userCoords }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedIntent, setParsedIntent] = useState('');
  const [matchedJobsCount, setMatchedJobsCount] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(null); // 'understanding' | 'finding' | null
  const [error, setError] = useState(null);
  const [selectedLang, setSelectedLang] = useState('en-IN'); // Provide language toggle

  // Robustness/Performance Refs
  const isRequestingRef = useRef(false);
  const recognitionRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Browser Speech Synthesis (Voice Feedback)
  const speakResults = (message) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceSearch = useCallback(async (text) => {
    const query = text?.trim()?.toLowerCase();
    if (!query) return;

    // 1. Prevent overlapping duplicate calls
    if (isRequestingRef.current && transcript === text) return;
    
    try {
      setError(null);
      setMatchedJobsCount(null);
      setLoadingPhase('understanding');
      isRequestingRef.current = true;
      
      const [lat, lng] = userCoords || [null, null];
      
      const token = localStorage.getItem("token");
      console.log("Voice Search Token:", token ? "Present (Hidden)" : "Missing!");
      
      const response = await api.post('/ai/voice-search', 
        { text, lat, lng },
        { 
          timeout: 4000,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        }
      );
      
      if (response.data?.success) {
        const jobs = response.data.data?.jobs || [];
        const parsedData = response.data.parsedText;
        const intent = parsedData?.job_roles?.join(', ') || parsedData?.skills?.join(', ') || '';
        setParsedIntent(intent);
        setMatchedJobsCount(jobs.length);
        
        setLoadingPhase('finding');
        
        // Final Results Callback
        if (onResults) onResults(jobs);

        // Voice Feedback
        const feedbackMsg = intent 
          ? `Showing ${intent} jobs for you` 
          : (jobs.length > 0 ? "Showing some jobs matching your request" : "I couldn't find any matching jobs. Try speaking differently.");
        
        speakResults(feedbackMsg);
      }
    } catch (err) {
      
      if (err.response?.status === 401) {
        const authMsg = "Session expired. Please log in again using the text search fallback.";
        setError(authMsg);
        speakResults(authMsg);
        return;
      }
      
      console.error('AI Search Error:', err);
      const msg = err.code === 'ECONNABORTED' ? "Request timed out. Try again." : "Something went wrong. Try again.";
      setError(msg);
      speakResults(msg);
    } finally {
      setLoadingPhase(null);
      isRequestingRef.current = false;
    }
  }, [onResults, transcript]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice not supported on this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setMatchedJobsCount(null);
      setTranscript('');
      setParsedIntent('');
    };

    recognition.onresult = (event) => {
      const currentTranscript = event.results[event.results.length - 1][0].transcript;
      console.log('🎤 VOICE TRANSCRIPT CAPTURED:', currentTranscript);
      setTranscript(currentTranscript);
      
      // Debounce the API call
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      
      if (event.results[event.results.length - 1].isFinal) {
        debounceTimerRef.current = setTimeout(() => {
          handleVoiceSearch(currentTranscript);
        }, 600); // 600ms debounce buffer
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please connect one.');
      } else if (event.error === 'network') {
        setError('Network error (Requires Internet & Browser Support). Please use text search.');
      } else {
        setError(`Error recognizing speech: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition; 

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [handleVoiceSearch, selectedLang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if (!recognitionRef.current) {
          setError('Speech recognition not initialized');
          return;
        }
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  return (
    <div className="voice-search-container" style={{ margin: '20px 0', textAlign: 'center' }}>
      <button 
        onClick={toggleListening}
        disabled={loadingPhase !== null}
        className={`voice-mic-btn ${isListening ? 'is-listening' : ''}`}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isListening ? '#ff4d4f' : loadingPhase ? '#eee' : '#FC6A03',
          color: 'white',
          fontSize: '28px',
          cursor: loadingPhase ? 'not-allowed' : 'pointer',
          boxShadow: isListening ? '0 0 20px rgba(255, 77, 79, 0.8)' : '0 6px 15px rgba(252, 106, 3, 0.3)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          position: 'relative',
          animation: isListening ? 'pulse-mic 1.5s infinite steps(20, end)' : 'none'
        }}
        title={isListening ? 'Stop Listening' : 'Start Voice Search'}
      >
        {isListening ? '⏹️' : '🎤'}
        {loadingPhase && (
           <div style={{
             position: 'absolute',
             top: '-5px',
             right: '-5px',
             width: '20px',
             height: '20px',
             border: '3px solid #FC6A03',
             borderTop: '3px solid transparent',
             borderRadius: '50%',
             animation: 'spin 1s linear infinite'
           }} />
        )}
      </button>

      {/* Modern Language Selector */}
      <div style={{ marginTop: '15px' }}>
        <select 
          value={selectedLang} 
          onChange={(e) => setSelectedLang(e.target.value)}
          disabled={isListening || loadingPhase !== null}
          style={{
            padding: '8px 12px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            backgroundColor: '#fff',
            color: '#555',
            fontSize: '12px',
            fontWeight: '600',
            cursor: (isListening || loadingPhase) ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            outline: 'none'
          }}
        >
          <option value="en-IN">English (India)</option>
          <option value="hi-IN">हिन्दी (Hindi)</option>
          <option value="te-IN">తెలుగు (Telugu)</option>
        </select>
      </div>

      <style>{`
        @keyframes pulse-mic {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 77, 79, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ marginTop: '20px', minHeight: '80px' }}>
        {isListening && (
          <p style={{ color: '#FC6A03', fontWeight: '900', fontSize: '15px', margin: '5px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
             Listening...
          </p>
        )}

        {loadingPhase === 'understanding' && (
          <p style={{ color: '#888', fontWeight: '900', fontSize: '13px', margin: '5px 0', textTransform: 'uppercase' }}>
             Understanding your request...
          </p>
        )}
        
        {loadingPhase === 'finding' && (
          <p style={{ color: '#FC6A03', fontWeight: '900', fontSize: '13px', margin: '5px 0', textTransform: 'uppercase' }}>
             Finding jobs for you...
          </p>
        )}
        
        {!isListening && !loadingPhase && transcript && (
          <div style={{ padding: '15px', backgroundColor: '#fdf7f2', borderRadius: '12px', border: '1px solid #ffe8cc', maxWidth: '400px', margin: '0 auto' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888', fontWeight: '900', textTransform: 'uppercase' }}>
              You said: <span style={{ color: '#444', textTransform: 'none' }}>"{transcript}"</span>
            </p>
            {parsedIntent ? (
               <p style={{ margin: 0, fontWeight: '900', color: '#FC6A03', fontSize: '14px' }}>
                 ✨ Showing results for: {parsedIntent}
               </p>
            ) : matchedJobsCount > 0 ? (
               <p style={{ margin: 0, fontWeight: '900', color: '#FC6A03', fontSize: '14px' }}>
                 ✨ Showing matching jobs
               </p>
            ) : (
               <p style={{ margin: 0, fontSize: '12px', color: '#ff6b6b' }}>
                 No explicit intent extracted, but fallback search was used.
               </p>
            )}
            {matchedJobsCount === 0 && (
               <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ff6b6b' }}>
                 No strict matches found. Showing general recommendations.
               </p>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}>
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceSearch;
