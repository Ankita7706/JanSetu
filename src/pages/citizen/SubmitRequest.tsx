import { useState, useRef, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Upload,
  Mic,
  FileText,
  ArrowRight,
  Sparkles,
  X,
  Mail,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { requestService } from '../../services/requestService';
import { aiService } from '../../services/aiService';
import { sendRequestConfirmationEmail } from '../../services/emailService';
import type { Category, AIAnalysis, Severity, PriorityLevel, RequestLocation } from '../../types';
import LocationPickerModal from '../../components/common/LocationPickerModal';
import AudioVisualizer, { type AudioRecordingData } from '../../components/common/AudioVisualizer';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const CATEGORIES: { value: Category; label: string; icon: string; desc: string }[] = [
  { value: 'Roads', label: 'Road Damage', icon: '🛣️', desc: 'Potholes, broken roads, missing bridges' },
  { value: 'Water', label: 'Water Supply', icon: '💧', desc: 'Pipe bursts, contaminated water, dry taps' },
  { value: 'Streetlights', label: 'Streetlights', icon: '💡', desc: 'Broken lamps, dark streets, loose wiring' },
  { value: 'Drainage', label: 'Drainage', icon: '🌊', desc: 'Blocked drains, stormwater overflow, sewage' },
  { value: 'Public Transport', label: 'Public Transport', icon: '🚌', desc: 'Missing bus stops, delayed routes' },
  { value: 'Schools & Hospitals', label: 'Schools / Hospitals', icon: '🏥', desc: 'PHC facilities, school roof leakages' },
  { value: 'Electricity', label: 'Electricity', icon: '⚡', desc: 'Transformer burnout, voltage drops, cuts' },
  { value: 'Sanitation', label: 'Sanitation & Waste', icon: '🗑️', desc: 'Garbage accumulation, public toilets' },
  { value: 'Other Development', label: 'Other Development', icon: '🏛️', desc: 'Community centers, public works' },
];

const LANGUAGES = ['Odia', 'Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi'];

const SEVERITIES: { value: Severity; label: string; desc: string; icon: string }[] = [
  { value: 'critical', label: 'Critical', desc: 'Immediate danger to life or emergency health blockage', icon: '🚨' },
  { value: 'high', label: 'High Priority', desc: 'Severe civic disruption affecting entire locality', icon: '⚡' },
  { value: 'medium', label: 'Medium', desc: 'Significant daily inconvenience needing repair', icon: '🟡' },
  { value: 'low', label: 'Low', desc: 'General maintenance or enhancement suggestion', icon: '🟢' },
];

export default function SubmitRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = authService.getCurrentUser() || {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'citizen@demo.com',
    role: 'citizen',
    location: 'Bhubaneswar, Odisha',
    language: 'Odia',
  };

  const initialCat = (searchParams.get('category') as Category) || 'Roads';
  const [category, setCategory] = useState<Category>(initialCat);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user.location || 'Kalahandi, Bhawanipatna Zone 4');
  const [selectedLocation, setSelectedLocation] = useState<RequestLocation | undefined>();
  const [language, setLanguage] = useState(user.language || 'Odia');
  const [severity, setSeverity] = useState<Severity>('high');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mode toggles
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState<string>('');

  // Location modal
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Workflow state
  const [step, setStep] = useState<'form' | 'analyzing' | 'preview' | 'success'>('form');
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [createdRequestId, setCreatedRequestId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Image size must be under 8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleVoiceCompleted = (data: AudioRecordingData) => {
    setVoiceRecorded(true);
    const spoken = data?.transcript?.trim();
    if (spoken) {
      setVoiceTranscription(spoken);
      setDescription(spoken);
    } else {
      const fallbackText = `${category} issue reported in ${location}. Immediate repair and inspection required.`;
      setVoiceTranscription(fallbackText);
      if (!description) {
        setDescription(fallbackText);
      }
    }
  };

  const handleStartAnalysis = async () => {
    const textToAnalyze = description.trim() || voiceTranscription;
    if (!textToAnalyze || !selectedLocation) return;

    setStep('analyzing');
    setAnalysisProgress(15);

    const timer = setInterval(() => {
      setAnalysisProgress(p => (p >= 85 ? p : p + 20));
    }, 250);

    try {
      const result = await aiService.analyzeText(textToAnalyze, language);
      clearInterval(timer);
      setAnalysisProgress(100);
      setAiResult({
        ...result,
        category: category || result.category,
        severity: severity || result.severity,
      });
      setTimeout(() => setStep('preview'), 300);
    } catch {
      clearInterval(timer);
      setStep('form');
    }
  };

  const handleFinalSubmit = () => {
    if (!aiResult || !selectedLocation) return;
    const prio: PriorityLevel = severity === 'critical' || severity === 'high' ? 'high' : 'medium';
    const newReq = requestService.create(
      user.id,
      category,
      description.trim() || voiceTranscription,
      location,
      language,
      imagePreview || undefined,
      aiResult,
      inputMode === 'voice',
      voiceTranscription || undefined,
      prio,
      { lat: selectedLocation.latitude, lng: selectedLocation.longitude },
      selectedLocation,
    );

    setCreatedRequestId(newReq.id);
    setStep('success');

    // Automatically send confirmation email to citizen's registered email
    const recipientEmail = user.email || 'citizen@demo.com';
    sendRequestConfirmationEmail({
      recipientEmail,
      recipientName: user.name || 'Citizen',
      requestId: newReq.id,
      requestType: `${category} (${aiResult.subcategory || 'Infrastructure Grievance'})`,
      submittedAt: newReq.createdAt,
      location: location,
      trackUrl: `${window.location.origin}/citizen/requests/${newReq.id}`,
    }).catch(err => {
      console.warn('Could not dispatch confirmation email:', err);
    });
  };

  // SUCCESS VIEW
  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
        <div className="bg-brand-yellow card-brutal-xl rounded-3xl p-8 md:p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-black text-brand-yellow border-2 border-black rounded-full flex items-center justify-center mx-auto text-4xl shadow-brutal font-heading font-extrabold">
            ✓
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-extrabold uppercase tracking-widest">
              Grievance Registered
            </span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl leading-tight">
              REQUEST SUBMITTED SUCCESSFULLY!
            </h2>
            <p className="font-medium text-sm text-black/80 max-w-md mx-auto">
              Your infrastructure request has been analyzed by AI, clustered into regional demand maps, and dispatched to the concerned government division.
            </p>
          </div>

          {/* Request ID Badge */}
          <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-brutal-sm inline-block">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-black/60">Official Tracking ID</p>
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
                setStep('form');
                setDescription('');
                setAiResult(null);
                setImagePreview(null);
                setVoiceTranscription('');
                setVoiceRecorded(false);
              }}
              className="btn-brutal-secondary px-8 py-3.5 rounded-xl text-xs font-extrabold"
            >
              Submit Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ANALYZING VIEW
  if (step === 'analyzing') {
    return (
      <div className="max-w-xl mx-auto bg-white card-brutal-xl rounded-3xl p-8 md:p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-yellow border-2 border-black rounded-2xl flex items-center justify-center mx-auto shadow-brutal relative">
          <Sparkles size={36} className="text-black" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-brand-yellow rounded-full flex items-center justify-center text-xs animate-spin font-mono">
            ●
          </div>
        </div>

        <div>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl">AI ENGINE ANALYZING REQUEST</h2>
          <p className="text-xs font-bold text-black/60 mt-1">
            Multilingual NLP parsing, duplicate clustering, and explainable severity indexing...
          </p>
        </div>

        <div className="space-y-2 max-w-sm mx-auto">
          <div className="w-full bg-black/10 h-3 rounded-full border border-black/20 overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono font-bold text-black/70">
            <span>Progress: {analysisProgress}%</span>
            <span>Clustering with Demographics</span>
          </div>
        </div>
      </div>
    );
  }

  // AI PREVIEW CONFIRMATION VIEW
  if (step === 'preview' && aiResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-150">
        <div className="bg-brand-yellow card-brutal rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl">REVIEW & CONFIRM SUBMISSION</h1>
            <p className="text-xs font-bold text-black/70 mt-0.5">Verify AI auto-tagging before official queueing</p>
          </div>
          <span className="px-3 py-1 bg-black text-white rounded-lg text-xs font-extrabold uppercase">
            Confidence: {Math.round(aiResult.confidence * 100)}%
          </span>
        </div>

        <div className="bg-white card-brutal-lg rounded-2xl p-6 md:p-8 space-y-5">
          {/* AI Summary Highlight */}
          <div className="p-5 bg-brand-yellow/30 border-2 border-black rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-black" />
              <span className="font-heading font-extrabold text-xs uppercase tracking-wider">AI Grievance Synthesis</span>
            </div>
            <p className="font-medium text-sm text-black leading-relaxed">{aiResult.summary}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-gray-50 border-2 border-black rounded-xl">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Category</p>
              <div className="mt-1">
                <CategoryBadge category={category} size="md" />
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 border-2 border-black rounded-xl">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Severity Level</p>
              <div className="mt-1">
                <PriorityBadge priority={severity} size="md" />
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 border-2 border-black rounded-xl">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Dialect / Language</p>
              <p className="font-heading font-extrabold text-sm mt-1">{language}</p>
            </div>

            <div className="p-3.5 bg-gray-50 border-2 border-black rounded-xl">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Similar Demands</p>
              <p className="font-heading font-extrabold text-sm text-black mt-1">
                +{aiResult.duplicateClusterCount || 34} in Ward
              </p>
            </div>
          </div>

          {/* Description & Location */}
          <div className="space-y-3 pt-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-black/60 mb-1">Issue Description</p>
              <p className="p-3 bg-gray-50 border-2 border-black/20 rounded-xl text-xs font-medium">
                {description || voiceTranscription}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-black/70">
              <MapPin size={14} className="text-red-500" />
              <span>Location: {selectedLocation?.address || location}</span>
            </div>
            {selectedLocation && (
              <p className="pl-5 text-[10px] font-mono font-bold text-black/50">
                Latitude: {selectedLocation.latitude.toFixed(6)} | Longitude: {selectedLocation.longitude.toFixed(6)}
              </p>
            )}

            {imagePreview && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black/60 mb-1.5">Attached Photo Evidence</p>
                <img
                  src={imagePreview}
                  alt="Evidence"
                  className="w-full max-h-56 object-cover border-2 border-black rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-black/10">
            <button
              onClick={() => setStep('form')}
              className="btn-brutal-secondary flex-1 py-3.5 rounded-xl text-xs font-extrabold"
            >
              &larr; Edit Details
            </button>
            <button
              onClick={handleFinalSubmit}
              className="btn-brutal-primary flex-1 py-3.5 rounded-xl text-xs font-extrabold"
            >
              Confirm & Submit Grievance &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN SUBMISSION FORM
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl">SUBMIT INFRASTRUCTURE REQUEST</h1>
          <p className="font-medium text-sm text-black/75 mt-1">
            Report civic defects with text, photos, GPS coordinates, or native voice input.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all flex items-center gap-1.5 ${
              inputMode === 'text' ? 'bg-black text-white border-black shadow-brutal-sm' : 'bg-white text-black'
            }`}
          >
            <FileText size={14} />
            Text Form
          </button>
          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold border-2 transition-all flex items-center gap-1.5 ${
              inputMode === 'voice' ? 'bg-black text-white border-black shadow-brutal-sm' : 'bg-white text-black'
            }`}
          >
            <Mic size={14} />
            Voice Studio
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-white card-brutal-lg rounded-3xl p-6 md:p-8 space-y-7">
        {/* Step 1: Category Selector */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest mb-3">
            1. Select Infrastructure Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(cat => {
              const isSelected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-yellow border-black shadow-brutal-sm translate-x-0.5 translate-y-0.5'
                      : 'bg-white border-black/30 hover:border-black'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-black" />}
                  </div>
                  <div>
                    <p className="font-heading font-extrabold text-sm text-black leading-tight">{cat.label}</p>
                    <p className="text-[10px] font-bold text-black/60 mt-0.5 line-clamp-1">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Input Mode (Voice or Text) */}
        {inputMode === 'voice' ? (
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">
              2. Voice Grievance Recording ({language}) *
            </label>
            <AudioVisualizer
              selectedLanguage={language}
              onRecordingComplete={handleVoiceCompleted}
              onCancel={() => {
                setVoiceRecorded(false);
                setVoiceTranscription('');
              }}
            />
            {voiceRecorded && (
              <div className="mt-3 p-4 bg-gray-50 border-2 border-black rounded-xl space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-black/60">
                  AI Live Transcription Preview
                </p>
                <textarea
                  value={description || voiceTranscription}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-black/20 rounded-lg p-2.5 text-xs font-medium focus:outline-none"
                  placeholder="Review or edit transcribed voice text..."
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-extrabold uppercase tracking-widest">
                2. Describe the Issue in Detail *
              </label>
              <span className="text-[11px] font-bold text-black/50">{description.length} / 2000 characters</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide specific details about the infrastructure issue. E.g., 'The main arterial culvert connecting Bhawanipatna to District Hospital has collapsed. Water stagnation blocks ambulance access...'"
              rows={5}
              maxLength={2000}
              className="w-full border-2 border-black rounded-2xl p-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black bg-gray-50/50"
            />
          </div>
        )}

        {/* Step 3: Location Selection & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Location Picker */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">
              3. Select Problem Location *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={location}
                readOnly
                placeholder="Choose the exact issue location on the map"
                className="flex-1 border-2 border-black rounded-xl px-4 py-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="btn-brutal-secondary px-3.5 py-3 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0"
                title="Select on Map"
              >
                <MapPin size={15} />
                <span>{selectedLocation ? 'Change Pin' : 'Map Pin'}</span>
              </button>
            </div>
            {selectedLocation ? (
              <div className="mt-2 rounded-lg border border-black/20 bg-gray-50 p-2.5 text-[10px]">
                <p className="font-bold text-black">Selected: {selectedLocation.address}</p>
                <p className="mt-1 font-mono font-bold text-black/50">
                  Latitude: {selectedLocation.latitude.toFixed(6)} | Longitude: {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-[10px] font-bold text-black/50">Place a map pin to attach the exact problem location.</p>
            )}
          </div>

          {/* Submission Dialect */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">
              Submission Language / Dialect
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border-2 border-black rounded-xl px-4 py-3 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang} (AI NLP Enabled)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 4: Urgency / Severity Level */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">
            4. Estimated Urgency / Severity Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SEVERITIES.map(sev => {
              const isSelected = severity === sev.value;
              return (
                <button
                  key={sev.value}
                  type="button"
                  onClick={() => setSeverity(sev.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-brutal-sm'
                      : 'bg-white text-black border-black/30 hover:border-black'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-heading font-extrabold text-xs uppercase">
                    <span>{sev.icon}</span>
                    <span>{sev.label}</span>
                  </div>
                  <p className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-brand-sage' : 'text-black/60'}`}>
                    {sev.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 5: Photo Upload (Drag & Drop) */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-widest mb-2">
            5. Supporting Photographic Evidence (Optional)
          </label>
          <input
            type="file"
            ref={fileRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative border-2 border-black rounded-2xl overflow-hidden shadow-brutal-sm">
              <img src={imagePreview} alt="Evidence" className="w-full h-56 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  if (fileRef.current) fileRef.current.value = '';
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-black text-white border-2 border-black rounded-xl font-extrabold text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <X size={14} />
                Remove Photo
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-black/40 rounded-2xl p-8 text-center hover:bg-brand-yellow/20 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-brand-yellow border-2 border-black rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Upload size={20} className="text-black" />
              </div>
              <p className="font-heading font-extrabold text-sm text-black">Drag & drop photo or click to upload</p>
              <p className="text-[11px] font-bold text-black/50 mt-0.5">JPG, PNG, WEBP (Max 8 MB) — Geotags preserved</p>
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <div className="pt-4 border-t-2 border-black/10">
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={(!description.trim() && !voiceRecorded) || !selectedLocation}
            className="btn-brutal-primary w-full py-4 rounded-2xl text-sm font-extrabold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            <span>Process with Multilingual AI &rarr;</span>
          </button>
          {!description.trim() && !voiceRecorded && (
            <p className="text-center text-xs font-bold text-black/50 mt-2">
              * Please enter a description or complete a voice recording to proceed.
            </p>
          )}
          {!selectedLocation && (
            <p className="mt-2 text-center text-xs font-bold text-black/50">* Please select the problem location on the map.</p>
          )}
        </div>
      </div>

      {/* Location Modal */}
      {locationModalOpen && <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        initialLocation={location}
        initialCoordinates={selectedLocation}
        onSelectLocation={selected => {
          setSelectedLocation(selected);
          setLocation(selected.address);
        }}
      />}
    </div>
  );
}
