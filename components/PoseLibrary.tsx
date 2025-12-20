
import React from 'react';
import { PoseInfo } from '../constants';

interface PoseLibraryProps {
  selectedPose: string;
  onPoseSelect: (pose: string) => void;
  poses: PoseInfo[];
}

const PoseLibrary: React.FC<PoseLibraryProps> = ({ selectedPose, onPoseSelect, poses }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Pose</label>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {poses.map((poseInfo) => {
          const isSelected = selectedPose === poseInfo.id;
          return (
            <div
              key={poseInfo.id}
              onClick={() => onPoseSelect(poseInfo.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200 aspect-square border
                ${isSelected 
                  ? 'bg-purple-900/30 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.2)]' 
                  : 'bg-gray-900 border-gray-800 hover:bg-gray-800 hover:border-gray-700'
                }`
              }
              role="button"
              aria-pressed={isSelected}
              aria-label={poseInfo.label}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`w-6 h-6 mb-2 transition-colors duration-200 ${isSelected ? 'text-purple-300' : 'text-gray-500'}`}
              >
                {poseInfo.paths.map((d, i) => (
                    <path key={i} d={d} />
                ))}
              </svg>
              <span 
                className={`text-[9px] text-center font-bold tracking-wide truncate w-full uppercase ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}
              >
                {poseInfo.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PoseLibrary;
