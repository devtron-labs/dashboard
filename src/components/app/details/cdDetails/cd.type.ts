interface DeploymentTemplateCommon {
    id: number;
    appId: number;
    isAppMetricsEnabled: boolean;
    deployed: boolean;
    deployedOn: string;
    deployedBy: number;
    emailId: string;
}

export interface DeploymentTemplateConfiguration extends DeploymentTemplateCommon {
    deploymentStatus: string;
    wfrId: number;
    workflowType: string;
}
export interface DeploymentTemplateViaTargetId extends DeploymentTemplateCommon {
    imageDescriptorTemplate: string;
    template: string;
    templateName: string;
    templateVersion: string;
}
export interface DeploymentTemplateHistoryType {
    currentConfiguration: DeploymentTemplateViaTargetId;
    baseTemplateConfiguration: DeploymentTemplateViaTargetId;
    codeEditorLoading: boolean;
}
export interface DeploymentTemplateOptions {
    label: string;
    value: string;
    author: string;
    status: string;
    workflowType: string;
}
export interface CompareWithBaseConfiguration {
    deploymentTemplatesConfiguration: DeploymentTemplateConfiguration[];
    selectedDeploymentTemplate: DeploymentTemplateOptions;
    setSeletedDeploymentTemplate: (selected) => void;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTimeStamp: string;
    baseTemplateId: string;
    setBaseTemplateId: React.Dispatch<React.SetStateAction<string>>;
}

export interface CompareViewDeploymentType {
    showTemplate: boolean;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTimeStamp: string;
    baseTemplateId: string;
    setBaseTemplateId: React.Dispatch<React.SetStateAction<string>>;
}
