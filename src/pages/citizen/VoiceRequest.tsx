import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Globe, ArrowRight, Volume2, CheckCircle, RotateCcw, Mail, Edit3 } from 'lucide-react';
import { authService } from '../../services/authService';
import { requestService } from '../../services/requestService';
import { aiService } from '../../services/aiService';
import { sendRequestConfirmationEmail } from '../../services/emailService';
import type { AIAnalysis } from '../../types';
import AudioVisualizer, { type AudioRecordingData } from '../../components/common/AudioVisualizer';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const LANGUAGES = [
  { key: 'odia', code: 'or-IN', label: 'ଓଡ଼ିଆ (Odia)', sample: 'ଆମ ଗାଁକୁ ଭଲ ରାସ୍ତା ନାହିଁ ଏବଂ ପିଇବା ପାଣି ପାଇପ୍ ଭାଙ୍ଗିଯାଇଛି।' },
  { key: 'hindi', code: 'hi-IN', label: 'हिन्दी (Hindi)', sample: 'हमारे गांव में पीने का साफ पानी नहीं है और स्ट्रीटलाइट खराब हैं।' },
  { key: 'bengali', code: 'bn-IN', label: 'বাংলা (Bengali)', sample: 'আমাদের গ্রামে ড্রেনেজ বন্ধ থাকায় রাস্তায় জল জমে যাচ্ছে।' },
  { key: 'tamil', code: 'ta-IN', label: 'தமிழ் (Tamil)', sample: 'எங்கள் பகுதியில் சாலைகள் பழுதடைந்துள்ளன, குடிநீர் தட்டுப்பாடு உள்ளது.' },
  { key: 'telugu', code: 'te-IN', label: 'తెలుగు (Telugu)', sample: 'మా గ్రామంలో రోడ్డు సరిగా లేదు మరియు విద్యుత్ కోతలు ఎక్కువగా ఉన్నాయి.' },
  { key: 'marathi', code: 'mr-IN', label: 'मराठी (Marathi)', sample: 'आमच्या गावात पिण्याचे पाणी येत नाही आणि रस्ते खराब आहेत.' },
  { key: 'english', code: 'en-IN', label: 'English', sample: 'The main connecting road has severe craters and ambulances cannot reach.' },
];

export default function VoiceRequest() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'citizen@demo.com',
    role: 'citizen',
    location: 'Bhubaneswar, Odisha',
    language: 'Odia',
  };

  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [step, setStep] = useState<'record' | 'analyzing' | 'result' | 'success'>('record');
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [createdRequestId, setCreatedRequestId] = useState('');
  const [isEditingOriginal, setIsEditingOriginal] = useState(false);

  const handleRecordingFinished = async (audioData: AudioRecordingData) => {
    setStep('analyzing');
    try {
      const res = await aiService.analyzeVoice(selectedLang.key, audioData.transcript);
      setTranscription(res.transcription);
      setTranslation(res.translation);
      setAiResult(res.analysis);
      setStep('result');
    } catch (err) {
      console.error('Voice analysis error:', err);
      setStep('record');
    }
  };

  const handleConfirmSubmit = () => {
    if (!aiResult) return;
    const req = requestService.create(
      user.id,
      aiResult.category,
      translation || transcription,
      user.location,
      selectedLang.label.split(' ')[0],
      undefined,
      aiResult,
      true,
      transcription,
      'high'
    );
    setCreatedRequestId(req.id);
    setStep('success');

    // Automatically send confirmation email to citizen's registered email
    const recipientEmail = user.email || 'citizen@demo.com';
    sendRequestConfirmationEmail({
      recipientEmail,
      recipientName: user.name || 'Citizen',
      requestId: req.id,
      requestType: `${aiResult.category} (${aiResult.subcategory || 'Voice Grievance'})`,
      submittedAt: req.createdAt,
      location: user.location,
      trackUrl: `${window.location.origin}/citizen/requests/${req.id}`,
    }).catch(err => {
      console.warn('Could not dispatch voice confirmation email:', err);
    });
  };

  const handleTranscriptionEdit = async (newText: string) => {
    setTranscription(newText);
    try {
      const res = await aiService.analyzeVoice(selectedLang.key, newText);
      setTranslation(res.translation);
      setAiResult(res.analysis);
    } catch {}
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-150">
        <div className="bg-brand-yellow card-brutal-xl rounded-3xl p-8 md:p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-black text-brand-yellow border-2 border-black rounded-full flex items-center justify-center mx-auto text-4xl shadow-brutal font-heading font-extrabold">
            ✓
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-extrabold uppercase tracking-widest">
              Voice Grievance Processed
            </span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl leading-tight">
              VOICE REQUEST SUBMITTED!
            </h2>
            <p className="font-medium text-sm text-black/80 max-w-md mx-auto">
              Your regional dialect voice recording was transcribed, translated to English, analyzed with explainable AI, and queued in the government priority registry.
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-brutal-sm inline-block">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-black/60">Voice Tracking ID</p>
            <p className="font-mono font-extrabold text-2xl text-black mt-0.5">{createdRequestId}</p>
          </div>

          {/* Confirmation Email Notice Banner */}
          <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-brutal-sm flex items-center justify-center gap-2.5 max-w-md mx-auto text-left">
            <div className="w-8 h-8 bg-emerald-100 border border-emerald-600 rounded-xl flex items-center justify-center shrink-0 text-emerald-800 font-bold">
              <Mail size={16} />
            </div>
            <div className="text-xs">
              <p className="font-extrabold text-black">Confirmation Email Sent</p>
              <p className="text-black/70 font-medium text-[11px]">
                Tracking details and acknowledgment dispatched to <strong>{user.email || 'registered email'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(`/citizen/requests/${createdRequestId}`)}
              className="btn-brutal-primary px-8 py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <span>Track Live Status</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                setStep('record');
                setAiResult(null);
                setTranscription('');
                setTranslation('');
              }}
              className="btn-brutal-secondary px-8 py-3.5 rounded-xl text-xs font-extrabold"
            >
              Record Another Voice
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="max-w-xl mx-auto bg-white card-brutal-xl rounded-3xl p-8 md:p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-yellow border-2 border-black rounded-2xl flex items-center justify-center mx-auto shadow-brutal relative">
          <Mic size={36} className="text-black" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-brand-yellow rounded-full flex items-center justify-center text-xs animate-spin font-mono">
            ●
          </div>
        </div>

        <div>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl">TRANSCRIBING AUDIO</h2>
          <p className="text-xs font-bold text-black/60 mt-1">
            Analyzing speech in {selectedLang.label} &amp; applying NLP auto-classification...
          </p>
        </div>

        <div className="p-4 bg-brand-yellow/30 border-2 border-black rounded-xl text-xs font-mono font-bold text-black">
          ● Acoustic Feature Extraction &bull; Dialect Normalization &bull; NLP Auto-Classification
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full shadow-brutal-sm text-xs font-extrabold uppercase tracking-wider mb-2">
          <Globe size={13} />
          Multilingual Accessibility Engine
        </div>
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl">VOICE INPUT STUDIO</h1>
        <p className="font-medium text-sm text-black/75 mt-1">
          Speak in your mother tongue. AI automatically transcribes, translates, and structures your grievance for policy makers.
        </p>
      </div>

      {step === 'record' && (
        <div className="space-y-6">
          {/* Dialect Selector */}
          <div className="bg-white card-brutal rounded-2xl p-6 space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-widest">
              1. Choose Your Preferred Dialect
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {LANGUAGES.map(lang => {
                const isSelected = selectedLang.key === lang.key;
                return (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => setSelectedLang(lang)}
                    className={`p-3 rounded-xl border-2 text-left font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-brutal-sm'
                        : 'bg-white text-black border-black/30 hover:border-black'
                    }`}
                  >
                    <p className="font-heading font-extrabold text-sm">{lang.label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-brand-yellow' : 'text-black/50'}`}>
                      {lang.sample}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Recorder Module */}
          <AudioVisualizer
            selectedLanguage={selectedLang.label}
            languageCode={selectedLang.code}
            onRecordingComplete={handleRecordingFinished}
          />
        </div>
      )}

      {step === 'result' && aiResult && (
        <div className="bg-white card-brutal-lg rounded-3xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-heading font-extrabold text-xl">VOICE SYNTHESIS RESULT</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-black text-brand-yellow px-2.5 py-1 rounded-lg">
              Accuracy: {Math.round(aiResult.confidence * 100)}%
            </span>
          </div>

          {/* Transcribed Speech */}
          <div className="space-y-3">
            <div className="p-4 bg-brand-yellow/30 border-2 border-black rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-black/70">
                  <Volume2 size={14} />
                  Original Audio Transcription ({selectedLang.label})
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingOriginal(!isEditingOriginal)}
                  className="text-[11px] font-bold text-black underline flex items-center gap-1"
                >
                  <Edit3 size={12} />
                  {isEditingOriginal ? 'Done Editing' : 'Edit'}
                </button>
              </div>

              {isEditingOriginal ? (
                <textarea
                  value={transcription}
                  onChange={e => handleTranscriptionEdit(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-black rounded-lg p-2 text-xs font-medium focus:outline-none"
                  placeholder="Edit your speech text..."
                />
              ) : (
                <p className="font-heading font-extrabold text-base text-black">{transcription}</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-2 border-black rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-black/70 mb-1">
                <Globe size={14} />
                Standardized English Translation
              </div>
              <p className="font-medium text-sm text-black">{translation}</p>
            </div>
          </div>

          {/* Metadata Auto Tags */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-brand-sage/40 border-2 border-black rounded-xl">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Detected Category</p>
              <div className="mt-1">
                <CategoryBadge category={aiResult.category} size="md" />
              </div>
            </div>
            <div className="p-3.5 bg-brand-sage/40 border-2 border-black rounded-xl">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Severity Rating</p>
              <div className="mt-1">
                <PriorityBadge priority={aiResult.severity} size="md" />
              </div>
            </div>
            <div className="p-3.5 bg-brand-sage/40 border-2 border-black rounded-xl">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Ward Duplicate Cluster</p>
              <p className="font-heading font-extrabold text-sm text-black mt-1">
                +{aiResult.duplicateClusterCount || 28} Similar Voice Logs
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-3 pt-4 border-t-2 border-black/10">
            <button
              onClick={() => setStep('record')}
              className="btn-brutal-secondary flex-1 py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              Re-record Voice
            </button>
            <button
              onClick={handleConfirmSubmit}
              className="btn-brutal-primary flex-1 py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} />
              Confirm & Submit Voice Request &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
