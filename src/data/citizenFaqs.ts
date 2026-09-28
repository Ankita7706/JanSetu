export const CITIZEN_FAQ_LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Odia', label: 'ଓଡ଼ିଆ' },
  { value: 'Hindi', label: 'हिन्दी' },
  { value: 'Bengali', label: 'বাংলা' },
  { value: 'Tamil', label: 'தமிழ்' },
  { value: 'Telugu', label: 'తెలుగు' },
  { value: 'Marathi', label: 'मराठी' },
] as const;

export type CitizenFaqLanguage = (typeof CITIZEN_FAQ_LANGUAGES)[number]['value'];

interface CitizenFaqTranslation {
  question: string;
  answer: string;
}

export interface CitizenFaq {
  id: string;
  question: string;
  answer: string;
  translations: Partial<Record<CitizenFaqLanguage, CitizenFaqTranslation>>;
}

export const citizenFaqUiText: Record<CitizenFaqLanguage, {
  title: string;
  greeting: string;
  askAnother: string;
  languageLabel: string;
  closeLabel: string;
  openLabel: string;
}> = {
  English: {
    title: 'JanSetu Assistant',
    greeting: 'Hello! How can I help you?',
    askAnother: 'Ask another question',
    languageLabel: 'Assistant language',
    closeLabel: 'Close assistant',
    openLabel: 'Open JanSetu Assistant',
  },
  Odia: {
    title: 'ଜନସେତୁ ସହାୟକ',
    greeting: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
    askAnother: 'ଆଉ ଏକ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ',
    languageLabel: 'ସହାୟକଙ୍କ ଭାଷା',
    closeLabel: 'ସହାୟକ ବନ୍ଦ କରନ୍ତୁ',
    openLabel: 'ଜନସେତୁ ସହାୟକ ଖୋଲନ୍ତୁ',
  },
  Hindi: {
    title: 'जनसेतु सहायक',
    greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
    askAnother: 'एक और सवाल पूछें',
    languageLabel: 'सहायक की भाषा',
    closeLabel: 'सहायक बंद करें',
    openLabel: 'जनसेतु सहायक खोलें',
  },
  Bengali: {
    title: 'জনসেতু সহায়ক',
    greeting: 'নমস্কার! আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
    askAnother: 'আরেকটি প্রশ্ন করুন',
    languageLabel: 'সহায়কের ভাষা',
    closeLabel: 'সহায়ক বন্ধ করুন',
    openLabel: 'জনসেতু সহায়ক খুলুন',
  },
  Tamil: {
    title: 'ஜன்சேது உதவியாளர்',
    greeting: 'வணக்கம்! நான் உங்களுக்கு எப்படி உதவலாம்?',
    askAnother: 'மற்றொரு கேள்வியைக் கேளுங்கள்',
    languageLabel: 'உதவியாளர் மொழி',
    closeLabel: 'உதவியாளரை மூடவும்',
    openLabel: 'ஜன்சேது உதவியாளரைத் திறக்கவும்',
  },
  Telugu: {
    title: 'జనసేతు సహాయకుడు',
    greeting: 'నమస్కారం! నేను మీకు ఎలా సహాయపడగలను?',
    askAnother: 'మరో ప్రశ్న అడగండి',
    languageLabel: 'సహాయకుడి భాష',
    closeLabel: 'సహాయకుడిని మూసివేయండి',
    openLabel: 'జనసేతు సహాయకుడిని తెరవండి',
  },
  Marathi: {
    title: 'जनसेतू सहाय्यक',
    greeting: 'नमस्कार! मी तुम्हाला कशी मदत करू शकतो?',
    askAnother: 'आणखी एक प्रश्न विचारा',
    languageLabel: 'सहाय्यकाची भाषा',
    closeLabel: 'सहाय्यक बंद करा',
    openLabel: 'जनसेतू सहाय्यक उघडा',
  },
};

export function getCitizenFaqLanguage(language?: string): CitizenFaqLanguage {
  return CITIZEN_FAQ_LANGUAGES.find(option => option.value === language)?.value || 'English';
}

export const citizenFaqs: CitizenFaq[] = [
  {
    id: 'submit-request',
    question: 'How do I submit a request?',
    answer: 'To submit a request on JanSetu, open the Citizen Portal and select Submit Request. Choose the appropriate category, describe the issue, select the problem location on the map, and review your details. A supporting photo is optional. Continue through the review step to submit your request.',
    translations: {
      Odia: {
        question: 'ମୁଁ କିପରି ଏକ ଅନୁରୋଧ ଦାଖଲ କରିବି?',
        answer: 'ଜନସେତୁରେ ଅନୁରୋଧ ଦାଖଲ କରିବାକୁ Citizen Portal ଖୋଲି Submit Request ବାଛନ୍ତୁ। ଉପଯୁକ୍ତ ବର୍ଗ ବାଛି ସମସ୍ୟା ବର୍ଣ୍ଣନା କରନ୍ତୁ, ମାନଚିତ୍ରରେ ସମସ୍ୟା ସ୍ଥାନ ଚିହ୍ନଟ କରନ୍ତୁ ଏବଂ ତଥ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ। ସହାୟକ ଫଟୋ ଇଚ୍ଛାଧୀନ। ଯାଞ୍ଚ ପଦକ୍ଷେପ ପରେ ଅନୁରୋଧ ଦାଖଲ କରନ୍ତୁ।',
      },
      Hindi: {
        question: 'मैं अनुरोध कैसे जमा करूँ?',
        answer: 'जनसेतु पर अनुरोध जमा करने के लिए Citizen Portal खोलें और Submit Request चुनें। सही श्रेणी चुनें, समस्या का विवरण दें, मानचित्र पर समस्या का स्थान चुनें और जानकारी जाँचें। सहायक फ़ोटो देना वैकल्पिक है। समीक्षा चरण पूरा करके अनुरोध जमा करें।',
      },
      Bengali: {
        question: 'আমি কীভাবে একটি অনুরোধ জমা দেব?',
        answer: 'জনসেতুতে অনুরোধ জমা দিতে Citizen Portal খুলে Submit Request নির্বাচন করুন। উপযুক্ত বিভাগ বেছে সমস্যার বিবরণ দিন, মানচিত্রে সমস্যার স্থান চিহ্নিত করুন এবং তথ্য যাচাই করুন। সহায়ক ছবি দেওয়া ঐচ্ছিক। পর্যালোচনার ধাপ শেষ করে অনুরোধ জমা দিন।',
      },
      Tamil: {
        question: 'கோரிக்கையை எவ்வாறு சமர்ப்பிப்பது?',
        answer: 'ஜன்சேதுவில் கோரிக்கையைச் சமர்ப்பிக்க Citizen Portal-ஐத் திறந்து Submit Request என்பதைத் தேர்ந்தெடுக்கவும். பொருத்தமான வகையைத் தேர்வு செய்து, சிக்கலை விவரித்து, வரைபடத்தில் அதன் இடத்தைக் குறிக்கவும். விவரங்களைச் சரிபார்க்கவும்; ஆதாரப் புகைப்படம் விருப்பமானது. மறுஆய்வு படியை முடித்துச் சமர்ப்பிக்கவும்.',
      },
      Telugu: {
        question: 'నేను అభ్యర్థనను ఎలా సమర్పించాలి?',
        answer: 'జనసేతులో అభ్యర్థన సమర్పించడానికి Citizen Portal తెరిచి Submit Request ఎంచుకోండి. సరైన వర్గాన్ని ఎంచుకుని, సమస్యను వివరించి, మ్యాప్‌లో సమస్య స్థలాన్ని గుర్తించండి. వివరాలను పరిశీలించండి; ఆధార ఫోటో ఐచ్ఛికం. సమీక్ష దశను పూర్తి చేసి అభ్యర్థనను సమర్పించండి.',
      },
      Marathi: {
        question: 'मी विनंती कशी सबमिट करू?',
        answer: 'जनसेतूवर विनंती सबमिट करण्यासाठी Citizen Portal उघडा आणि Submit Request निवडा. योग्य प्रकार निवडा, समस्येचे वर्णन करा, नकाशावर समस्येचे ठिकाण निवडा आणि माहिती तपासा. सहाय्यक फोटो देणे ऐच्छिक आहे. पुनरावलोकनाची पायरी पूर्ण करून विनंती सबमिट करा.',
      },
    },
  },
  {
    id: 'track-request',
    question: 'Track my request',
    answer: 'Open the Citizen Portal and choose Track & History to see your submitted requests, their current status, and any official updates. This assistant does not look up personal request records or status.',
    translations: {
      Odia: {
        question: 'ମୋର ଅନୁରୋଧର ସ୍ଥିତି ଦେଖନ୍ତୁ',
        answer: 'ଦାଖଲ କରିଥିବା ଅନୁରୋଧ, ସେମାନଙ୍କର ବର୍ତ୍ତମାନ ସ୍ଥିତି ଏବଂ ସରକାରୀ ଅପଡେଟ୍ ଦେଖିବାକୁ Citizen Portal ଖୋଲି Track & History ବାଛନ୍ତୁ। ଏହି ସହାୟକ ବ୍ୟକ୍ତିଗତ ଅନୁରୋଧ କିମ୍ବା ସ୍ଥିତି ଖୋଜେ ନାହିଁ।',
      },
      Hindi: {
        question: 'मेरे अनुरोध की स्थिति देखें',
        answer: 'जमा किए गए अनुरोध, उनकी वर्तमान स्थिति और आधिकारिक अपडेट देखने के लिए Citizen Portal खोलें और Track & History चुनें। यह सहायक आपके व्यक्तिगत अनुरोध या उसकी स्थिति नहीं खोजता।',
      },
      Bengali: {
        question: 'আমার অনুরোধের অবস্থা দেখুন',
        answer: 'জমা দেওয়া অনুরোধ, বর্তমান অবস্থা এবং সরকারি আপডেট দেখতে Citizen Portal খুলে Track & History নির্বাচন করুন। এই সহায়ক আপনার ব্যক্তিগত অনুরোধ বা তার অবস্থা খুঁজে দেয় না।',
      },
      Tamil: {
        question: 'எனது கோரிக்கையின் நிலையைப் பார்க்கவும்',
        answer: 'சமர்ப்பித்த கோரிக்கைகள், அவற்றின் தற்போதைய நிலை மற்றும் அதிகாரப்பூர்வப் புதுப்பிப்புகளைப் பார்க்க Citizen Portal-ஐத் திறந்து Track & History என்பதைத் தேர்ந்தெடுக்கவும். இந்த உதவியாளர் உங்கள் தனிப்பட்ட கோரிக்கை விவரங்களைத் தேடாது.',
      },
      Telugu: {
        question: 'నా అభ్యర్థన స్థితిని చూడండి',
        answer: 'మీరు సమర్పించిన అభ్యర్థనలు, వాటి ప్రస్తుత స్థితి, అధికారిక నవీకరణలను చూడటానికి Citizen Portal తెరిచి Track & History ఎంచుకోండి. ఈ సహాయకుడు మీ వ్యక్తిగత అభ్యర్థన వివరాలను వెతకడు.',
      },
      Marathi: {
        question: 'माझ्या विनंतीची स्थिती पाहा',
        answer: 'सबमिट केलेल्या विनंत्या, त्यांची सध्याची स्थिती आणि अधिकृत अपडेट पाहण्यासाठी Citizen Portal उघडा आणि Track & History निवडा. हा सहाय्यक तुमच्या वैयक्तिक विनंतीची स्थिती शोधत नाही.',
      },
    },
  },
  {
    id: 'government-schemes',
    question: 'Government schemes',
    answer: 'JanSetu currently focuses on civic infrastructure requests and government planning. Its Government Portal includes project, recommendation, demand-hotspot, and impact views. It does not provide a verified benefit-scheme directory or scheme applications; check the relevant government department for scheme eligibility and services.',
    translations: {
      Odia: {
        question: 'ସରକାରୀ ଯୋଜନା',
        answer: 'ଜନସେତୁ ବର୍ତ୍ତମାନ ନାଗରିକ ଭିତ୍ତିଭୂମି ଅନୁରୋଧ ଏବଂ ସରକାରୀ ଯୋଜନା ପ୍ରସ୍ତୁତି ଉପରେ କେନ୍ଦ୍ରିତ। Government Portal ରେ ପ୍ରକଳ୍ପ, ସୁପାରିଶ, ଚାହିଦା ହଟସ୍ପଟ୍ ଏବଂ ପ୍ରଭାବ ସୂଚନା ରହିଛି। ଏଠାରେ ଯାଞ୍ଚିତ ଲାଭ ଯୋଜନା ତାଲିକା କିମ୍ବା ଆବେଦନ ନାହିଁ; ଯୋଗ୍ୟତା ଓ ସେବା ପାଇଁ ସମ୍ପୃକ୍ତ ସରକାରୀ ବିଭାଗକୁ ପଚାରନ୍ତୁ।',
      },
      Hindi: {
        question: 'सरकारी योजनाएँ',
        answer: 'जनसेतु का वर्तमान ध्यान नागरिक बुनियादी ढाँचे के अनुरोधों और सरकारी योजना-निर्माण पर है। Government Portal में परियोजनाओं, सुझावों, माँग वाले क्षेत्रों और प्रभाव की जानकारी है। यहाँ सत्यापित लाभ-योजनाओं की सूची या आवेदन सुविधा नहीं है; पात्रता और सेवाओं के लिए संबंधित सरकारी विभाग से संपर्क करें।',
      },
      Bengali: {
        question: 'সরকারি প্রকল্প ও পরিষেবা',
        answer: 'জনসেতুর বর্তমান কাজ নাগরিক পরিকাঠামো-সংক্রান্ত অনুরোধ এবং সরকারি পরিকল্পনাকে কেন্দ্র করে। Government Portal-এ প্রকল্প, সুপারিশ, চাহিদার হটস্পট এবং প্রভাবের তথ্য রয়েছে। এখানে যাচাই করা সুবিধা-প্রকল্পের তালিকা বা আবেদন করার ব্যবস্থা নেই; যোগ্যতা ও পরিষেবার জন্য সংশ্লিষ্ট সরকারি দপ্তরে যোগাযোগ করুন।',
      },
      Tamil: {
        question: 'அரசுத் திட்டங்கள்',
        answer: 'ஜன்சேது தற்போது குடிமக்களின் உள்கட்டமைப்பு கோரிக்கைகள் மற்றும் அரசுத் திட்டமிடலில் கவனம் செலுத்துகிறது. Government Portal-ல் திட்டங்கள், பரிந்துரைகள், தேவை அதிகமுள்ள பகுதிகள் மற்றும் தாக்கம் பற்றிய விவரங்கள் உள்ளன. உறுதிப்படுத்தப்பட்ட நலத்திட்டப் பட்டியலோ விண்ணப்ப வசதியோ இதில் இல்லை; தகுதி மற்றும் சேவைகளுக்கு சம்பந்தப்பட்ட அரசுத் துறையை அணுகவும்.',
      },
      Telugu: {
        question: 'ప్రభుత్వ పథకాలు',
        answer: 'జనసేతు ప్రస్తుతం పౌర మౌలిక సదుపాయాల అభ్యర్థనలు, ప్రభుత్వ ప్రణాళికలపై దృష్టి పెడుతుంది. Government Portal‌లో ప్రాజెక్టులు, సిఫార్సులు, అధిక డిమాండ్ ప్రాంతాలు, ప్రభావ సమాచారం ఉన్నాయి. ధృవీకరించిన సంక్షేమ పథకాల జాబితా లేదా దరఖాస్తు సదుపాయం ఇక్కడ లేదు; అర్హత, సేవల కోసం సంబంధిత ప్రభుత్వ శాఖను సంప్రదించండి.',
      },
      Marathi: {
        question: 'सरकारी योजना',
        answer: 'जनसेतूचा सध्याचा भर नागरिकांच्या पायाभूत सुविधांशी संबंधित विनंत्या आणि सरकारी नियोजनावर आहे. Government Portal मध्ये प्रकल्प, शिफारसी, मागणीची ठिकाणे आणि परिणाम यांची माहिती आहे. येथे पडताळलेली लाभ-योजनांची यादी किंवा अर्जाची सुविधा नाही; पात्रता आणि सेवांसाठी संबंधित सरकारी विभागाशी संपर्क साधा.',
      },
    },
  },
  {
    id: 'documents',
    question: 'What documents do I need?',
    answer: 'Requirements can depend on the request category and issue. Check the instructions shown during submission and with the responsible department. JanSetu currently allows an optional supporting photo; it does not show a universal document checklist.',
    translations: {
      Odia: {
        question: 'ମୋତେ କେଉଁ ଦଲିଲ ଦରକାର?',
        answer: 'ଆବଶ୍ୟକତା ଅନୁରୋଧର ବର୍ଗ ଏବଂ ସମସ୍ୟା ଉପରେ ନିର୍ଭର କରିପାରେ। ଦାଖଲ ସମୟରେ ଦେଖାଯାଉଥିବା ନିର୍ଦ୍ଦେଶ ଓ ସମ୍ପୃକ୍ତ ବିଭାଗର ସୂଚନା ଯାଞ୍ଚ କରନ୍ତୁ। ଜନସେତୁରେ ଇଚ୍ଛାଧୀନ ସହାୟକ ଫଟୋ ଦିଆଯାଇପାରେ; ସମସ୍ତଙ୍କ ପାଇଁ ଏକ ସାଧାରଣ ଦଲିଲ ତାଲିକା ନାହିଁ।',
      },
      Hindi: {
        question: 'मुझे कौन-से दस्तावेज़ चाहिए?',
        answer: 'ज़रूरत अनुरोध की श्रेणी और समस्या के अनुसार बदल सकती है। जमा करते समय दिए गए निर्देश और संबंधित विभाग की जानकारी जाँचें। JanSetu में सहायक फ़ोटो वैकल्पिक है; सभी अनुरोधों के लिए कोई एक सामान्य दस्तावेज़ सूची नहीं दिखाई जाती।',
      },
      Bengali: {
        question: 'আমার কী কী নথি লাগবে?',
        answer: 'অনুরোধের বিভাগ ও সমস্যার ধরন অনুযায়ী প্রয়োজনীয়তা বদলাতে পারে। জমা দেওয়ার সময় দেখানো নির্দেশ এবং সংশ্লিষ্ট দপ্তরের তথ্য যাচাই করুন। জনসেতুতে সহায়ক ছবি ঐচ্ছিক; সব অনুরোধের জন্য একটি সাধারণ নথির তালিকা নেই।',
      },
      Tamil: {
        question: 'எனக்கு என்ன ஆவணங்கள் தேவை?',
        answer: 'கோரிக்கை வகை மற்றும் சிக்கலைப் பொறுத்து தேவைகள் மாறலாம். சமர்ப்பிக்கும் போது காட்டப்படும் வழிமுறைகளையும் சம்பந்தப்பட்ட துறையின் தகவல்களையும் சரிபார்க்கவும். ஜன்சேதுவில் ஆதாரப் புகைப்படம் விருப்பமானது; எல்லா கோரிக்கைகளுக்கும் பொதுவான ஆவணப் பட்டியல் இல்லை.',
      },
      Telugu: {
        question: 'నాకు ఏ పత్రాలు అవసరం?',
        answer: 'అభ్యర్థన వర్గం, సమస్యను బట్టి అవసరాలు మారవచ్చు. సమర్పణ సమయంలో చూపే సూచనలు, సంబంధిత శాఖ సమాచారాన్ని పరిశీలించండి. జనసేతులో ఆధార ఫోటో ఐచ్ఛికం; అన్ని అభ్యర్థనలకు ఒకే సాధారణ పత్రాల జాబితా లేదు.',
      },
      Marathi: {
        question: 'मला कोणती कागदपत्रे लागतील?',
        answer: 'आवश्यकता विनंतीचा प्रकार आणि समस्येनुसार बदलू शकते. सबमिट करताना दिसणाऱ्या सूचना आणि संबंधित विभागाची माहिती तपासा. जनसेतूमध्ये सहाय्यक फोटो ऐच्छिक आहे; सर्व विनंत्यांसाठी एकच सर्वसाधारण कागदपत्रांची यादी दिलेली नाही.',
      },
    },
  },
  {
    id: 'report-issue',
    question: 'Where should I report this?',
    answer: 'Use Submit Request in the Citizen Portal and choose the category that best matches the issue, such as Roads, Water, Streetlights, Drainage, Public Transport, Schools & Hospitals, Electricity, Sanitation, or Other Development. If no category is an exact match, choose the closest one and explain the issue clearly.',
    translations: {
      Odia: {
        question: 'ଏହି ସମସ୍ୟା କେଉଁଠାରେ ଜଣାଇବି?',
        answer: 'Citizen Portal ରେ Submit Request ବାଛି ସମସ୍ୟା ସହ ସବୁଠାରୁ ମେଳ ଖାଉଥିବା ବର୍ଗ ଚୟନ କରନ୍ତୁ; ଯଥା ରାସ୍ତା, ଜଳ, ଷ୍ଟ୍ରିଟ୍ ଲାଇଟ୍, ଡ୍ରେନେଜ୍, ପରିବହନ, ସ୍କୁଲ୍ ଓ ହସ୍ପିଟାଲ୍, ବିଦ୍ୟୁତ୍, ପରିମଳ କିମ୍ବା ଅନ୍ୟ ଉନ୍ନୟନ। ଠିକ୍ ମେଳ ନ ମିଳିଲେ ନିକଟତମ ବର୍ଗ ବାଛି ସମସ୍ୟା ସ୍ପଷ୍ଟ କରନ୍ତୁ।',
      },
      Hindi: {
        question: 'मुझे इसकी शिकायत कहाँ करनी चाहिए?',
        answer: 'Citizen Portal में Submit Request चुनें और समस्या से सबसे मेल खाने वाली श्रेणी चुनें, जैसे सड़क, पानी, स्ट्रीट लाइट, जल-निकासी, सार्वजनिक परिवहन, स्कूल और अस्पताल, बिजली, स्वच्छता या अन्य विकास। सही श्रेणी न मिले तो सबसे नज़दीकी श्रेणी चुनकर समस्या स्पष्ट लिखें।',
      },
      Bengali: {
        question: 'এই সমস্যাটি কোথায় জানাব?',
        answer: 'Citizen Portal-এ Submit Request নির্বাচন করে সমস্যার সঙ্গে সবচেয়ে মেলে এমন বিভাগ বেছে নিন—যেমন রাস্তা, জল, রাস্তার আলো, নিকাশি, গণপরিবহণ, স্কুল ও হাসপাতাল, বিদ্যুৎ, পরিচ্ছন্নতা বা অন্যান্য উন্নয়ন। ঠিক বিভাগ না পেলে কাছাকাছি বিভাগটি বেছে সমস্যাটি স্পষ্টভাবে লিখুন।',
      },
      Tamil: {
        question: 'இந்தப் பிரச்சினையை எங்கே தெரிவிக்க வேண்டும்?',
        answer: 'Citizen Portal-ல் Submit Request என்பதைத் தேர்ந்தெடுத்து, சிக்கலுக்கு மிகவும் பொருந்தும் வகையைத் தேர்வு செய்யவும். சாலை, நீர், தெருவிளக்கு, வடிகால், பொதுப் போக்குவரத்து, பள்ளிகள் மற்றும் மருத்துவமனைகள், மின்சாரம், தூய்மை அல்லது பிற வளர்ச்சி வகைகள் உள்ளன. சரியான வகை இல்லையெனில் அருகிலுள்ள வகையைத் தேர்ந்தெடுத்து சிக்கலைத் தெளிவாக விவரிக்கவும்.',
      },
      Telugu: {
        question: 'ఈ సమస్యను ఎక్కడ నివేదించాలి?',
        answer: 'Citizen Portal‌లో Submit Request ఎంచుకుని సమస్యకు సరిపోయే వర్గాన్ని ఎంచుకోండి. ఉదాహరణకు రోడ్లు, నీరు, వీధి దీపాలు, డ్రైనేజీ, ప్రజా రవాణా, పాఠశాలలు మరియు ఆసుపత్రులు, విద్యుత్, పారిశుధ్యం లేదా ఇతర అభివృద్ధి. ఖచ్చితమైన వర్గం లేకపోతే దగ్గరగా ఉన్నదాన్ని ఎంచుకుని సమస్యను స్పష్టంగా వివరించండి.',
      },
      Marathi: {
        question: 'ही समस्या कुठे नोंदवू?',
        answer: 'Citizen Portal मधील Submit Request निवडा आणि समस्येशी सर्वाधिक जुळणारा प्रकार निवडा; उदा. रस्ते, पाणी, पथदिवे, निचरा, सार्वजनिक वाहतूक, शाळा व रुग्णालये, वीज, स्वच्छता किंवा इतर विकास. अचूक प्रकार नसेल तर जवळचा प्रकार निवडून समस्या स्पष्टपणे सांगा.',
      },
    },
  },
];