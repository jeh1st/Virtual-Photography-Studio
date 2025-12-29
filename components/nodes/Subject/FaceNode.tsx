import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import SelectInput from '../../SelectInput';
import TextInput from '../../TextInput';
import SliderInput from '../../SliderInput';
import { NodeData, NodeType } from '../../../types';

interface FaceNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const FaceNode: React.FC<FaceNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.age ? `${data.age}yo ${data.ethnicity || 'Visage'}` : 'Face & Features';

    return (
        <BaseNode
            id={id}
            type={NodeType.Face}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#fca5a5"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <TextInput
                    label="Age Description"
                    value={data.age || ''}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="e.g. 20s, young adult, elderly"
                />

                <SelectInput
                    label="Ethnicity / Heritage"
                    value={data.ethnicity || ''}
                    onChange={(e) => handleChange('ethnicity', e.target.value)}
                    options={[
                        'Caucasian', 'Black / African Descent', 'Hispanic / Latinx', 'East Asian', 'South Asian', 'Middle Eastern', 'Pacific Islander', 'Indigenous', 'Mixed Race', 'Fantasy / Unspecified'
                    ]}
                />

                <div className="grid grid-cols-2 gap-2">
                    <TextInput
                        label="Eye Color"
                        value={data.eyeColor || ''}
                        onChange={(e) => handleChange('eyeColor', e.target.value)}
                        placeholder="Blue, Brown..."
                    />
                    <TextInput
                        label="Features"
                        value={data.makeup || ''}
                        onChange={(e) => handleChange('makeup', e.target.value)}
                        placeholder="Freckles, makeup..."
                    />
                </div>
            </div>
        </BaseNode>
    );
};
