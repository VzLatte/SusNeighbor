
import React from 'react';

interface InquestQuestionViewProps {
  round: number;
  question: string;
  onNext: () => void;
}

const InquestQuestionView: React.FC<InquestQuestionViewProps> = ({ round, question, onNext }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-2">
          Question {round + 1} of 3
        </div>
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Inquest Phase</h2>
        <div className="text-4xl font-black text-slate-100 leading-tight">
          "{question}"
        </div>
      </div>

      <button 
        onClick={onNext}
        className="w-full py-6 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 text-slate-300 rounded-3xl font-black text-xl transition-all"
      >
        START SELECTION
      </button>
    </div>
  );
};

export default InquestQuestionView;
