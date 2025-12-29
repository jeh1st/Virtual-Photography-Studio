import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import SelectInput from '../../SelectInput';
import { NodeData, NodeType } from '../../../types';
import { FILMS } from '../../../constants_fstop';

interface FilmNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const FilmNode: React.FC<FilmNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.filmStock && data.filmStock !== 'None' ? data.filmStock : 'Film Stock / Sensor';

    return (
        <BaseNode
            id={id}
            type={NodeType.Film}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#60a5fa"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <SelectInput
                    label="Film Stock"
                    value={data.filmStock || 'None'}
                    onChange={(e) => handleChange('filmStock', e.target.value)}
                    options={FILMS} // Assuming FILMS includes 'Digital Sensor' etc.
                />
            </div>
        </BaseNode>
    );
};
