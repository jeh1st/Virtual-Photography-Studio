
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 border-b border-white/5 bg-gray-950 sticky top-0 z-50 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]"></div>
        <h1 className="text-xl tracking-wide text-white flex items-baseline gap-0.5">
          <span className="font-bold font-serif italic text-rose-100">Boudoir</span>
          <span className="text-gray-400 font-light tracking-widest text-xs uppercase ml-2">Pre-Viz Studio</span>
        </h1>
      </div>
      <div className="hidden md:block">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">AI Photography Planning</p>
      </div>
    </header>
  );
};

export default Header;
