import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import SelectInput from '../../SelectInput';
import SliderInput from '../../SliderInput';
import ToggleSwitch from '../../ToggleSwitch';
import { NodeData, NodeType, LightColorTemperature } from '../../../types';
import { LIGHTINGS } from '../../../constants_fstop';

interface LightSourceNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const LightSourceNode: React.FC<LightSourceNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.lightSourceType || 'Light Source';

    return (
        <BaseNode
            id={id}
            type={NodeType.LightSource}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#fbbf24" // Amber-400
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <SelectInput
                    label="Type"
                    value={data.lightSourceType || 'None'}
                    onChange={(e) => handleChange('lightSourceType', e.target.value)}
                    options={LIGHTINGS}
                />

                <SliderInput
                    label="Intensity"
                    value={data.lightPower || 50}
                    onChange={(e) => handleChange('lightPower', Number(e.target.value))}
                    min={0}
                    max={100}
                    step={1}
                />

                <SelectInput
                    label="Temperature / Color"
                    value={data.lightColorTemperature || LightColorTemperature.Neutral}
                    onChange={(e) => handleChange('lightColorTemperature', e.target.value)}
                    options={Object.values(LightColorTemperature).map(v => ({ value: v, label: v }))}
                />

                <ToggleSwitch
                    label="Visible in Frame"
                    checked={data.showEquipment || false}
                    onChange={(checked) => handleChange('showEquipment', checked)}
                />
            </div>
        </BaseNode>
    );
};
