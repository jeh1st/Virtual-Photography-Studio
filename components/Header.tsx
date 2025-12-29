
import { FC } from 'react';

import { SessionMode } from '../types';

interface HeaderProps {
  currentMode: SessionMode;
  onModeChange: (mode: SessionMode) => void;
}

const Header: FC<HeaderProps> = ({ currentMode, onModeChange }) => {
  const getModeTitle = () => {
    switch (currentMode) {
      case SessionMode.ViscosityGore: return { main: 'Viscosity', sub: 'Study' };
      case SessionMode.Nostalgia: return { main: 'Nostalgia', sub: 'Archive' };
      case SessionMode.AbstractArt: return { main: 'Abstract', sub: 'Lab' };
      default: return { main: 'Boudoir', sub: 'Pre-Viz Studio' };
    }
  };

  const { main, sub } = getModeTitle();

  return (
    <header className="flex items-center gap-6">
      {/* Mode Selector */}
      <div className="relative group">
        <select
          value={currentMode}
          onChange={(e) => onModeChange(e.target.value as SessionMode)}
          className="appearance-none bg-gray-900 border border-gray-700 text-xs text-gray-400 font-bold uppercase rounded-lg pl-3 pr-8 py-1.5 focus:border-rose-500 hover:border-gray-500 transition-colors cursor-pointer"
        >
          {Object.values(SessionMode).map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all duration-500 ${currentMode === SessionMode.ViscosityGore ? 'from-amber-600 to-red-900' :
          currentMode === SessionMode.Nostalgia ? 'from-orange-400 to-sepia-600' :
            currentMode === SessionMode.AbstractArt ? 'from-indigo-500 to-purple-900' :
              'from-rose-500 to-purple-600'
          }`}></div>
        <h1 className="text-xl tracking-wide text-white flex items-baseline gap-0.5">
          <span className="font-bold font-serif italic text-rose-100">{main}</span>
          <span className="text-gray-400 font-light tracking-widest text-xs uppercase ml-2">{sub}</span>
        </h1>
      </div>
      <div className="hidden md:block ml-auto">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">AI Photography Planning</p>
      </div>
    </header>
  );
};

export default Header;
