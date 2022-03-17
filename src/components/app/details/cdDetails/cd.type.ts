export interface DeploymentTemplateConfiguration {
    appId: number;
    deployed: boolean;
    deployedOn: string;
    emailId: string;
    id: number;
    isAppMetricsEnabled: boolean;
    template: string;
    templateName: string;
    templateVersion: string;
    imageDescriptorTemplate: string;
}

export interface DeploymentTemplateHistoryType {
    currentConfiguration: DeploymentTemplateConfiguration;
     baseTemplateConfiguration: DeploymentTemplateConfiguration;
     codeEditorLoading: boolean;
}

export interface DeploymentTemplateDiffRes {
    appId: number;
    deployed: boolean;
    deployedBy: number;
    deployedOn: string;
    emailId: string;
    id: string;
    pipelineId: number;
    deploymentStatus: string;
    wfrId: number;
    workflowType: string
}

export interface CompareWithBaseConfiguration {
    deploymentTemplatesConfiguration: DeploymentTemplateDiffRes[];
    selectedDeploymentTemplate: { label: string; value: string; author: string; status: string ; workflowType: string};
    setSeletedDeploymentTemplate: (selected) => void;
    setShowTemplate: React.Dispatch<React.SetStateAction<boolean>>;
    baseTemplateId: number | string
    setBaseTemplateId: React.Dispatch<React.SetStateAction<string | number>>;

}