interface DeploymentTemplateCommon {
    appId: number;
    deployed: boolean;
    deployedOn: string;
    emailId: string;
    id: number;
}

export interface DeploymentTemplateConfiguration extends DeploymentTemplateCommon {
    isAppMetricsEnabled: boolean;
    template: string;
    templateName: string;
    templateVersion: string;
    imageDescriptorTemplate: string;
    targetEnvironment: string
}

export interface DeploymentTemplateHistoryType {
    currentConfiguration: DeploymentTemplateConfiguration;
    baseTemplateConfiguration: DeploymentTemplateConfiguration;
    codeEditorLoading: boolean;
}

export interface DeploymentTemplateViaTargetResponse extends DeploymentTemplateCommon {
    deployedBy: number;
    pipelineId: number;
    deploymentStatus: string;
    wfrId: number;
    workflowType: string;
}
export interface DeploymentTemplateOptions {
    label: string;
    value: string;
    author: string;
    status: string;
    workflowType: string;
}
export interface CompareWithBaseConfiguration {
    deploymentTemplatesConfiguration: DeploymentTemplateViaTargetResponse[];
    selectedDeploymentTemplate: DeploymentTemplateOptions;
    setSeletedDeploymentTemplate: (selected) => void;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTimeStamp: string;
    baseTemplateId: number;
    setBaseTemplateId: React.Dispatch<React.SetStateAction<number>>;
}

export interface CompareViewDeploymentType {
    showTemplate: boolean;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTimeStamp: string;
    baseTemplateId: number;
    setBaseTemplateId: React.Dispatch<React.SetStateAction<number>>;
}
