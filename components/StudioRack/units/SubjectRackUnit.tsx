import React, { useState } from 'react';
import { StudioState, Gender, HairPhysics, ConsistencyMode, HairLength, HairStyle } from '../../../types';
import {
    AGE_OPTIONS, ETHNICITY_OPTIONS, BODY_TYPE_OPTIONS,
    HAIR_LENGTH_OPTIONS, HAIR_STYLE_OPTIONS, HAIR_COLOR_OPTIONS,
    POSE_OPTIONS, CONSISTENCY_MODE_OPTIONS, MALE_BODY_TYPE_OPTIONS
} from '../../../constants';

interface SubjectRackUnitProps {
    state: StudioState['subject'];
    onChange: (updates: Partial<StudioState['subject']>) => void;
    subjects?: any[];
    onManageLibrary?: () => void;
}

const ASSETS = {
    KNOB_MAIN: "/assets/skins/reason/Knobs/Knob_09_63frames.png",
    KNOB_SMALL: "/assets/skins/reason/Knobs/Knob_21_63frames.png",
    FADER_V: "/assets/gui/Faders/Fader_14_60frames.png",
    SWITCH_TOGGLE: "/assets/skins/reason/Switches/Switch_01_2frames.png",
    SCREW: "/assets/skins/reason/Decorations/Screw_27_1frames.png"
};

export const SubjectRackUnit: React.FC<SubjectRackUnitProps> = ({ state, onChange, subjects = [], onManageLibrary }) => {

    // --- LOCAL UI STATE ---
    const [hairMenuMode, setHairMenuMode] = useState<'LEN' | 'STY' | 'COL'>('STY');

    // --- HELPERS ---

    // Age Logic
    const currentAgeIndex = AGE_OPTIONS.indexOf(state.age);
    const setAgeIndex = (idx: number) => {
        const clampped = Math.max(0, Math.min(idx, AGE_OPTIONS.length - 1));
        onChange({ age: AGE_OPTIONS[clampped] });
    };

    // Ethnicity Logic
    const currentEthnicityIndex = Math.max(0, ETHNICITY_OPTIONS.indexOf(state.ethnicity));
    const setEthnicityIndex = (idx: number) => {
        const clampped = Math.max(0, Math.min(idx, ETHNICITY_OPTIONS.length - 1));
        onChange({ ethnicity: ETHNICITY_OPTIONS[clampped] });
    };

    // Body Type Logic
    const isMale = state.gender === Gender.Man || state.gender === Gender.ObsidianFormM;
    const bodyOptions = isMale ? MALE_BODY_TYPE_OPTIONS : BODY_TYPE_OPTIONS;
    const currentBodyIndex = bodyOptions.findIndex(o => o.value === state.bodyType);
    const setBodyIndex = (idx: number) => {
        const clampped = Math.max(0, Math.min(idx, bodyOptions.length - 1));
        onChange({ bodyType: bodyOptions[clampped].value });
    };

    // Hair Wheel Logic
    const handleHairWheel = (direction: -1 | 1) => {
        if (hairMenuMode === 'LEN') {
            const idx = HAIR_LENGTH_OPTIONS.indexOf(state.hair.length);
            const next = HAIR_LENGTH_OPTIONS[Math.max(0, Math.min(idx + direction, HAIR_LENGTH_OPTIONS.length - 1))];
            onChange({ hair: { ...state.hair, length: next } });
        } else if (hairMenuMode === 'STY') {
            const idx = HAIR_STYLE_OPTIONS.indexOf(state.hair.style);
            const next = HAIR_STYLE_OPTIONS[Math.max(0, Math.min(idx + direction, HAIR_STYLE_OPTIONS.length - 1))];
            onChange({ hair: { ...state.hair, style: next } });
        } else {
            const idx = HAIR_COLOR_OPTIONS.indexOf(state.hair.color);
            const next = HAIR_COLOR_OPTIONS[Math.max(0, Math.min(idx + direction, HAIR_COLOR_OPTIONS.length - 1))];
            onChange({ hair: { ...state.hair, color: next } });
        }
    };

    // Pose Logic
    const currentPoseIndex = POSE_OPTIONS.findIndex(p => p.value === state.pose);
    const setPoseIndex = (idx: number) => {
        const clampped = Math.max(0, Math.min(idx, POSE_OPTIONS.length - 1));
        onChange({ pose: POSE_OPTIONS[clampped].value });
    };

    // Skin Realism Toggle
    const toggleSkipDetail = (key: keyof typeof state.skinRealism.details) => {
        onChange({
            skinRealism: {
                ...state.skinRealism,
                details: {
                    ...state.skinRealism.details,
                    [key]: !state.skinRealism.details[key]
                }
            }
        });
    };

    return (
        <div className="w-full relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-sm shadow-2xl border-t border-white/10 border-b border-black/50 overflow-hidden font-mono text-gray-400 select-none pb-4"
            style={{ height: '520px' }}> {/* Fixed Hardware Height */}

            {/* NOISE TEXTURE */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay"></div>

            {/* RACK RAILS */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-black/40 border-r border-black/50 flex flex-col items-center justify-between py-4">
                {[1, 2, 3, 4].map(i => <img key={i} src={ASSETS.SCREW} className="w-4 h-4 opacity-80 drop-shadow-lg" alt="screw" />)}
            </div>
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-black/40 border-l border-black/50 flex flex-col items-center justify-between py-4">
                {[1, 2, 3, 4].map(i => <img key={i} src={ASSETS.SCREW} className="w-4 h-4 opacity-80 drop-shadow-lg" alt="screw" />)}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="ml-10 mr-10 h-full flex flex-col">

                {/* --- HEADER / IDENTITY (Top) --- */}
                <div className="h-16 flex items-center justify-between border-b border-black/40 mb-2 px-2">
                    <div className="bg-gray-300 text-black px-3 py-1 text-[11px] font-black tracking-[0.2em] transform -skew-x-12 border border-gray-500 shadow-sm leading-none">
                        SUBJECT SYNTHESIS CORE
                    </div>

                    {/* CARTRIDGE SLOT */}
                    <div
                        onClick={onManageLibrary}
                        className="w-64 h-10 bg-black/60 rounded border-2 border-gray-700 shadow-inner flex items-center px-4 cursor-pointer hover:border-gray-500 transition-colors relative"
                    >
                        <div className="w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent absolute top-0 left-0"></div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${state.isLinked ? 'text-green-400' : 'text-amber-600'}`}>
                            {state.linkedSubjectId ? (subjects.find(s => s.id === state.linkedSubjectId)?.name || 'UNKNOWN ID') : 'NO CARTRIDGE LOADED'}
                        </span>
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red] animate-pulse"></div>
                    </div>
                </div>

                {/* --- ROW 1: BIO-METRICS (Gender, Age, Ethnicity) --- */}
                <div className="h-[120px] flex gap-4 border-b border-white/5 pb-2">
                    {/* GENDER SWITCH */}
                    <div className="w-1/4 flex flex-col items-center justify-center border-r border-white/5 bg-black/10">
                        <label className="text-[9px] uppercase font-bold text-gray-500 mb-2">Form Factor</label>
                        <div className="flex gap-4 items-center">
                            <div className="flex flex-col items-center">
                                {/* WRAPPER FOR SCALING */}
                                <div style={{ width: 40, height: 56, overflow: 'hidden' }}>
                                    <webaudio-switch
                                        src={ASSETS.SWITCH_TOGGLE}
                                        value={state.gender === Gender.Man ? 0 : state.gender === Gender.Woman ? 1 : 2}
                                        width="100" height="140"
                                        sprites="2"
                                        style={{ transform: 'scale(0.4)', transformOrigin: '0 0' }}
                                        onInput={(e: any) => {
                                            const v = e.target.value;
                                            const g = v === 0 ? Gender.Man : v === 1 ? Gender.Woman : Gender.NonBinary;
                                            onChange({ gender: g });
                                        }}
                                    />
                                </div>
                                <span className="text-[8px] mt-1 font-bold text-gray-600">{state.gender === Gender.Man ? 'M' : state.gender === Gender.Woman ? 'F' : 'X'}</span>
                            </div>
                            <button
                                onClick={() => onChange({ gender: state.gender === Gender.ObsidianFormM ? Gender.Man : Gender.ObsidianFormM })}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${state.gender.includes('obsidian') ? 'bg-red-900 border-red-500 shadow-[0_0_10px_red]' : 'bg-gray-800 border-gray-600 hover:border-gray-400'}`}
                            >
                                <span className="text-[7px] font-black text-white/80">OBS</span>
                            </button>
                        </div>
                    </div>

                    {/* AGE DISPLAY */}
                    <div className="w-1/4 flex flex-col items-center justify-center border-r border-white/5 bg-black/10">
                        <label className="text-[9px] uppercase font-bold text-gray-500 mb-2">Chronology</label>
                        <div className="flex items-center gap-2">
                            <div className="bg-[#111] border-2 border-gray-700 p-2 rounded shadow-[inset_0_0_10px_black]">
                                <span className="font-mono text-3xl font-bold text-red-600 drop-shadow-[0_0_4px_rgba(220,38,38,0.8)]">
                                    {state.age.replace('s', '')}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => setAgeIndex(currentAgeIndex + 1)} className="w-6 h-5 bg-gray-700 rounded-sm text-[8px] text-white hover:bg-gray-600 flex items-center justify-center">▲</button>
                                <button onClick={() => setAgeIndex(currentAgeIndex - 1)} className="w-6 h-5 bg-gray-700 rounded-sm text-[8px] text-white hover:bg-gray-600 flex items-center justify-center">▼</button>
                            </div>
                        </div>
                    </div>

                    {/* ETHNICITY KNOB */}
                    <div className="w-2/4 flex flex-col items-center justify-center bg-black/10 px-4">
                        <label className="text-[9px] uppercase font-bold text-gray-500 mb-2 text-center w-full">Genetic Origin</label>
                        <div className="flex items-center w-full gap-4">
                            <div style={{ width: 47, height: 52, overflow: 'hidden' }}>
                                <webaudio-knob
                                    src={ASSETS.KNOB_MAIN}
                                    value={(currentEthnicityIndex / (ETHNICITY_OPTIONS.length - 1)) * 100}
                                    diameter="235"
                                    sprites="63"
                                    style={{ transform: 'scale(0.2)', transformOrigin: '0 0' }}
                                    onInput={(e: any) => {
                                        const val = parseInt(e.target.value);
                                        const index = Math.round((val / 100) * (ETHNICITY_OPTIONS.length - 1));
                                        setEthnicityIndex(index);
                                    }}
                                />
                            </div>
                            <div className="flex-1 bg-black border border-gray-700 p-2 rounded text-center overflow-hidden">
                                <span className="text-[10px] text-emerald-500 font-mono tracking-tighter uppercase whitespace-nowrap">
                                    {state.ethnicity || 'Global / Generic'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ROW 2: PHYSIQUE & TEXTURE --- */}
                <div className="h-[160px] flex gap-4 border-b border-white/5 py-4">
                    {/* BODY TYPE FADER */}
                    <div className="w-1/4 flex flex-col items-center border-r border-white/5 px-2">
                        <label className="text-[9px] uppercase font-bold text-gray-500 mb-2">Physique</label>
                        <div className="h-full flex items-center gap-2">
                            <div style={{ width: 20, height: 110, overflow: 'hidden' }}>
                                <webaudio-slider
                                    src={ASSETS.FADER_V}
                                    direction="vert"
                                    value={((bodyOptions.length - 1 - currentBodyIndex) / (bodyOptions.length - 1)) * 100}
                                    min="0"
                                    max="100"
                                    width="55"
                                    height="405"
                                    sprites="59"
                                    style={{ transform: 'scale(0.27)', transformOrigin: '0 0' }}
                                    onInput={(e: any) => {
                                        const val = parseInt(e.target.value);
                                        // Invert: value 100 (top/MAX) = index 0 (FullFigured), value 0 (bottom/MIN) = last index (Petite)
                                        const index = bodyOptions.length - 1 - Math.round((val / 100) * (bodyOptions.length - 1));
                                        setBodyIndex(index);
                                    }}
                                />
                            </div>
                            <div className="h-[110px] flex flex-col justify-between text-[7px] text-gray-600 font-bold uppercase">
                                <span>MAX</span>
                                <span>MID</span>
                                <span>MIN</span>
                            </div>
                        </div>
                        <span className="text-[9px] text-indigo-400 mt-1 font-bold">{state.bodyType.split(' ')[0]}</span>
                    </div>

                    {/* SKIN REALISM */}
                    <div className="w-3/4 flex flex-col px-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] uppercase font-bold text-gray-500">Skin Realism Engine</label>
                            <span className="text-[9px] text-orange-500 font-bold">{state.skinRealism.intensity}%</span>
                        </div>
                        <div className="flex h-full gap-6 items-center">
                            {/* MASTER KNOB */}
                            <div className="flex flex-col items-center">
                                <div style={{ width: 59, height: 65, overflow: 'hidden' }}>
                                    <webaudio-knob
                                        src={ASSETS.KNOB_MAIN}
                                        value={state.skinRealism.intensity}
                                        min="0" max="100"
                                        diameter="235"
                                        sprites="63"
                                        style={{ transform: 'scale(0.25)', transformOrigin: '0 0' }}
                                        onInput={(e: any) => onChange({ skinRealism: { ...state.skinRealism, intensity: parseInt(e.target.value) } })}
                                    />
                                </div>
                                <span className="text-[8px] mt-1 text-gray-500">INTENSITY</span>
                            </div>

                            {/* DETAIL GRID */}
                            <div className="grid grid-cols-4 gap-2 flex-1">
                                {Object.entries(state.skinRealism.details).map(([key, val]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleSkipDetail(key as any)}
                                        className={`
                                            h-10 border rounded-sm flex items-center justify-center relative overflow-hidden transition-all
                                            ${val
                                                ? 'bg-orange-900/40 border-orange-500/50 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                                                : 'bg-black border-gray-800 opacity-60'
                                            }
                                        `}
                                    >
                                        <span className={`text-[8px] font-bold uppercase z-10 ${val ? 'text-orange-200' : 'text-gray-600'}`}>
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        {/* Status LED */}
                                        <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${val ? 'bg-orange-500 animate-pulse' : 'bg-gray-800'}`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ROW 3: WARDROBE --- */}
                <div className="flex-1 pt-4 pb-2 px-2 flex flex-col">
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-[9px] uppercase font-bold text-gray-500">Wardrobe Data Terminal</label>
                        <div className="flex gap-2">
                            <span className="text-[8px] text-green-700 font-mono">TERM_LINK_ACTIVE</span>
                            <div className="w-2 h-2 bg-green-900 rounded-full animate-ping"></div>
                        </div>
                    </div>

                    <div className="flex-1 bg-black rounded-lg border-[6px] border-[#1a1b20] shadow-[inset_0_0_20px_black] relative overflow-hidden p-3 flex flex-col justify-center">
                        {/* CRT EFFECTS */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none z-10 bg-[length:100%_4px,3px_100%]"></div>
                        <div className="absolute inset-0 bg-green-500/5 pointer-events-none mix-blend-screen animate-pulse"></div>

                        {/* CONTENT */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 z-20 font-mono text-[10px]">
                            {['top', 'bottom', 'footwear', 'accessories'].map((field) => (
                                <div key={field} className="flex items-center border-b border-green-900/50 pb-1 hover:border-green-500/50 transition-colors group">
                                    <span className="text-green-700 mr-3 uppercase w-12 text-right group-hover:text-green-500">{field.substring(0, 3)}_</span>
                                    <input
                                        type="text"
                                        value={(state.attire as any)[field]}
                                        onChange={(e) => onChange({ attire: { ...state.attire, [field]: e.target.value } })}
                                        className="bg-transparent border-none text-green-400 placeholder-green-900/30 focus:outline-none w-full font-bold uppercase tracking-wider"
                                        placeholder="[NULL]"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
