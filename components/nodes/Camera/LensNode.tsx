import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import SelectInput from '../../SelectInput';
import TextInput from '../../TextInput';
import { NodeData, NodeType } from '../../../types';
import { LENSES } from '../../../constants_fstop';

interface LensNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const LensNode: React.FC<LensNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.lensModel && data.lensModel !== 'None' ? data.lensModel : 'Optics / Lens';

    return (
        <BaseNode
            id={id}
            type={NodeType.Lens}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#60a5fa"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <SelectInput
                    label="Lens Model"
                    value={data.lensModel || 'None'}
                    onChange={(e) => handleChange('lensModel', e.target.value)}
                    options={LENSES}
                />

                <div className="grid grid-cols-2 gap-2">
                    <TextInput
                        label="Aperture (f-stop)"
                        value={data.aperture || 'f/2.8'}
                        onChange={(e) => handleChange('aperture', e.target.value)}
                        placeholder="e.g. f/1.4"
                    />
                    <TextInput
                        label="Characteristic"
                        value={data.lensChar || ''}
                        onChange={(e) => handleChange('lensChar', e.target.value)}
                        placeholder="e.g. Swirly Bokeh"
                    />
                </div>
            </div>
        </BaseNode>
    );
};
