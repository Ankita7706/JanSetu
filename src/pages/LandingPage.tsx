import { useNavigate } from 'react-router-dom';
import HeroCitizenPortal from '../components/HeroCitizenPortal';
import CitizenFaqAssistant from '../components/assistant/CitizenFaqAssistant';
import { authService } from '../services/authService';
export default function LandingPage() {
  const navigate = useNavigate();
  const faqLanguage = authService.getCurrentUser()?.language || 'English';

  return (
    <div className="min-h-screen bg-brand-charcoal text-black font-body">

      {/* NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-brand-yellow border-b-2 border-black z-50 flex items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black">
            <svg className="w-6 h-6 fill-brand-yellow" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight leading-none">JANSETU</span>
            <span className="font-body text-xs font-bold tracking-wider text-black">BRICS PLATFORM</span>
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 font-bold text-sm">
          <a href="#pipeline" className="hover:underline decoration-2">AI Pipeline</a>
          <a href="#features" className="hover:underline decoration-2">Platform Capabilities</a>
          <a href="#personas" className="hover:underline decoration-2">Stakeholders</a>
          <button 
            onClick={() => navigate('/contact')} 
            className="hover:underline decoration-2 bg-transparent border-none cursor-pointer font-bold text-sm p-0 text-black"
          >
            Contact
          </button>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="btn-brutal-primary px-5 py-2.5 font-bold text-sm rounded-xl"
          >
            Access Dashboard &rarr;
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 bg-brand-yellow border-b-2 border-black px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-black rounded-full shadow-brutal-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-xs uppercase tracking-wider">Multilingual Public Governance</span>
            </div>

            <h1 className="font-heading font-extrabold text-5xl md:text-7xl leading-none tracking-tighter">
              CITIZEN VOICE TO <span className="text-stroke-black">EVIDENCE-BASED</span> INFRASTRUCTURE.
            </h1>

            <p className="font-medium text-lg text-black max-w-xl">
              Multilingual AI platform aggregating citizen requests across voice, text, and photo inputs. Fusing demographic data with infrastructure indices for targeted BRICS policy prioritization.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => navigate('/citizen/submit')}
                className="btn-brutal-primary px-8 py-4 font-extrabold text-base rounded-xl"
              >
                Submit Local Request
              </button>
              <button 
                onClick={() => navigate('/government/hotspots')}
                className="btn-brutal-secondary px-8 py-4 font-bold text-base rounded-xl"
              >
                Explore Demand Hotspots
              </button>
            </div>

            {/* Quick Stats */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t-2 border-black">
              <div>
                <div className="font-heading font-extrabold text-2xl">Odia / Hindi +</div>
                <div className="text-xs font-bold text-gray-800">Multilingual Voice</div>
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl">Clustered</div>
                <div className="text-xs font-bold text-gray-800">AI Duplicate Detection</div>
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl">Explainable</div>
                <div className="text-xs font-bold text-gray-800">Prioritization Engine</div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Browser Dashboard */}
          <div className="relative">
            <HeroCitizenPortal />
          </div>

        </div>
      </section>

      {/* SOCIAL PROOF / BRICS MARQUEE */}
      <section className="bg-brand-charcoal border-b-2 border-black py-4 overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 font-heading text-2xl font-extrabold text-brand-sage opacity-75 whitespace-nowrap">
          <span>BRICS PUBLIC SECTOR STAKEHOLDERS</span> &bull;
          <span>INFRASTRUCTURE PLANNERS</span> &bull;
          <span>CITIZEN ADVOCACY GROUPS</span> &bull;
          <span>POLICY ANALYSTS</span> &bull;
          <span>GOVERNMENT DEPARTMENTS</span> &bull;
          <span>BRICS PUBLIC SECTOR STAKEHOLDERS</span> &bull;
          <span>INFRASTRUCTURE PLANNERS</span> &bull;
          <span>CITIZEN ADVOCACY GROUPS</span> &bull;
        </div>
      </section>

      {/* PROBLEM VS SOLUTION SECTION */}
      <section className="py-20 bg-white border-b-2 border-black px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl">THE INFRASTRUCTURE GAP</h2>
            <p className="font-medium text-gray-700">Bridging fragmented feedback and delayed capital allocation through transparent digital governance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problem Card */}
            <div className="p-8 bg-zinc-100 border-2 border-dashed border-gray-400 rounded-3xl opacity-80 space-y-6">
              <div className="inline-block px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full border border-red-300">
                Traditional Challenges
              </div>
              <h3 className="font-heading font-extrabold text-2xl">Fragmented Citizen Feedback</h3>
              <ul className="space-y-4 font-medium text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold text-xs mt-0.5">&times;</span>
                  Thousands of isolated complaints across unorganized municipal channels.
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold text-xs mt-0.5">&times;</span>
                  Language barriers exclude rural voice & regional dialect requests.
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold text-xs mt-0.5">&times;</span>
                  Budget decisions made without real-time demographic context or density verification.
                </li>
              </ul>
            </div>

            {/* Solution Card */}
            <div className="p-8 bg-brand-yellow card-brutal-lg rounded-3xl space-y-6">
              <div className="inline-block px-3 py-1 bg-black text-white font-bold text-xs rounded-full">
                JanSetu Solution
              </div>
              <h3 className="font-heading font-extrabold text-2xl">Unified Data Fusion Engine</h3>
              <ul className="space-y-4 font-bold text-sm text-black">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs mt-0.5">&check;</span>
                  AI duplicate clustering merges hundreds of similar complaints into single hotspot cards.
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs mt-0.5">&check;</span>
                  Multilingual NLP processes voice, Odia, Hindi, Tamil, Bengali, and regional media.
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs mt-0.5">&check;</span>
                  Explainable priority engine combines request urgency with public investment data.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="py-20 bg-brand-yellow border-b-2 border-black px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-bold text-xs uppercase tracking-widest text-black">System Capabilities</span>
              <h2 className="font-heading font-extrabold text-4xl md:text-5xl mt-2">PLATFORM MODULES</h2>
            </div>
            <p className="font-medium text-black max-w-md">Engineered for end-to-end processing from citizen input to actionable municipal workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 bg-white card-brutal rounded-2xl space-y-4 group">
              <div className="w-12 h-12 bg-brand-sage border-2 border-black flex items-center justify-center font-bold transition-colors group-hover:bg-brand-yellow">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"></path></svg>
              </div>
              <h3 className="font-heading font-extrabold text-2xl">Multilingual Voice & Text</h3>
              <p className="text-sm font-medium text-gray-700">Native language processing pipelines that extract context, location, and severity from audio recordings or typed submissions.</p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-white card-brutal rounded-2xl space-y-4 group">
              <div className="w-12 h-12 bg-brand-sage border-2 border-black flex items-center justify-center font-bold transition-colors group-hover:bg-brand-yellow">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              </div>
              <h3 className="font-heading font-extrabold text-2xl">Hotspot Geofencing</h3>
              <p className="text-sm font-medium text-gray-700">Spatial analysis clustering citizen entries against district maps to auto-identify high-demand infrastructure zones.</p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-white card-brutal rounded-2xl space-y-4 group">
              <div className="w-12 h-12 bg-brand-sage border-2 border-black flex items-center justify-center font-bold transition-colors group-hover:bg-brand-yellow">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h3 className="font-heading font-extrabold text-2xl">Explainable Priorities</h3>
              <p className="text-sm font-medium text-gray-700">Configurable priority scoring factoring in affected population size, service severity, and feasibility data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (DARK MODE FLOW) */}
      <section id="pipeline" className="py-20 bg-brand-charcoal text-white border-b-2 border-black px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-bold text-xs uppercase tracking-widest text-brand-yellow">System Workflow</span>
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl">END-TO-END DATA FLOW</h2>
          </div>

          {/* Steps Horizontal Flow */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-brand-charcoal border-4 border-brand-sage flex items-center justify-center font-heading font-extrabold text-3xl text-brand-sage shadow-brutal-white">
                01
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-brand-yellow">Citizen Input</h3>
              <p className="text-sm text-gray-300 max-w-xs">Voice transcriptions, photos, or text inputs submitted in regional languages via citizen portal.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-brand-charcoal border-4 border-brand-yellow flex items-center justify-center font-heading font-extrabold text-3xl text-brand-yellow shadow-brutal-white">
                02
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-brand-yellow">AI Data Fusion</h3>
              <p className="text-sm text-gray-300 max-w-xs">NLP classification, similarity grouping, and demographic layer integration.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-brand-charcoal border-4 border-white flex items-center justify-center font-heading font-extrabold text-3xl text-white shadow-brutal-white">
                03
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-brand-yellow">Policy Action</h3>
              <p className="text-sm text-gray-300 max-w-xs">Policymakers review transparent priority scores and convert hotspot recommendations into official projects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASE PERSONAS (BENTO GRID) */}
      <section id="personas" className="py-20 bg-white border-b-2 border-black px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl">DESIGNED FOR ALL STAKEHOLDERS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Citizen (Sage) */}
            <div className="p-8 bg-brand-sage card-brutal rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-white font-bold text-xs rounded-full border border-black inline-block">Citizens</span>
                <h3 className="font-heading font-extrabold text-2xl">Simple Participation</h3>
                <p className="text-sm font-medium">Submit infrastructure defects in native dialect. Track issue resolution status from received to completed.</p>
              </div>
              <div className="pt-6 font-mono text-xs font-bold border-t border-black/20">
                Feature: Voice & Photo Upload
              </div>
            </div>

            {/* Card 2: Government Official (Yellow) */}
            <div className="p-8 bg-brand-yellow card-brutal-lg rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-white font-bold text-xs rounded-full border border-black inline-block">Policy Makers</span>
                <h3 className="font-heading font-extrabold text-2xl">Evidence-Based Planning</h3>
                <p className="text-sm font-medium">Inspect demand clusters and adjust prioritization criteria with transparent AI rationale instead of guesswork.</p>
              </div>
              <div className="pt-6 font-mono text-xs font-bold border-t border-black/20">
                Feature: Hotspot Priority Queue
              </div>
            </div>

            {/* Card 3: Planners (Dark Gray) */}
            <div className="p-8 bg-brand-darkGray text-white card-brutal rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-white text-black font-bold text-xs rounded-full border border-black inline-block">Infrastructure Planners</span>
                <h3 className="font-heading font-extrabold text-2xl">Impact Measurement</h3>
                <p className="text-sm text-gray-300">Compare public investment plans against actual baseline demand and evaluate post-completion outcomes.</p>
              </div>
              <div className="pt-6 font-mono text-xs font-bold text-brand-yellow border-t border-gray-700">
                Feature: Exportable Analytics
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FINAL CTA SECTION */}
      <section className="py-24 bg-brand-yellow border-b-2 border-black px-6 md:px-12 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="font-heading font-extrabold text-5xl md:text-6xl leading-tight">
            READY TO TRANSFORM PUBLIC INFRASTRUCTURE PLANNING?
          </h2>
          <p className="font-medium text-lg max-w-2xl mx-auto">
            Turn fragmented citizen feedback into structured, location-aware evidence for actionable regional development.
          </p>
          <div>
            <button 
              onClick={() => navigate('/citizen/dashboard')}
              className="btn-brutal-primary px-10 py-5 text-lg font-extrabold rounded-xl"
            >
              Launch Citizen Portal &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-charcoal text-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="font-heading font-extrabold text-2xl text-brand-yellow">JANSETU</div>
            <p className="text-xs text-gray-400">Digital platform connecting citizen demand with evidence-based governance.</p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/contact')}
                className="text-xs font-bold text-brand-yellow hover:underline flex items-center gap-1"
              >
                Grievance & Support Desk &rarr;
              </button>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-brand-sage uppercase">System Modules</div>
            <ul className="text-xs space-y-2 text-gray-400">
              <li>
                <button onClick={() => navigate('/citizen/submit')} className="hover:text-brand-yellow transition-colors">
                  Citizen Request Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/government/hotspots')} className="hover:text-brand-yellow transition-colors">
                  Hotspot Mapping
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/government/recommendations')} className="hover:text-brand-yellow transition-colors">
                  AI Priority Scoring
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/government/impact')} className="hover:text-brand-yellow transition-colors">
                  Impact Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-brand-sage uppercase">BRICS Governance</div>
            <ul className="text-xs space-y-2 text-gray-400">
              <li>Demographic Fusion</li>
              <li>Public Investment Index</li>
              <li>Audit Trails</li>
              <li>Multi-region Config</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <div className="font-bold text-sm text-brand-sage uppercase">Connect</div>
            <div className="flex gap-2">
              <a
                href="https://github.com/HimaniPanigrahy286/JanSetu"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-brand-darkGray border border-gray-600 flex items-center justify-center hover:bg-brand-yellow hover:text-black hover:border-black transition-colors font-bold text-xs"
              >
                GH
              </a>
              <button 
                onClick={() => navigate('/contact')} 
                className="w-10 h-10 bg-brand-darkGray border border-gray-600 flex items-center justify-center hover:bg-brand-yellow hover:text-black hover:border-black transition-colors font-bold text-xs"
              >
                HELP
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="w-10 h-10 bg-brand-darkGray border border-gray-600 flex items-center justify-center hover:bg-brand-yellow hover:text-black hover:border-black transition-colors font-bold text-xs"
              >
                AUTH
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div>&copy; 2026 JanSetu Governance Platform.</div>
          <div>Built by Ankita, Himani & Trishala</div>
        </div>
      </footer>

      <CitizenFaqAssistant initialLanguage={faqLanguage} />
    </div>
  );
}