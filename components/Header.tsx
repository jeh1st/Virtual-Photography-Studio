
import { FC } from 'react';
import { SessionMode } from '../types';

interface HeaderProps {
  currentMode?: SessionMode;
  onModeChange?: (mode: SessionMode) => void;
  activeTab: 'studio' | 'gallery' | 'logs' | 'docs';
  setActiveTab: (tab: 'studio' | 'gallery' | 'logs' | 'docs') => void;
}

const Header: FC<HeaderProps> = ({ currentMode = SessionMode.Standard, onModeChange, activeTab, setActiveTab }) => {
  const getModeTitle = () => {
    switch (currentMode) {
      case SessionMode.ViscosityGore: return { main: 'Viscosity', sub: 'Study' };
      case SessionMode.Nostalgia: return { main: 'Nostalgia', sub: 'Archive' };
      case SessionMode.AbstractArt: return { main: 'Abstract', sub: 'Lab' };
      default: return { main: 'Boudoir', sub: 'Pre-Viz Studio' };
    }
  };

  const { main, sub } = getModeTitle();

  const tabs = [
    { id: 'studio', label: 'Studio Rack' },
    { id: 'gallery', label: 'Film Roll' },
    { id: 'logs', label: 'System Logs' },
    { id: 'docs', label: 'Manual' },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-950 border-b border-white/5 shrink-0 z-30">

      {/* BRANDING */}
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all duration-500 ${currentMode === SessionMode.ViscosityGore ? 'from-amber-600 to-red-900' :
          currentMode === SessionMode.Nostalgia ? 'from-orange-400 to-sepia-600' :
            currentMode === SessionMode.AbstractArt ? 'from-indigo-500 to-purple-900' :
              'from-rose-500 to-purple-600'
          }`}></div>
        <div>
          <h1 className="text-lg tracking-wide text-white flex items-baseline gap-2">
            <span className="font-black font-sans italic text-gray-100">{main}</span>
            <span className="text-gray-500 font-mono text-[10px] tracking-[0.2em] uppercase">{sub}</span>
          </h1>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg border border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
                    px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200
                    ${activeTab === tab.id
                ? 'bg-gray-800 text-white shadow-sm border border-white/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }
                `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TOOLBAR / MODE */}
      <div className="flex items-center gap-4">
        {onModeChange && (
          <div className="relative group">
            <select
              value={currentMode}
              onChange={(e) => onModeChange(e.target.value as SessionMode)}
              className="appearance-none bg-black border border-gray-800 text-[10px] text-gray-400 font-bold uppercase rounded pl-3 pr-8 py-1.5 focus:border-indigo-500 hover:border-gray-600 transition-colors cursor-pointer outline-none"
            >
              {Object.values(SessionMode).map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        )}
      </div>

    </header>
  );
};

export default Header;
