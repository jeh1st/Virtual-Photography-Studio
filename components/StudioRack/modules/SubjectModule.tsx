import React from 'react';
import { StudioState, Gender, BodyType, HairLength, HairStyle, HairPhysics } from '../../../types';
import {
    GENDER_OPTIONS, BODY_TYPE_OPTIONS, MALE_BODY_TYPE_OPTIONS,
    ETHNICITY_OPTIONS, HAIR_LENGTH_OPTIONS, HAIR_STYLE_OPTIONS,
    HAIR_COLOR_OPTIONS, POSE_OPTIONS, AGE_OPTIONS, EYE_COLOR_OPTIONS
} from '../../../constants';
import SelectInput from '../../SelectInput';
import TextInput from '../../TextInput';
import TextAreaInput from '../../TextAreaInput';
import SkinRealismControls from '../../SkinRealismControls';
import { RackModuleWrapper } from '../components/RackModuleWrapper';

interface SubjectModuleProps {
    state: StudioState['subject'];
    onChange: (updates: Partial<StudioState['subject']>) => void;
    subjects?: any[];
    onManageLibrary?: () => void;
}

export const SubjectModule: React.FC<SubjectModuleProps> = ({
    state, onChange, subjects = [], onManageLibrary
}) => {

    const updateFace = (updates: Partial<StudioState['subject']['face']>) => {
        onChange({ face: { ...state.face, ...updates } });
    };

    const updateHair = (updates: Partial<StudioState['subject']['hair']>) => {
        onChange({ hair: { ...state.hair, ...updates } });
    };

    const updateAttire = (updates: Partial<StudioState['subject']['attire']>) => {
        onChange({ attire: { ...state.attire, ...updates } });
    };

    const isMale = state.gender === Gender.Man || state.gender === Gender.ObsidianFormM;
    const bodyTypes = isMale ? MALE_BODY_TYPE_OPTIONS : BODY_TYPE_OPTIONS;

    return (
        <RackModuleWrapper title="SUBJECT & IDENTITY" icon={<span className="text-pink-500">◈</span>} accentColor="purple">

            <div className="bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/20 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Library Identity</h4>
                    {onManageLibrary && (
                        <button onClick={onManageLibrary} className="text-[10px] text-indigo-400 font-black uppercase hover:text-indigo-300">
                            Manage Library
                        </button>
                    )}
                </div>
                <SelectInput
                    label=""
                    value={state.linkedSubjectId || ''}
                    onChange={(e) => onChange({ linkedSubjectId: e.target.value, isLinked: !!e.target.value })}
                    options={[{ value: '', label: 'Unlinked / Custom Model' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
                />
            </div>

            {!state.isLinked && (
                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                        <SelectInput
                            label="Gender"
                            value={state.gender}
                            onChange={(e) => onChange({ gender: e.target.value as Gender })}
                            options={GENDER_OPTIONS}
                        />
                        <SelectInput
                            label="Age"
                            value={state.age}
                            onChange={(e) => onChange({ age: e.target.value })}
                            options={AGE_OPTIONS}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <SelectInput
                            label="Ethnicity"
                            value={state.ethnicity}
                            onChange={(e) => onChange({ ethnicity: e.target.value })}
                            options={['', ...ETHNICITY_OPTIONS]}
                        />
                        <SelectInput
                            label="Body Type"
                            value={state.bodyType}
                            onChange={(e) => onChange({ bodyType: e.target.value })}
                            options={bodyTypes}
                        />
                    </div>
                    <SkinRealismControls
                        config={state.skinRealism}
                        onChange={(c) => onChange({ skinRealism: c })}
                    />
                </div>
            )}

            <div className="mb-6">
                <SelectInput
                    label="Model Pose"
                    value={state.pose}
                    onChange={(e) => onChange({ pose: e.target.value })}
                    options={POSE_OPTIONS}
                />
            </div>

            <div className="bg-gray-900/30 p-3 rounded border border-white/5 mb-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Face Details</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <SelectInput
                        label="Eye Color"
                        value={state.face.eyeColor}
                        onChange={(e) => updateFace({ eyeColor: e.target.value })}
                        options={['', ...EYE_COLOR_OPTIONS]}
                    />
                    <TextInput
                        label="Makeup"
                        value={state.face.makeup}
                        onChange={(e) => updateFace({ makeup: e.target.value })}
                    />
                </div>
                <TextAreaInput
                    label="Features"
                    value={state.face.features}
                    onChange={(e) => updateFace({ features: e.target.value })}
                    placeholder="Freckles, beauty marks..."
                />
            </div>

            <div className="bg-gray-900/30 p-3 rounded border border-white/5 mb-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Hair Styling</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <SelectInput
                        label="Length"
                        value={state.hair.length}
                        onChange={(e) => updateHair({ length: e.target.value as HairLength })}
                        options={HAIR_LENGTH_OPTIONS}
                    />
                    <SelectInput
                        label="Style"
                        value={state.hair.style}
                        onChange={(e) => updateHair({ style: e.target.value as HairStyle })}
                        options={HAIR_STYLE_OPTIONS}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <SelectInput
                        label="Color"
                        value={state.hair.color}
                        onChange={(e) => updateHair({ color: e.target.value })}
                        options={HAIR_COLOR_OPTIONS}
                    />
                    <SelectInput
                        label="Physics"
                        value={state.hair.physics}
                        onChange={(e) => updateHair({ physics: e.target.value as HairPhysics })}
                        options={Object.values(HairPhysics)}
                    />
                </div>
            </div>

            <div className="bg-gray-900/30 p-3 rounded border border-white/5">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Wardrobe</h4>
                <div className="space-y-3">
                    <TextInput label="Top" value={state.attire.top} onChange={(e) => updateAttire({ top: e.target.value })} placeholder="e.g. Silk Blouse" />
                    <TextInput label="Bottom" value={state.attire.bottom} onChange={(e) => updateAttire({ bottom: e.target.value })} placeholder="e.g. Denim Jeans" />
                    <TextInput label="Footwear" value={state.attire.footwear} onChange={(e) => updateAttire({ footwear: e.target.value })} placeholder="e.g. Heels" />
                    <TextAreaInput label="Accessories" value={state.attire.accessories} onChange={(e) => updateAttire({ accessories: e.target.value })} placeholder="Jewelry, Props..." />
                </div>
            </div>

        </RackModuleWrapper>
    );
};
