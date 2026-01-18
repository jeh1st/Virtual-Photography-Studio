import React from 'react';
import { StudioState } from '../../types';
import { SubjectModule } from './modules/SubjectModule';
import { EnvironmentModule } from './modules/EnvironmentModule';
import { CameraModule } from './modules/CameraModule';
import { LightingModule } from './modules/LightingModule';
import { CompositionModule } from './modules/CompositionModule';

interface StudioRackProps {
    state: StudioState;
    onUpdate: (section: keyof StudioState, data: Partial<any>) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    subjects: any[]; // Linked library
    onManageLibrary: () => void;
}

export const StudioRack: React.FC<StudioRackProps> = ({
    state, onUpdate, onGenerate, isGenerating, subjects, onManageLibrary
}) => {
    return (
        <div className="flex flex-col h-full bg-gray-950 shadow-2xl relative z-10 w-full max-w-5xl mx-auto border-x border-white/5">

            {/* RACK HEADER / MASTER CONTROL */}
            <div className="p-4 bg-gray-900 border-b border-white/5 shrink-0 z-20">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-black tracking-[0.2em] text-gray-500 uppercase">Studio Rack</h2>
                    <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse box-shadow-[0_0_8px_red]"></div>
                        <div className="h-2 w-2 rounded-full bg-green-500 box-shadow-[0_0_8px_green]"></div>
                    </div>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className={`
                        w-full py-4 rounded-lg font-black tracking-widest text-lg uppercase transition-all duration-300
                        ${isGenerating
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] transform hover:scale-[1.02] active:scale-[0.98]'
                        }
                    `}
                >
                    {isGenerating ? 'Rendering...' : 'Generate Frame'}
                </button>
            </div>

            {/* SCROLLABLE MODULE STACK */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pb-20">

                <SubjectModule
                    state={state.subject}
                    onChange={(d) => onUpdate('subject', d)}
                    subjects={subjects}
                    onManageLibrary={onManageLibrary}
                />

                <EnvironmentModule
                    state={state.environment}
                    onChange={(d) => onUpdate('environment', d)}
                />

                <CameraModule
                    state={state.camera}
                    onChange={(d) => onUpdate('camera', d)}
                />

                <LightingModule
                    state={state.lighting}
                    onChange={(d) => onUpdate('lighting', d)}
                />

                <CompositionModule
                    state={state.composition}
                    onChange={(d) => onUpdate('composition', d)}
                />

            </div>

            {/* FOOTER */}
            <div className="p-2 text-center text-[10px] text-gray-700 uppercase tracking-widest border-t border-white/5 bg-gray-950">
                V-Studio Rack v2.0 // System Active
            </div>
        </div>
    );
};
