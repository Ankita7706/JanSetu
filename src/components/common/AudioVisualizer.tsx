import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, AlertCircle, Edit3 } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface AudioRecordingData {
  duration: number;
  transcript: string;
  audioBlob?: Blob;
  audioUrl?: string;
}

interface AudioVisualizerProps {
  onRecordingComplete: (data: AudioRecordingData) => void;
  onCancel?: () => void;
  selectedLanguage?: string;
  languageCode?: string;
}

const LANGUAGE_CODE_MAP: Record<string, string> = {
  odia: 'or-IN',
  hindi: 'hi-IN',
  bengali: 'bn-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  marathi: 'mr-IN',
  english: 'en-IN',
};

function getLangCode(langNameOrKey?: string): string {
  if (!langNameOrKey) return 'en-IN';
  const lower = langNameOrKey.toLowerCase();
  for (const [k, v] of Object.entries(LANGUAGE_CODE_MAP)) {
    if (lower.includes(k)) return v;
  }
  return 'en-IN';
}

export default function AudioVisualizer({
  onRecordingComplete,
  onCancel,
  selectedLanguage = 'Odia',
  languageCode,
}: AudioVisualizerProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [duration, setDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(16).fill(15));
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  // References
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordedDurationRef = useRef(0);
  const fullTranscriptRef = useRef('');

  const targetLangCode = languageCode || getLangCode(selectedLanguage);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
  };

  const updateVisualizer = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const step = Math.floor(dataArray.length / 16);
    const newLevels = Array.from({ length: 16 }, (_, i) => {
      const val = dataArray[i * step] || 0;
      // Map 0-255 to 10px-60px height
      return Math.max(10, Math.min(60, (val / 255) * 60 + 10));
    });

    setAudioLevels(newLevels);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setTranscript('');
    setInterimTranscript('');
    fullTranscriptRef.current = '';
    audioChunksRef.current = [];
    setDuration(0);
    recordedDurationRef.current = 0;

    // 1. Initialize Microphone Access & MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // AudioContext for live frequency visualizer
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioCtxRef.current = audioCtx;
          analyserRef.current = analyser;
          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        }
      } catch (err) {
        console.warn('AudioContext visualizer not available:', err);
      }

      // MediaRecorder for capturing real audio
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported('audio/webm') && MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start(250);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMsg(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser settings to record voice.'
          : 'Could not access microphone on this device. You can type your grievance below.'
      );
      setState('idle');
      return;
    }

    // 2. Initialize Real-Time Web Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = targetLangCode;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let currentFinal = '';
          let currentInterim = '';

          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              currentFinal += res[0].transcript + ' ';
            } else {
              currentInterim += res[0].transcript;
            }
          }

          const combined = (currentFinal + currentInterim).trim();
          if (combined) {
            fullTranscriptRef.current = combined;
            setTranscript(currentFinal.trim());
            setInterimTranscript(currentInterim.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          // If the specific dialect is not recognized or timed out, do not stop audio recording
        };

        recognition.onend = () => {
          // If still recording, attempt to restart recognition if stopped prematurely
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition initialization error:', err);
      }
    }

    setState('recording');

    // 3. Duration Timer
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        const next = prev + 1;
        recordedDurationRef.current = next;
        if (next >= 45) {
          stopRecording();
          return next;
        }
        return next;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    const finalDuration = Math.max(recordedDurationRef.current, 1);
    const finalTranscript = fullTranscriptRef.current || transcript || interimTranscript;

    setState('recorded');
    setTranscript(finalTranscript);
    setInterimTranscript('');

    // Deliver complete recorded audio data to parent
    setTimeout(() => {
      onRecordingComplete({
        duration: finalDuration,
        transcript: finalTranscript,
        audioBlob: audioBlobRef.current || undefined,
        audioUrl: audioUrl || undefined,
      });
    }, 300);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (state === 'playing') {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setState('recorded');
    } else {
      if (!audioElementRef.current) {
        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;

        audio.ontimeupdate = () => {
          setPlaybackTime(Math.round(audio.currentTime));
        };

        audio.onended = () => {
          setState('recorded');
          setPlaybackTime(0);
        };
      }

      audioElementRef.current.play().then(() => {
        setState('playing');
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const resetRecording = () => {
    cleanupAudio();
    setState('idle');
    setDuration(0);
    setPlaybackTime(0);
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setErrorMsg(null);
    setIsEditingTranscript(false);
    if (onCancel) onCancel();
  };

  const handleTranscriptChange = (newText: string) => {
    setTranscript(newText);
    fullTranscriptRef.current = newText;
    onRecordingComplete({
      duration: Math.max(recordedDurationRef.current, 1),
      transcript: newText,
      audioBlob: audioBlobRef.current || undefined,
      audioUrl: audioUrl || undefined,
    });
  };

  return (
    <div className="bg-white card-brutal rounded-2xl p-5 md:p-6 text-center space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-yellow border-2 border-black rounded-lg flex items-center justify-center font-extrabold text-xs shadow-brutal-sm">
            🎤
          </div>
          <span className="font-heading font-extrabold text-sm uppercase">Live Multilingual Voice Recorder</span>
        </div>
        <span className="px-2.5 py-0.5 bg-black text-brand-yellow border-2 border-black rounded-md text-[10px] font-extrabold">
          Language: {selectedLanguage} ({targetLangCode})
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-left flex items-start gap-2 text-xs text-red-800">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Main Recording Center */}
      <div className="py-2">
        {state === 'idle' && (
          <div className="space-y-4">
            <div
              className="w-20 h-20 bg-brand-yellow border-2 border-black rounded-full flex items-center justify-center mx-auto shadow-brutal hover:scale-105 transition-transform cursor-pointer"
              onClick={startRecording}
            >
              <Mic size={36} className="text-black" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-lg">Click to Record Voice Grievance</p>
              <p className="text-xs font-bold text-black/60 mt-0.5">
                Speak directly into your microphone in {selectedLanguage}. Real audio & speech-to-text will capture your issue.
              </p>
            </div>
            <button
              onClick={startRecording}
              className="btn-brutal-primary px-7 py-3 rounded-xl text-xs font-extrabold inline-flex items-center gap-2"
            >
              <Mic size={15} />
              Start Recording &rarr;
            </button>
          </div>
        )}

        {state === 'recording' && (
          <div className="space-y-4">
            {/* Live Frequency Waveform Animation */}
            <div className="flex items-center justify-center gap-1.5 h-20 px-4 bg-brand-yellow/30 border-2 border-black rounded-xl">
              {audioLevels.map((h, i) => (
                <div
                  key={i}
                  className="w-2 bg-black rounded-full transition-all duration-75"
                  style={{
                    height: `${h}px`,
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
              <span className="font-mono font-extrabold text-2xl text-red-600 tracking-wider">
                00:{duration < 10 ? `0${duration}` : duration} / 00:45
              </span>
            </div>

            {/* Real-time speech transcription stream */}
            <div className="p-3.5 bg-black text-white border-2 border-black rounded-xl text-left space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-brand-yellow">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Speech Recognition ({selectedLanguage})
              </div>
              <p className="text-xs font-medium min-h-[28px] text-white/90 italic">
                {transcript || interimTranscript ? (
                  <span>
                    {transcript} <span className="text-brand-yellow font-semibold">{interimTranscript}</span>
                  </span>
                ) : (
                  <span className="text-white/50">Listening... Speak about your problem now.</span>
                )}
              </p>
            </div>

            <button
              onClick={stopRecording}
              className="btn-brutal-primary bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 shadow-brutal"
            >
              <Square size={14} />
              Stop Recording
            </button>
          </div>
        )}

        {(state === 'recorded' || state === 'playing') && (
          <div className="space-y-4">
            {/* Recorded Waveform State */}
            <div className="p-3.5 bg-gray-50 border-2 border-black rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Volume2 size={15} />
                  <span>
                    Voice Audio Captured:{' '}
                    <span className="font-mono">
                      00:{playbackTime < 10 ? `0${playbackTime}` : playbackTime} / 00:
                      {duration < 10 ? `0${duration}` : duration}
                    </span>
                  </span>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-500 px-2 py-0.5 rounded">
                  ✓ Audio Recorded
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/10 h-2.5 rounded-full border border-black/20 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-200"
                  style={{
                    width: `${duration > 0 ? (playbackTime / duration) * 100 : 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Captured Transcript Preview with In-place Edit option */}
            <div className="p-3.5 bg-white border-2 border-black rounded-xl text-left space-y-2 shadow-brutal-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-black/70 flex items-center gap-1">
                  Transcribed Voice Text
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-[11px] font-bold text-black hover:underline inline-flex items-center gap-1"
                >
                  <Edit3 size={12} />
                  {isEditingTranscript ? 'Done Editing' : 'Edit Text'}
                </button>
              </div>

              {isEditingTranscript ? (
                <textarea
                  value={transcript}
                  onChange={e => handleTranscriptChange(e.target.value)}
                  rows={2}
                  className="w-full bg-yellow-50/50 border border-black rounded-lg p-2 text-xs font-medium focus:outline-none"
                  placeholder="Type or correct what was spoken..."
                />
              ) : (
                <p className="text-xs font-semibold text-black bg-gray-50 p-2.5 rounded-lg border border-black/10 min-h-[38px]">
                  {transcript || (
                    <span className="text-black/40 italic">
                      Voice recorded. (No words recognized automatically &mdash; click 'Edit Text' to add details if desired).
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={togglePlayback}
                disabled={!audioUrl}
                className="btn-brutal-secondary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {state === 'playing' ? <Pause size={14} /> : <Play size={14} />}
                {state === 'playing' ? 'Pause Audio' : 'Listen Recording'}
              </button>
              <button
                type="button"
                onClick={resetRecording}
                className="btn-brutal-secondary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-red-700 hover:bg-red-50"
              >
                <RotateCcw size={14} />
                Re-record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
