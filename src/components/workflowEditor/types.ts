import { RouteComponentProps } from 'react-router';

export interface WorkflowEditState {
    view: string;
    code: number;
    workflows: any[];
    workflowId: number;
    appName: string;
    showDeleteDialog: boolean;
    isGitOpsConfigAvailable: boolean;
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
    type: 'CI' | 'CD';
    toggleMenu: () => void;
}