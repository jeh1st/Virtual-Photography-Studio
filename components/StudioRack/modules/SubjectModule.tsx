import React from 'react';
import { StudioState } from '../../../types';
import { SubjectRackUnit } from '../units/SubjectRackUnit';

interface SubjectModuleProps {
    state: StudioState['subject'];
    onChange: (updates: Partial<StudioState['subject']>) => void;
    subjects?: any[];
    onManageLibrary?: () => void;
}

export const SubjectModule: React.FC<SubjectModuleProps> = (props) => {
    return <SubjectRackUnit {...props} />;
};
