import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import SelectInput from '../../SelectInput';
import TextInput from '../../TextInput';
import { NodeData, NodeType, HairLength, HairStyle, HairPhysics } from '../../../types';

interface HairNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const HairNode: React.FC<HairNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.hairStyle ? `${data.hairColor || ''} ${data.hairStyle}` : 'Hair & Physics';

    return (
        <BaseNode
            id={id}
            type={NodeType.Hair}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#fca5a5"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} // Bolt icon mostly for energy/style
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <SelectInput
                        label="Length"
                        value={data.hairLength || HairLength.Short}
                        onChange={(e) => handleChange('hairLength', e.target.value)}
                        options={Object.values(HairLength).map(v => ({ value: v, label: v.split(' ')[0] }))}
                    />
                    <SelectInput
                        label="Physics"
                        value={data.hairPhysics || HairPhysics.Static}
                        onChange={(e) => handleChange('hairPhysics', e.target.value)}
                        options={Object.values(HairPhysics).map(v => ({ value: v, label: v.split(' ')[0] }))}
                    />
                </div>

                <SelectInput
                    label="Style"
                    value={data.hairStyle || HairStyle.Straight}
                    onChange={(e) => handleChange('hairStyle', e.target.value)}
                    options={Object.values(HairStyle).map(v => ({ value: v, label: v }))}
                />

                <TextInput
                    label="Color Description"
                    value={data.hairColor || ''}
                    onChange={(e) => handleChange('hairColor', e.target.value)}
                    placeholder="Platinum Blonde, Obsidian Black..."
                />
            </div>
        </BaseNode>
    );
};
