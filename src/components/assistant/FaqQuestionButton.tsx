import type { ButtonHTMLAttributes } from 'react';

interface FaqQuestionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  question: string;
}

export default function FaqQuestionButton({ question, className = '', ...props }: FaqQuestionButtonProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-xl border-2 border-black/20 bg-white px-3 py-2.5 text-left text-xs font-bold text-black transition-colors hover:border-black hover:bg-brand-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${className}`}
      {...props}
    >
      {question}
    </button>
  );
}