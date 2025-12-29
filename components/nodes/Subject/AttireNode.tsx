import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import TextInput from '../../TextInput';
import { NodeData, NodeType } from '../../../types';

interface AttireNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const AttireNode: React.FC<AttireNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleChange = useCallback((key: keyof NodeData, value: any) => {
        if (onDataChange) {
            onDataChange(id, { [key]: value });
        }
    }, [id, onDataChange]);

    const title = data.clothingTop ? `${data.clothingTop} +` : 'Wardrobe & Style';

    return (
        <BaseNode
            id={id}
            type={NodeType.Attire}
            title={title}
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#fca5a5"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <TextInput
                    label="Top / Main"
                    value={data.clothingTop || ''}
                    onChange={(e) => handleChange('clothingTop', e.target.value)}
                    placeholder="e.g. Silk blouse, leather jacket"
                />

                <TextInput
                    label="Bottoms"
                    value={data.clothingBottom || ''}
                    onChange={(e) => handleChange('clothingBottom', e.target.value)}
                    placeholder="e.g. Denim jeans, pleated skirt"
                />

                <TextInput
                    label="Footwear"
                    value={data.footwear || ''}
                    onChange={(e) => handleChange('footwear', e.target.value)}
                    placeholder="e.g. Combat boots, bare feet"
                />

                <TextInput
                    label="Accessories"
                    value={data.propsText || ''} // Using legacy propsText for flexibility, or we can use accessories
                    onChange={(e) => handleChange('propsText', e.target.value)}
                    placeholder="e.g. Gold necklace, holding a book"
                />
            </div>
        </BaseNode>
    );
};
