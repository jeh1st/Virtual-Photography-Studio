import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import SelectInput from '../../SelectInput';
import { NodeData, NodeType, Gender, BodyType } from '../../../types';

interface BodyNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const BodyNode: React.FC<BodyNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    // Format title
    const genderLabels: Record<string, string> = {
        [Gender.Woman]: 'Female',
        [Gender.Man]: 'Male',
        [Gender.NonBinary]: 'NB',
        [Gender.ObsidianFormF]: 'Obsidian (F)',
        [Gender.ObsidianFormM]: 'Obsidian (M)',
        [Gender.ObsidianFormN]: 'Obsidian (N)',
    };

    const displayGender = genderLabels[data.gender as string] || 'Standard';

    return (
        <BaseNode
            id={id}
            type={NodeType.Body}
            title={`Physique: ${displayGender}`}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#fca5a5" // Light Red/Pink
            icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            }
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <SelectInput
                    label="Gender Identity"
                    value={data.gender || Gender.Woman}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    options={Object.values(Gender)}
                    labelMap={genderLabels}
                />

                <SelectInput
                    label="Body Structure"
                    value={data.bodyType || BodyType.Average}
                    onChange={(e) => handleChange('bodyType', e.target.value)}
                    options={Object.values(BodyType).map(v => ({
                        value: v,
                        label: v.split(',')[0] // Truncate long descriptions for the UI label
                    }))}
                />
            </div>
        </BaseNode>
    );
};
