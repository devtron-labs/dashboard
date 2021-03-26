import { RouteComponentProps } from 'react-router';
import { HostURLConfig } from '../../services/service.types';

export interface WorkflowEditState {
    view: string;
    code: number;
    workflows: any[];
    workflowId: number;
    appName: string;
    showDeleteDialog: boolean;
    isGitOpsConfigAvailable: boolean;
    hostURLConfig: HostURLConfig;
}

export interface WorkflowEditProps extends RouteComponentProps<{ appId: string, workflowId: string, ciPipelineId: string, cdPipelineId: string }> {
    configStatus: number;
    isCiPipeline: boolean;
    respondOnSuccess: () => void;
    getWorkflows: () => void;
}

export interface AddWorkflowState {
    id: number;
    name: string;
    showError: boolean;
}

export interface AddWorkflowProps extends RouteComponentProps<{ appId: string, workflowId: string }> {
    name: string;
    onClose: () => void;
    getWorkflows: () => void;
}

export interface PipelineSelectProps {
    ciPipelineId: number;
    showMenu: boolean;
    workflowId: number;
    left: number;
    top: number;
    toggleMenu: () => void;
    handleCISelect: (workflowId: string | number, type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => void;
}