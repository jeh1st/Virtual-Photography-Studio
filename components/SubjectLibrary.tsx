
import { useState, FC } from 'react';
import { SubjectProfile, ImageData, Gender, BodyType } from '../types';
import { GENDER_OPTIONS, BODY_TYPE_OPTIONS, MALE_BODY_TYPE_OPTIONS } from '../constants';
import Button from './Button';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import TextAreaInput from './TextAreaInput';
import ImageInput from './ImageInput';

interface SubjectLibraryProps {
    subjects: SubjectProfile[];
    onSave: (subject: SubjectProfile) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const SubjectLibrary: FC<SubjectLibraryProps> = ({ subjects, onSave, onDelete, onClose }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<SubjectProfile>>({
        name: '',
        description: '',
        gender: Gender.Woman,
        bodyType: BodyType.Average,
        type: 'Real Person',
        images: []
    });

    const handleNew = () => {
        setEditingId('new');
        setFormData({ name: '', description: '', gender: Gender.Woman, bodyType: BodyType.Average, type: 'Real Person', images: [] });
    };

    const handleEdit = (s: SubjectProfile) => {
        setEditingId(s.id);
        setFormData({ ...s });
    };

    const handleSave = () => {
        if (!formData.name) return;
        const subject: SubjectProfile = {
            id: editingId === 'new' ? `sub-${Date.now()}` : editingId!,
            name: formData.name!,
            description: formData.description,
            gender: formData.gender,
            bodyType: formData.bodyType,
            type: formData.type || 'Real Person',
            images: formData.images || []
        };
        onSave(subject);
        setEditingId(null);
    };

    const addImage = (img: ImageData | null) => {
        if (img) {
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), img] }));
        }
    };

    const removeImage = (idx: number) => {
        setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
    };

    return (
        <div className="fixed inset-0 z-[60] bg-gray-950 flex flex-col md:flex-row animate-fade-in overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-80 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Subject Library</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/5 pb-2">Stored Identities</p>

                <div className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
                    {subjects.map(s => (
                        <div
                            key={s.id}
                            onClick={() => handleEdit(s)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${editingId === s.id ? 'bg-indigo-900/30 border-indigo-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                        >
                            <div className="w-10 h-10 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                                {s.images[0] ? <img src={s.images[0].data} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500">?</div>}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{s.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-black">{s.type} • {s.gender}</p>
                            </div>
                        </div>
                    ))}
                    {subjects.length === 0 && <p className="text-xs text-gray-600 italic p-4 text-center">No subjects stored yet.</p>}
                </div>

                <Button onClick={handleNew} disabled={editingId === 'new'}>+ New Subject Identity</Button>
            </div>

            {/* Editing Area */}
            <div className="flex-grow p-6 md:p-10 overflow-y-auto bg-gray-950">
                {editingId ? (
                    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{editingId === 'new' ? 'Initialize New Identity' : `Profile: ${formData.name}`}</h3>
                            <div className="flex gap-2">
                                {editingId !== 'new' && <button onClick={() => { onDelete(editingId); setEditingId(null); }} className="px-4 py-2 text-xs font-bold text-red-500 uppercase hover:bg-red-500/10 rounded transition-colors">Delete Identity</button>}
                                <button onClick={() => setEditingId(null)} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase hover:text-white transition-colors">Cancel</button>
                                <Button onClick={handleSave} disabled={!formData.name} variant="primary">Save Identity</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <TextInput label="Identification Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Jane Doe" />
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectInput label="Identity Type" value={formData.type || 'Real Person'} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} options={['Real Person', 'Created Character']} />
                                    <SelectInput label="Base Gender" value={formData.gender || Gender.Woman} onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })} options={GENDER_OPTIONS} />
                                </div>
                                <SelectInput label="Target Body Type" value={formData.bodyType || BodyType.Average} onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })} options={[...BODY_TYPE_OPTIONS, ...MALE_BODY_TYPE_OPTIONS]} />
                                <TextAreaInput label="Permanent Character Notes" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Distinctive features, ethnicity, age range, permanent tattoos..." />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Consistency References ({formData.images?.length || 0})</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {(formData.images || []).map((img, i) => (
                                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/5">
                                            <img src={img.data} className="w-full h-full object-cover" />
                                            <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                        </div>
                                    ))}
                                    <div className="aspect-square border-2 border-dashed border-gray-800 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center p-2 text-center rounded-lg">
                                        <ImageInput value={null} onImageSelect={addImage} label="" helpText="Add Photo" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-600 italic">Pro Tip: Upload 3-5 images showing the face from different angles for best character consistency.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-400">Select a Subject Profile</h3>
                        <p className="text-sm text-gray-600">Choose an identity to edit or create a new one to use in your shoots.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectLibrary;
