import { useEffect, useState } from 'react';
import { Bot, MessageCircle, X } from 'lucide-react';
import {
  CITIZEN_FAQ_LANGUAGES,
  citizenFaqs,
  citizenFaqUiText,
  getCitizenFaqLanguage,
  type CitizenFaq,
  type CitizenFaqLanguage,
} from '../../data/citizenFaqs';
import FaqQuestionButton from './FaqQuestionButton';

interface CitizenFaqAssistantProps {
  initialLanguage?: string;
}

export default function CitizenFaqAssistant({ initialLanguage }: CitizenFaqAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<CitizenFaq | null>(null);
  const [language, setLanguage] = useState<CitizenFaqLanguage>(() => getCitizenFaqLanguage(initialLanguage));
  const text = citizenFaqUiText[language];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getQuestion = (faq: CitizenFaq) => faq.translations[language]?.question || faq.question;
  const getAnswer = (faq: CitizenFaq) => faq.translations[language]?.answer || faq.answer;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          id="citizen-faq-assistant"
          role="dialog"
          aria-modal="false"
          aria-labelledby="citizen-faq-title"
          className="flex max-h-[min(38rem,calc(100dvh-6.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-brutal-xl"
        >
          <header className="flex items-center gap-2.5 border-b-2 border-black bg-brand-yellow px-3.5 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-black text-brand-yellow">
              <Bot size={19} aria-hidden="true" />
            </div>
            <h2 id="citizen-faq-title" className="min-w-0 flex-1 font-heading text-sm font-extrabold leading-tight sm:text-base">
              {text.title}
            </h2>
            <label htmlFor="citizen-faq-language" className="sr-only">{text.languageLabel}</label>
            <select
              id="citizen-faq-language"
              value={language}
              onChange={event => setLanguage(event.target.value as CitizenFaqLanguage)}
              className="max-w-[6.5rem] rounded-lg border-2 border-black bg-white px-1.5 py-1.5 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-black sm:max-w-[7rem] sm:text-xs"
            >
              {CITIZEN_FAQ_LANGUAGES.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={text.closeLabel}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-white transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-3.5" aria-live="polite">
            <div className="max-w-[92%] rounded-xl border-2 border-black bg-gray-100 px-3 py-2.5 text-xs font-medium leading-relaxed">
              {text.greeting}
            </div>

            {selectedFaq ? (
              <>
                <div className="ml-auto max-w-[92%] rounded-xl border-2 border-black bg-brand-yellow px-3 py-2.5 text-xs font-bold leading-relaxed">
                  {getQuestion(selectedFaq)}
                </div>
                <div className="max-w-[96%] rounded-xl border-2 border-black bg-gray-100 px-3 py-2.5 text-xs font-medium leading-relaxed">
                  {getAnswer(selectedFaq)}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFaq(null)}
                  className="btn-brutal-secondary w-full rounded-xl px-3 py-2.5 text-xs font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                  {text.askAnother}
                </button>
              </>
            ) : (
              <div className="space-y-2" aria-label={text.greeting}>
                {citizenFaqs.map(faq => (
                  <FaqQuestionButton
                    key={faq.id}
                    question={getQuestion(faq)}
                    onClick={() => setSelectedFaq(faq)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-label={isOpen ? text.closeLabel : text.openLabel}
        aria-expanded={isOpen}
        aria-controls="citizen-faq-assistant"
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-brand-yellow text-black shadow-brutal transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/25"
      >
        {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={23} aria-hidden="true" />}
      </button>
    </div>
  );
}