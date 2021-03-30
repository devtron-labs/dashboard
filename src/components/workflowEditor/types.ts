import { RouteComponentProps } from 'react-router';
import { HostURLConfig } from '../../services/service.types';
import { NodeAttr } from '../app/details/triggerView/types';

export interface WorkflowEditState {
    view: string;
    code: number;
    workflows: any[];
    allCINodeMap: Map<string, NodeAttr>;
    workflowId: number;
    appName: string;
    showDeleteDialog: boolean;
    showCIMenu: boolean;
    isGitOpsConfigAvailable: boolean;
    allCINodesMap: { id: number; value: any };
    hostURLConfig: HostURLConfig;
    cIMenuPosition: {
        top: number;
        left: number;
    }
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
    showMenu: boolean;
    left: number;
    top: number;
    toggleCIMenu: (event) => void;
    addCIPipeline: (type: 'EXTERNAL-CI' | 'CI' | 'LINKED-CI') => void;
}