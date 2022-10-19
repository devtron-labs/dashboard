import React from 'react';
import { ServerError } from '../../modals/commonTypes';
import { ConfigOverrideWorkflowDetails } from '../../services/service.types';
import { CustomNavItemsType } from '../app/details/appConfig/appConfig.type';
import { CiPipeline, CiPipelineResult, WorkflowType } from '../app/details/triggerView/types';
import { CIPipelineDataType, DockerConfigOverrideType, FormType } from '../ciPipeline/types';
import { ComponentStates } from '../EnvironmentOverride/EnvironmentOverrides.type';

export interface ArgsFieldSetProps {
    args: { key: string, value: string }[];
    addMoreArgs: () => void;
    removeArgs: (index: number) => void;
    saveArgs: (event: React.ChangeEvent, key: string, index: number) => void;
}

export interface DockerRegistry {
    id: string;
    registryUrl: string;
    isDefault: boolean;
}

export interface CIConfigState {
    registryOptions: Array<DockerRegistry>;

    buttonLabel: string;
    code: number;
    errors: ServerError[],
    successMessage: string | null;

    view: string;
    configStatus: number;
    sourceConfigData: {
        appName: string,
        material: {id:number, name:string, checkoutPath: string}[];
    };
    form: {
        id: number;
        appId: number | null;
        checkoutPath: string;
        dockerFilePath: string;
        args: Array<{ key: string, value: string }>;
        dockerRegistry: string;
        dockerRepository: string;
        dockerfile: string;
    },
    version: string;
    isUnsaved:boolean;
    showDialog: boolean;
}

export interface ProcessedWorkflowsType {
    processing: boolean
    workflows: WorkflowType[]
}

export interface CIConfigParentState {
    loadingState: ComponentStates
    selectedCIPipeline: CIPipelineDataType
    dockerRegistries: any
    sourceConfig: any
    ciConfig: CiPipelineResult
    defaultDockerConfigs: DockerConfigOverrideType
}

export interface CIConfigProps {
    respondOnSuccess: () => void
    configOverrideView?: boolean
    allowOverride?: boolean
    parentState?: CIConfigParentState
    setParentState?: React.Dispatch<React.SetStateAction<CIConfigParentState>>
    updateDockerConfigOverride?: (key, value) => void
    isCDPipeline?: boolean
    isCiPipeline?: boolean
    navItems?: CustomNavItemsType[]
}

export interface CIConfigDiffViewProps {
    ciConfig: CiPipelineResult
    configOverridenPipelines: CiPipeline[]
    configOverrideWorkflows: ConfigOverrideWorkflowDetails[]
    processedWorkflows: ProcessedWorkflowsType
    toggleConfigOverrideDiffModal: () => void
}

export interface CIConfigFormProps {
    dockerRegistries: any
    sourceConfig: any
    ciConfig: CiPipelineResult
    reload: () => Promise<void>
    appId: string
    selectedCIPipeline: CIPipelineDataType
    configOverrideWorkflows: ConfigOverrideWorkflowDetails[]
    configOverrideView: boolean
    allowOverride: boolean
    updateDockerConfigOverride: (key, value) => void
    isCDPipeline: boolean
    isCiPipeline: boolean
    navItems: CustomNavItemsType[]
}

export interface AdvancedConfigOptionsProps {
    ciPipeline: CIPipelineDataType
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    setDockerConfigOverridden: React.Dispatch<React.SetStateAction<boolean>>
} 