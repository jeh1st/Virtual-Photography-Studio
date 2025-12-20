
import React, { useState, useEffect } from 'react';
import { 
  GenerationMode, Gender, BodyType, TimeOfDay, Weather, Season, 
  PhotographicStyle, CameraPerspective, LightColorTemperature,
  LandscapeType, ArchitectureStyle, ArchitectureShotType
} from '../types';
import { 
  GENERATION_MODE_OPTIONS, GENDER_OPTIONS, 
  TIME_OF_DAY_OPTIONS, WEATHER_OPTIONS, SEASON_OPTIONS, 
  PHOTOGRAPHIC_STYLE_OPTIONS, LIGHT_COLOR_TEMPERATURE_OPTIONS,
  CAMERA_PERSPECTIVE_OPTIONS, LANDSCAPE_TYPE_OPTIONS,
  ARCHITECTURE_STYLE_OPTIONS, ARCHITECTURE_SHOT_TYPE_OPTIONS,
  POSE_OPTIONS 
} from '../constants';
import SelectInput from './SelectInput';
import Button from './Button';
import { PoseInfo } from '../constants';

interface PromptWizardProps {
  onClose: () => void;
  
  setGenerationMode: (mode: GenerationMode) => void;
  setGender: (gender: Gender) => void;
  setBodyType: (type: string) => void; 
  setPose: (pose: string) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setWeather: (weather: Weather) => void;
  setSeason: (season: Season) => void;
  setPhotographicStyle: (style: PhotographicStyle) => void;
  setCameraPerspective: (perspective: CameraPerspective) => void;
  setLightColorTemperature: (temp: LightColorTemperature) => void;
  setSceneDescription: (desc: string) => void;
  setFineArtNude: (enabled: boolean) => void;
  setLandscapeType: (type: LandscapeType) => void;
  setArchitectureStyle: (style: ArchitectureStyle) => void;
  setArchitectureType: (type: ArchitectureShotType) => void;
  
  currentMode: GenerationMode;
  currentGender: Gender;
  availablePoses: PoseInfo[];
  availableBodyTypes: string[];
  sceneDescription: string;
  fineArtNude: boolean;
}

const PromptWizard: React.FC<PromptWizardProps> = ({
  onClose,
  setGenerationMode, setGender, setBodyType, setPose,
  setTimeOfDay, setWeather, setSeason,
  setPhotographicStyle, setCameraPerspective, setLightColorTemperature,
  setSceneDescription, setFineArtNude, setLandscapeType,
  setArchitectureStyle, setArchitectureType,
  currentMode, currentGender, availablePoses, availableBodyTypes, sceneDescription, fineArtNude
}) => {
  const [step, setStep] = useState(1);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [selectedPoseValue, setSelectedPoseValue] = useState('');

  useEffect(() => {
    let warning = null;
    if (currentMode === GenerationMode.Portrait && fineArtNude) {
      const publicKeywords = ['street', 'park', 'city', 'cafe', 'restaurant', 'public', 'crowd', 'market', 'mall'];
      if (publicKeywords.some(k => sceneDescription.toLowerCase().includes(k))) {
        warning = "Conflict Warning: You have selected 'Fine Art Nude' in a potentially public setting. This may trigger safety filters.";
      }
    }
    setConflictWarning(warning);
  }, [currentMode, fineArtNude, sceneDescription]);

  const totalSteps = currentMode === GenerationMode.Portrait ? 5 : 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else onClose();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePoseChange = (val: string) => {
      setSelectedPoseValue(val);
      setPose(val);
  }

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6 gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i} 
          className={`h-2 w-8 rounded-full transition-colors ${i + 1 === step ? 'bg-rose-500' : i + 1 < step ? 'bg-rose-900' : 'bg-gray-700'}`} 
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-950/50 rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Studio Wizard</h2>
            <p className="text-xs text-gray-400 mt-1">Step {step} of {totalSteps}: {
              step === 1 ? 'Concept' : 
              step === 2 ? (currentMode === GenerationMode.Portrait ? 'Subject' : 'Environment') :
              step === 3 ? (currentMode === GenerationMode.Portrait ? 'Pose' : 'Style') :
              step === 4 ? (currentMode === GenerationMode.Portrait ? 'Environment' : 'Review') :
              'Style'
            }</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {renderStepIndicator()}
          
          {conflictWarning && (
             <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-200 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {conflictWarning}
             </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-white">What are we creating?</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {GENERATION_MODE_OPTIONS.map(mode => (
                   <button
                     key={mode}
                     onClick={() => setGenerationMode(mode)}
                     className={`p-4 rounded-xl border text-left transition-all ${currentMode === mode ? 'bg-rose-600/30 border-rose-500 ring-2 ring-rose-500/20' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700'}`}
                   >
                     <div className="font-bold text-white mb-1">{mode}</div>
                     <div className="text-xs text-gray-400">
                        {mode === GenerationMode.Portrait ? 'Boudoir & Portraiture' : 
                         mode === GenerationMode.Landscape ? 'Scenes & Locations' : 'Interior & Exterior'}
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          )}

          {step === 2 && currentMode === GenerationMode.Portrait && (
             <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Subject Definition</h3>
                <SelectInput label="Gender" value={currentGender} onChange={(e) => setGender(e.target.value as Gender)} options={GENDER_OPTIONS.map(o => o.value)} labelMap={GENDER_OPTIONS.reduce((acc, cur) => ({...acc, [cur.value]: cur.label}), {})} />
                
                <SelectInput label="Body Type" value="" onChange={(e) => setBodyType(e.target.value)} options={availableBodyTypes} />
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={fineArtNude} 
                            onChange={(e) => setFineArtNude(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                        />
                        <div>
                            <span className="text-sm font-medium text-white">Enable Fine Art Mode</span>
                            <p className="text-xs text-gray-400">Focuses on form, silhouette, and artistic concealment.</p>
                        </div>
                    </label>
                </div>
             </div>
          )}

          {step === 2 && currentMode === GenerationMode.Landscape && (
             <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Landscape Type</h3>
                <SelectInput label="Type" value="" onChange={(e) => setLandscapeType(e.target.value as LandscapeType)} options={LANDSCAPE_TYPE_OPTIONS} />
             </div>
          )}

          {step === 2 && currentMode === GenerationMode.Architecture && (
             <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Architecture Basics</h3>
                <SelectInput label="Style" value="" onChange={(e) => setArchitectureStyle(e.target.value as ArchitectureStyle)} options={ARCHITECTURE_STYLE_OPTIONS} />
                <SelectInput label="Shot Type" value="" onChange={(e) => setArchitectureType(e.target.value as ArchitectureShotType)} options={ARCHITECTURE_SHOT_TYPE_OPTIONS} />
             </div>
          )}
          
          {step === 3 && currentMode === GenerationMode.Portrait && (
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Select a Pose</h3>
                {/* Changed from Visual Grid to Dropdown as requested */}
                <SelectInput 
                    label="Model Pose" 
                    value={selectedPoseValue} 
                    onChange={(e) => handlePoseChange(e.target.value)} 
                    options={POSE_OPTIONS} 
                />
                <p className="text-xs text-gray-500 mt-2">Select a pose from the dropdown list to direct the model.</p>
             </div>
          )}
          
           {step === 3 && currentMode !== GenerationMode.Portrait && (
             <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-white">Set the Atmosphere</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <SelectInput label="Time of Day" value="" onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)} options={TIME_OF_DAY_OPTIONS} />
                    <SelectInput label="Season" value="" onChange={(e) => setSeason(e.target.value as Season)} options={SEASON_OPTIONS} />
                </div>
                 <SelectInput label="Weather" value="" onChange={(e) => setWeather(e.target.value as Weather)} options={WEATHER_OPTIONS} />
             </div>
          )}

          {step === 4 && currentMode === GenerationMode.Portrait && (
             <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Set the Atmosphere</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <SelectInput label="Time of Day" value="" onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)} options={TIME_OF_DAY_OPTIONS} />
                    <SelectInput label="Season" value="" onChange={(e) => setSeason(e.target.value as Season)} options={SEASON_OPTIONS} />
                </div>
                 <SelectInput label="Weather" value="" onChange={(e) => setWeather(e.target.value as Weather)} options={WEATHER_OPTIONS} />
             </div>
          )}

          {(step === 5 || (step === 4 && currentMode !== GenerationMode.Portrait)) && (
             <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-white">Visual Style & Camera</h3>
                 <SelectInput label="Photographic Style" value="" onChange={(e) => setPhotographicStyle(e.target.value as PhotographicStyle)} options={PHOTOGRAPHIC_STYLE_OPTIONS} />
                 <SelectInput label="Perspective" value="" onChange={(e) => setCameraPerspective(e.target.value as CameraPerspective)} options={CAMERA_PERSPECTIVE_OPTIONS} />
                 <SelectInput label="Color Temperature" value="" onChange={(e) => setLightColorTemperature(e.target.value as LightColorTemperature)} options={LIGHT_COLOR_TEMPERATURE_OPTIONS} />
                 <div className="bg-rose-900/20 border border-rose-500/30 p-4 rounded-lg">
                    <p className="text-rose-200 text-sm text-center font-medium">✨ Ready to visualize. Click Finish.</p>
                 </div>
             </div>
          )}

        </div>

        <div className="p-6 border-t border-white/5 bg-gray-950/50 rounded-b-2xl flex justify-between flex-shrink-0">
            <button 
                onClick={prevStep} 
                disabled={step === 1}
                className="px-6 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Back
            </button>
            <Button onClick={nextStep} disabled={false}>
                {step === totalSteps ? 'Finish' : 'Next'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptWizard;
