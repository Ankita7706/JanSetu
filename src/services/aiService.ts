import type { AIAnalysis, Category, Severity } from '../types';

interface LanguageMap {
  [key: string]: { name: string; sample: string; translation: string; code: string };
}

export const LANGUAGE_PATTERNS: LanguageMap = {
  odia: {
    name: 'Odia',
    sample: 'ଆମ ଗାଁକୁ ଭଲ ରାସ୍ତା ନାହିଁ ଏବଂ ପିଇବା ପାଣି ପାଇପ୍ ଭାଙ୍ଗିଯାଇଛି।',
    translation: 'There is no proper road to our village and the drinking water pipeline is broken.',
    code: 'or-IN',
  },
  hindi: {
    name: 'Hindi',
    sample: 'हमारे गांव में पीने का साफ पानी नहीं है और स्ट्रीटलाइट खराब हैं।',
    translation: 'There is no clean drinking water in our village and streetlights are broken.',
    code: 'hi-IN',
  },
  bengali: {
    name: 'Bengali',
    sample: 'আমাদের গ্রামে ড্রেনেজ বন্ধ থাকায় রাস্তায় জল জমে যাচ্ছে।',
    translation: 'In our village, blocked drains are causing severe water stagnation on the road.',
    code: 'bn-IN',
  },
  tamil: {
    name: 'Tamil',
    sample: 'எங்கள் பகுதியில் சாலைகள் பழுதடைந்துள்ளன, குடிநீர் தட்டுப்பாடு உள்ளது.',
    translation: 'Roads in our area are severely damaged and there is a drinking water shortage.',
    code: 'ta-IN',
  },
  telugu: {
    name: 'Telugu',
    sample: 'మా గ్రామంలో రోడ్డు సరిగా లేదు మరియు విద్యుత్ కోతలు ఎక్కువగా ఉన్నాయి.',
    translation: 'In our village roads are in bad shape and electricity cuts are frequent.',
    code: 'te-IN',
  },
  marathi: {
    name: 'Marathi',
    sample: 'आमच्या गावात पिण्याचे पाणी येत नाही आणि रस्ते खराब आहेत.',
    translation: 'There is no drinking water supply in our village and roads are in bad condition.',
    code: 'mr-IN',
  },
  english: {
    name: 'English',
    sample: 'The main connecting road has severe craters and ambulances cannot reach.',
    translation: 'The main connecting road has severe craters and ambulances cannot reach.',
    code: 'en-IN',
  },
};

const CATEGORY_KEYWORDS: { keywords: string[]; category: Category; subcategory: string }[] = [
  {
    keywords: [
      'road', 'street', 'highway', 'path', 'pothole', 'bridge', 'rasta', 'raasta', 'sadak', 'crater', 'asphalt',
      'khadde', 'gaddha', 'khada', 'potholes', 'tuta', 'flyover', 'divider', 'tar',
      'ରାସ୍ତା', 'ପୋଲ', 'ଖାଲ', 'ଗାତ', 'ସଡକ',
      'सड़क', 'रास्ता', 'गड्ढा', 'पुल', 'खड्डे', 'सड़क',
      'রাস্তা', 'কালভার্ট', 'ব্রিজ',
      'சாலை', 'பாலம்', 'குழி',
      'రోడ్డు', 'వంతెన', 'గుంతలు',
      'रस्ता', 'खड्डे', 'पूल'
    ],
    category: 'Roads',
    subcategory: 'Road Surface & Connectivity',
  },
  {
    keywords: [
      'water', 'drinking', 'pipeline', 'supply', 'pani', 'jal', 'tap', 'borewell', 'chlorination', 'contamination',
      'paani', 'tanker', 'leak', 'leakage', 'dirty water', 'filter', 'seep',
      'ପାଣି', 'ଜଳ', 'ପାଇପ୍', 'ନାଳନ୍ଦା',
      'पानी', 'जल', 'पाइप', 'नल', 'बोरवेल', 'पेयजल',
      'জল', 'পানি', 'পাইপ', 'নলকূপ',
      'தண்ணீர்', 'குடிநீர்', 'குழாய்',
      'నీరు', 'మంచి నీరు', 'పైపు', 'బోరు',
      'पाणी', 'नळ', 'पाईप'
    ],
    category: 'Water',
    subcategory: 'Piped Water Supply & Quality',
  },
  {
    keywords: [
      'light', 'streetlight', 'lamp', 'dark', 'bulb', 'led', 'pole', 'batti', 'darkness', 'andhera', 'andhar',
      'ଆଲୁଅ', 'ବତୀ', 'ଲାଇଟ୍', 'ଅନ୍ଧାର',
      'बत्ती', 'लाइट', 'अंधेरा', 'स्ट्रीटलाइट', 'खंभा',
      'আলো', 'বাতি', 'অন্ধকার',
      'விளக்கு', 'தெருவிளக்கு', 'இருட்டு',
      'దీపం', 'వీధి దీపాలు', 'చీకటి',
      'दिवा', 'लाईट', 'अंधार', 'खांब'
    ],
    category: 'Streetlights',
    subcategory: 'Public Safety Streetlighting',
  },
  {
    keywords: [
      'drain', 'drainage', 'gutter', 'waterlogging', 'flood', 'sewage', 'clogged', 'nala', 'naala', 'overflow',
      'stagnant', 'choked', 'manhole',
      'ନାଳ', 'ଡ୍ରେନ୍', 'ପାଣି ଜମିବା', 'ସୁଏଜ୍',
      'नाली', 'नाला', 'गटर', 'जलभराव', 'सीवर',
      'ড্রেন', 'নর্দমা', 'জলাবদ্ধতা',
      'வடிகால்', 'சாக்கடை', 'வெள்ளம்',
      'మురుగు', 'కాలువ', 'వరద',
      'नाली', 'गटार', 'पाणी साचणे'
    ],
    category: 'Drainage',
    subcategory: 'Stormwater Drainage & Flood Control',
  },
  {
    keywords: [
      'bus', 'transport', 'commute', 'route', 'traffic', 'vehicle', 'transit', 'stop', 'stand', 'train', 'auto',
      'ବସ୍', 'ଯାତାୟାତ', 'ଷ୍ଟପ୍',
      'बस', 'यातायात', 'ट्रांसपोर्ट', 'स्टॉप', 'गाड़ी',
      'বাস', 'পরিবহন', 'স্টপ',
      'பேருந்து', 'போக்குவரத்து',
      'బస్సు', 'రవాణా',
      'बस', 'वाहतूक', 'थांबा'
    ],
    category: 'Public Transport',
    subcategory: 'Public Bus & Commuter Transit',
  },
  {
    keywords: [
      'hospital', 'health', 'doctor', 'clinic', 'phc', 'medicine', 'school', 'classroom', 'teacher', 'ambulance', 'nurse',
      'dispensary', 'patient', 'bed',
      'ଡାକ୍ତରଖାନା', 'ଡାକ୍ତର', 'ସ୍ୱାସ୍ଥ୍ୟ', 'ସ୍କୁଲ', 'ବିଦ୍ୟାଳୟ', 'ଔଷଧ',
      'अस्पताल', 'स्वास्थ्य', 'डॉक्टर', 'दवा', 'स्कूल', 'विद्यालय', 'दवाखाना', 'एम्बुलेंस',
      'হাসপাতাল', 'ডাক্তার', 'স্কুল', 'বিদ্যালয়', 'ওষুধ',
      'மருத்துவமனை', 'மருத்துவர்', 'பள்ளி',
      'ఆసుపత్రి', 'డాక్టర్', 'పాఠశాల', 'బడి',
      'दवाखाना', 'रुग्णालय', 'शाळा', 'डॉक्टर'
    ],
    category: 'Schools & Hospitals',
    subcategory: 'Healthcare & Educational Infrastructure',
  },
  {
    keywords: [
      'electricity', 'power', 'current', 'bijli', 'voltage', 'transformer', 'wire', 'blackout', 'outage', 'cut',
      'load shedding', 'short circuit', 'low voltage',
      'ବିଦ୍ୟୁତ୍', 'କରେଣ୍ଟ', 'ଟ୍ରାନ୍ସଫର୍ମର', 'ତାର',
      'बिजली', 'करंट', 'ट्रांसफॉर्मर', 'तार', 'वोल्टेज', 'पावर कट',
      'বিদ্যুৎ', 'কারেন্ট', 'ট্রান্সফরমার',
      'மின்சாரம்', 'மின்வெட்டு',
      'విద్యుత్', 'కరెంటు', 'ట్రాన్స్‌ఫార్మర్',
      'वीज', 'लाईट कट', 'ट्रान्सफॉर्मर'
    ],
    category: 'Electricity',
    subcategory: 'Power Grid & Microgrid Distribution',
  },
  {
    keywords: [
      'garbage', 'trash', 'waste', 'dump', 'sanitation', 'clean', 'toilet', 'kachra', 'kuda', 'gandagi', 'safai',
      'smell', 'dustbin', 'sweep',
      'ଅଳିଆ', 'ଆବର୍ଜନା', 'ଶୌଚାଳୟ', 'ସଫେଇ',
      'कचरा', 'कूड़ा', 'सफाई', 'शौचालय', 'गंदगी', 'कूड़ेदान',
      'ময়লা', 'আবর্জনা', 'শৌচাগার', 'পরিষ্কার',
      'குப்பை', 'தூய்மை', 'கழிப்பறை',
      'చెత్త', 'పరిశుభ్రత', 'మరుగుదొడ్డి',
      'कचरा', 'घाण', 'स्वच्छता', 'शौचालय'
    ],
    category: 'Sanitation',
    subcategory: 'Solid Waste & Public Sanitation',
  },
  {
    keywords: [
      'internet', 'network', 'digital', 'wifi', 'broadband', 'tower', 'connectivity', 'mobile', 'signal', 'sim',
      'ଇଣ୍ଟରନେଟ୍', 'ନେଟୱାର୍କ', 'ଟାୱାର',
      'इंटरनेट', 'नेटवर्क', 'वाईफाई', 'टावर', 'सिग्नल',
      'ইন্টারনেট', 'নেটওয়ার্ক', 'টাওয়ার',
      'இணையம்', 'நெட்வொர்க்', 'சிக்னல்',
      'ఇంటర్నెట్', 'నెట్‌వర్క్', 'సిగ్నల్',
      'इंटरनेट', 'नेटवर्क', 'वायफाय'
    ],
    category: 'Digital Infrastructure',
    subcategory: 'Broadband & Digital Tower Coverage',
  },
];

const SEVERITY_KEYWORDS: { keywords: string[]; severity: Severity }[] = [
  {
    keywords: [
      'emergency', 'death', 'dying', 'critical', 'urgent', 'life', 'hospital', 'accident', 'ambulance', 'fatal',
      'danger', 'severe', 'immediate', 'hazard', 'bleeding', 'collapsed',
      'ଜରୁରୀ', 'ବିପଦ', 'ଦୁର୍ଘଟଣା', 'ଆମ୍ବୁଲାନ୍ସ',
      'आपातकालीन', 'गंभीर', 'खतरा', 'दुर्घटना', 'तुरंत', 'जानलेवा', 'इमरजेंसी',
      'জরুরি', 'বিপদ', 'দুর্ঘটনা',
      'அவசரம்', 'ஆபத்து', 'விபத்து',
      'అత్యవసరం', 'ప్రమాదం',
      'तातडीचे', 'धोकादायक', 'अपघात'
    ],
    severity: 'critical',
  },
  {
    keywords: [
      'no', 'not', 'without', 'lack', 'broken', 'damaged', 'problem', 'contaminated', 'burst', 'outage', 'blackout',
      'ଭାଙ୍ଗି', 'ନାହିଁ', 'ନଷ୍ଟ', 'ଖରାପ',
      'खराब', 'टूटा', 'बंद', 'नहीं', 'समस्या',
      'ভাঙা', 'খারাপ', 'বন্ধ',
      'உடைந்த', 'பழுது', 'இல்லை',
      'విరిగిన', 'లేదు',
      'नादुरुस्त', 'तुटलेले', 'नाही'
    ],
    severity: 'high',
  },
  {
    keywords: [
      'poor', 'bad', 'issue', 'concern', 'need', 'require', 'improve', 'repair', 'irregular', 'slow',
      'ଆବଶ୍ୟକ', 'ମରାମତି',
      'जरूरत', 'मरम्मत', 'धीमा', 'कमी',
      'প্রয়োজন', 'মেরামত',
      'தேவை',
      'అవసరం', 'బాగుచేయాలి',
      'दुरुस्ती'
    ],
    severity: 'medium',
  },
  {
    keywords: [
      'better', 'enhance', 'upgrade', 'request', 'suggest', 'maintenance', 'future', 'plant',
      'ସୁବିଧା', 'উନ୍ନୟନ', 'सुझाव', 'વિકાસ', 'अद्ययावत'
    ],
    severity: 'low',
  },
];

function detectCategory(text: string): { category: Category; subcategory: string } {
  const lower = text.toLowerCase();
  for (const item of CATEGORY_KEYWORDS) {
    if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return { category: item.category, subcategory: item.subcategory };
    }
  }
  return { category: 'Other Development', subcategory: 'Community Public Infrastructure' };
}

function detectSeverity(text: string): Severity {
  const lower = text.toLowerCase();
  for (const item of SEVERITY_KEYWORDS) {
    if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return item.severity;
    }
  }
  return 'medium';
}

function generateSummary(category: Category, severity: Severity, textContext?: string): string {
  if (textContext && textContext.length > 15) {
    const cleanSnippet = textContext.replace(/[\n\r]+/g, ' ').trim();
    if (cleanSnippet.length > 20) {
      return `Voice reported grievance: "${cleanSnippet.slice(0, 110)}${cleanSnippet.length > 110 ? '...' : ''}" classified under ${category} (${severity} severity).`;
    }
  }

  const templates: Record<Category, string[]> = {
    Roads: [
      `Critical road connectivity and surface fracture reported. High potential of vehicular damage and access barriers to essential facilities (${severity} urgency).`,
      `Severe transit impairment detected on public thoroughfare requiring prompt structural resurfacing.`,
    ],
    Water: [
      `Significant drinking water supply outage detected. Poses immediate sanitation risk to households in the reported ward (${severity} urgency).`,
      `Pipeline breach impacting local drinking supply; emergency mobile tankers and valve repair recommended.`,
    ],
    Streetlights: [
      `Public lighting failure compromising nighttime visibility and pedestrian safety along the reported transit sector.`,
      `Multi-fixture streetlighting outage reported; circuit breaker assessment and LED replacement queued.`,
    ],
    Drainage: [
      `Stormwater drain blockage and urban stagnation identified with elevated flood risk during precipitation (${severity} severity).`,
      `Clogged arterial drainage causing water accumulation; de-silting and culvert clearance required.`,
    ],
    'Public Transport': [
      `Commuter transit deficit identified. Lack of reliable public bus frequencies impacting workers and students.`,
      `Feeder public transport gap reported; recommendation to augment schedule frequency during peak hours.`,
    ],
    'Schools & Hospitals': [
      `Critical public institutional facility gap detected in healthcare/education provision for the community.`,
      `Inadequate facility infrastructure reported; intervention recommended to ensure uninterrupted citizen services.`,
    ],
    Electricity: [
      `Power distribution irregularity and transformer strain identified with direct impact on livelihoods and agriculture.`,
      `Low voltage and unscheduled outages detected; transformer reinforcement required.`,
    ],
    Sanitation: [
      `Solid waste accumulation and sanitation deficit with public health implications in the residential locality.`,
      `Waste disposal and sanitation infrastructure maintenance needed to restore environmental standards.`,
    ],
    'Digital Infrastructure': [
      `Digital connectivity barrier identified, restricting citizen access to digital governance and e-services.`,
    ],
    'Other Development': [
      `Community infrastructure defect logged and categorized for municipal engineering review.`,
    ],
  };

  const options = templates[category] || templates['Other Development'];
  return options[Math.floor(Math.random() * options.length)];
}

function synthesizeEnglishTranslation(text: string, languageKey: string, category: Category): string {
  // If the text is already largely English ASCII characters
  const isAscii = /^[\x00-\x7F\s.,!?'"()-]+$/.test(text);
  if (isAscii && text.length > 5) {
    return text;
  }

  const categoryContext: Record<Category, string> = {
    Roads: 'The local road and transportation route has damaged surface and potholes requiring urgent repair.',
    Water: 'There is a drinking water pipeline leakage and supply disruption affecting the community.',
    Streetlights: 'The streetlights in the area are non-functional causing unsafe dark street conditions.',
    Drainage: 'The drainage and stormwater lines are blocked causing water stagnation and flood risk.',
    'Public Transport': 'Public transport bus connectivity and service frequency is insufficient for commuters.',
    'Schools & Hospitals': 'Hospital or school institutional facilities in the locality require urgent maintenance.',
    Electricity: 'Electricity outages, low voltage, or damaged power cables are causing disruptions.',
    Sanitation: 'Garbage accumulation and sanitation issues need municipal waste clearance.',
    'Digital Infrastructure': 'Mobile network connectivity and internet broadband signals are unavailable.',
    'Other Development': 'Public infrastructure issue reported requiring municipal verification and action.',
  };

  const defaultMsg = categoryContext[category] || 'Civic infrastructure grievance reported by citizen.';
  return `${defaultMsg} (Translated from native ${languageKey.toUpperCase()} voice input: "${text}")`;
}

export const aiService = {
  async analyzeText(text: string, language: string = 'English'): Promise<AIAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const { category, subcategory } = detectCategory(text);
    const severity = detectSeverity(text);
    const summary = generateSummary(category, severity, text);

    const isEnglish = language.toLowerCase() === 'english' || /^[\x00-\x7F\s.,!?'"()-]+$/.test(text);
    const translatedText = isEnglish
      ? text
      : synthesizeEnglishTranslation(text, language, category);

    const words = text
      .replace(/[^\w\s\u0900-\u0D7F]/gu, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 6);

    return {
      detectedLanguage: language,
      originalText: text,
      translatedText,
      category,
      subcategory,
      severity,
      summary,
      confidence: Number((0.92 + Math.random() * 0.06).toFixed(2)),
      keywords: words.length > 0 ? words : [category.toLowerCase(), 'infrastructure', 'civic'],
      duplicateClusterCount: Math.floor(18 + Math.random() * 65),
    };
  },

  async analyzeVoice(languageKey: string, spokenText?: string): Promise<{
    transcription: string;
    translation: string;
    analysis: AIAnalysis;
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const key = languageKey.toLowerCase();
    const langData = LANGUAGE_PATTERNS[key] || LANGUAGE_PATTERNS['odia'];

    // If actual user speech was recorded and transcribed, process that!
    const effectiveText = spokenText && spokenText.trim().length > 0 ? spokenText.trim() : langData.sample;
    const { category, subcategory } = detectCategory(effectiveText);
    const severity = detectSeverity(effectiveText);
    const summary = generateSummary(category, severity, effectiveText);

    const isEnglish = key === 'english' || /^[\x00-\x7F\s.,!?'"()-]+$/.test(effectiveText);
    const translation = isEnglish
      ? effectiveText
      : synthesizeEnglishTranslation(effectiveText, langData.name, category);

    const words = effectiveText
      .replace(/[^\w\s\u0900-\u0D7F]/gu, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 6);

    const analysis: AIAnalysis = {
      detectedLanguage: langData.name,
      originalText: effectiveText,
      translatedText: translation,
      category,
      subcategory,
      severity,
      summary,
      confidence: Number((0.93 + Math.random() * 0.05).toFixed(2)),
      keywords: words.length > 0 ? words : ['voice', category.toLowerCase(), 'civic', 'urgent'],
      duplicateClusterCount: Math.floor(20 + Math.random() * 55),
    };

    return {
      transcription: effectiveText,
      translation,
      analysis,
    };
  },
};
