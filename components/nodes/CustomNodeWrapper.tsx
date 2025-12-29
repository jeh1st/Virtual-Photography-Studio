import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeContent } from './NodeContent';
import { NodeType } from '../../types';

// We wrap this in memo to prevent unnecessary re-renders
export const CustomNodeWrapper = memo(({ data, id, selected }: NodeProps) => {
    const isOutput = data.type === NodeType.Output;
    const isGroup = data.type === NodeType.Group;

    // Determine which handles to show based on node type
    // SIMPLIFIED LOGIC: Most nodes should have inputs and outputs to be flexible.
    // Specific rules should be enforced by isValidConnection, not by hiding handles (unless obviously a root/leaf).
    const showInput = !isGroup;
    const showOutput = !isOutput && !isGroup;

    return (
        <div className="relative group">
            {/* Input Handle */}
            {showInput && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id="target"
                    className="!w-4 !h-8 !rounded-md !bg-gray-600 !border !border-gray-900 transition-all duration-300 hover:!bg-blue-400 hover:!border-white !opacity-100 z-50"
                    style={{ left: -12, top: '50%' }}
                />
            )}

            {/* Visual Input for Output Node (Larger target) */}
            {isOutput && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id="target"
                    className="!w-4 !h-8 !rounded-md !bg-gray-800 !border-2 !border-green-500 transition-all duration-300 hover:!bg-green-500 hover:!scale-110 !opacity-100 z-50"
                    style={{ left: -12, top: '50%' }}
                />
            )}

            {/* Main Content */}
            <NodeContent
                id={id}
                type={data.type as NodeType}
                data={data}
                selected={selected}
                collapsed={data.isCollapsed}
                onToggleCollapse={(e) => {
                    if (data.onToggleCollapse) (data.onToggleCollapse as any)(e, id);
                }}
                onDelete={() => {
                    if (data.onDelete) (data.onDelete as any)(id);
                }}
                onDataChange={(nodeId, newData) => {
                    if (data.onDataChange) (data.onDataChange as any)(nodeId, newData);
                }}
            />

            {/* Output Handle */}
            {showOutput && (
                <Handle
                    type="source"
                    position={Position.Right}
                    id="source"
                    className="!w-4 !h-8 !rounded-md !bg-gray-400 !border !border-gray-700 transition-all duration-300 hover:!bg-purple-500 hover:!border-white hover:!scale-125 !opacity-100 z-50"
                    style={{ right: -12, top: '50%' }}
                />
            )}
        </div>
    );
});
