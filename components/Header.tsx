import React from 'react';

interface HeaderProps {
  onSettings: () => void;
  onHelp: () => void;
  onLeaderboard: () => void;
  showSettings: boolean;
  onHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettings, onHelp, onLeaderboard, showSettings, onHome }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 shrink-0">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={onHome}
      >
        <div className="w-10 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="font-black text-white text-xs uppercase">Sus</span>
        </div>
        <h1 className="text-xl font-black tracking-tight text-slate-100 uppercase">Neighbor</h1>
      </div>
      
      <div className="flex items-center gap-1">
        {showSettings && (
          <>
            <button 
              onClick={onLeaderboard}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
              aria-label="Leaderboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </button>
            <button 
              onClick={onHelp}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
              aria-label="How to Play"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </>
        )}
        
        {showSettings ? (
          <button 
            onClick={onSettings}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={onHome}
            className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 ml-2"
          >
            Abort
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;