import React, { useCallback } from 'react';
import { BaseNode } from '../BaseNode';
import { NodeData, NodeType, ConsistencyMode } from '../../../types';
import ImageUpload from '../../ImageUpload';

interface ReferenceNodeProps {
    id: string;
    data: NodeData;
    selected?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: (e: React.MouseEvent) => void;
    onDelete?: () => void;
    onDataChange?: (nodeId: string, newData: Partial<NodeData>) => void;
}

export const ReferenceNode: React.FC<ReferenceNodeProps> = ({
    id, data, selected, collapsed, onToggleCollapse, onDelete, onDataChange
}) => {

    const handleImageUpload = useCallback((image: { data: string; mimeType: string }) => {
        if (onDataChange) {
            onDataChange(id, { referenceImage: image });
        }
    }, [id, onDataChange]);

    return (
        <BaseNode
            id={id}
            type={NodeType.Reference}
            title="Visual Reference"
            data={data}
            selected={selected}
            collapsed={collapsed}
            color="#a855f7" // Purple-500
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            onToggleCollapse={onToggleCollapse}
            onDelete={onDelete}
        >
            <div className="space-y-4">
                <ImageUpload
                    onImageUpload={handleImageUpload}
                    currentImage={data.referenceImage}
                />

                <div className="text-[10px] text-purple-300/50 italic p-2 border border-purple-500/10 rounded">
                    Connect to Subject nodes for face/style transfer, or Composition for layout reference.
                </div>
            </div>
        </BaseNode>
    );
};
