import { RouteComponentProps } from 'react-router';
import { HostURLConfig } from '../../services/service.types';

export interface ExternalCIPipelineState {
    code: number;
    view: string;
    showError: boolean;
    loadingData: boolean;
    form: {
        name: string;
        args: { key: string, value: string }[];
        materials: MaterialType[],
        triggerType: string;
        externalCiConfig: string;
    },
    ciPipeline: {
        id: number,
        ciMaterial: any[],
        dockerArgs: any,
        active: true,
        externalCiConfig: {
            id: number;
            accessKey: string;
            payload: string;
            webhookUrl: string;
        };
        isExternal: boolean,
        isManual: boolean,
        name: string,
        linkedCount: number;
    },
    gitMaterials: { gitMaterialId: number, materialName: string }[];
    showDeleteModal: boolean;
    showDockerArgs: boolean;
    hostURLConfig: HostURLConfig;
}

export interface CIPipelineState {
    code: number;
    view: string;
    showError: boolean;
    loadingData: boolean;
    form: {
        name: string;
        args: { key: string, value: string }[];
        materials: MaterialType[],
        triggerType: string;
        scanEnabled?: boolean;
        beforeDockerBuildScripts: { id: number; name: string, outputLocation: string; script: string, isCollapsed: boolean, index: number }[];
        afterDockerBuildScripts: { id: number; name: string, outputLocation: string; script: string, isCollapsed: boolean, index: number }[];
    },
    ciPipeline: {
        id: number,
        ciMaterial: any[],
        dockerArgs: any,
        parentCiPipeline?: number; //required in case of linked CI
        parentAppId?: number//required in case of linked CI
        active: true,
        externalCiConfig: any,
        isExternal: boolean,
        isManual: boolean,
        name: string,
        linkedCount: number;
        scanEnabled?: boolean;
    },
    sourcePipelineURL?: string; //required Linked CI
    gitMaterials: { gitMaterialId: number, materialName: string }[];
    showDeleteModal: boolean;
    showDockerArgs: boolean;
    showPreBuild: boolean;
    showDocker: boolean;
    showPostBuild: boolean;
}


export interface LinkedCIPipelineState {
    view: string;
    showError: boolean;
    loadingData: boolean;
    apps: { id: number, name: string }[];
    ciPipelines: any[];
    loadingPipelines: boolean;
    form: {
        parentAppId: number;
        parentCIPipelineId: number;
        name: string;
    };
    isValid: {
        parentAppId: boolean;
        parentCIPipelineId: boolean;
        name: boolean;
    };
}


export interface Material {
    source: { type: string, value: string };
    gitMaterialId: number;
    isSave: boolean;
}

export interface MaterialType {
    name: string;
    type: string;
    value: string;
    gitMaterialId: number;
    id: number;
    isSelected: boolean;
}

export interface CIPipelineProps extends RouteComponentProps<{ appId: string, ciPipelineId: string, workflowId: string }> {
    appName: string;
    connectCDPipelines: number;
    getWorkflows: () => void;
    close: () => void;
}

export const PatchAction = {
    CREATE: 0,
    UPDATE_SOURCE: 1,
    DELETE: 2,
}