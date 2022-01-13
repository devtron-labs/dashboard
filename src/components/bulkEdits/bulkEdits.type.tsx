import { RouteComponentProps } from "react-router-dom";
import { SERVER_MODE_TYPE } from "../../config";

export interface CodeEditorScript {
    apiVersion: string;
    kind: string;
    spec: {
        include: {
            names: string[];
        }
        exclude: {
            names: string[];
        }
        envId: number[];
        global: boolean;
        deploymentTemplate: {
            spec: {
                patchJson: any;
            }
        }
        configMap: {
            spec: {
                names: string[];
                patchJson: any;
            }
        }
        secret: {
            spec: {
                names: string[];
                patchJson: any;
            }
        }
    }
}

export interface BulkConfiguration {
    operation: string;
    script: CodeEditorScript;
    readme: string;
}

export interface UpdatedTemplate {
    value: string;
    label: string;
}

export interface DTImpactedObjects {
    appId: number;
    appName: string;
    envId: number;
}

export interface CMandSecretImpactedObjects{
    appId: number;
    appName: string;
    envId: number;
    names: string[];
}

export interface ImpactedObjects {
    deploymentTemplate: DTImpactedObjects[];
    configMap: CMandSecretImpactedObjects[];
    secret: CMandSecretImpactedObjects[];
}

export interface DtOutputKeys {
    appId: number;
    appName: string;
    envId: number;
    message: string;
}

export interface CMandSecretOutputKeys {
    appId: number;
    appName: string;
    envId: number;
    message: string;
    names: string[];
}

export interface DTBulkOutput {
    message: string[];
    failure: DtOutputKeys[];
    successful: DtOutputKeys[];
}

export interface CMandSecretBulkOutput {
    message: string[];
    failure: CMandSecretOutputKeys[];
    successful: CMandSecretOutputKeys[];
}

export interface BulkOutput {
    deploymentTemplate: DTBulkOutput;
    configMap: CMandSecretBulkOutput;
    secret: CMandSecretBulkOutput;
}

export interface BulkEditsState {
    view: string;
    statusCode: number;
    outputName: string;
    isReadmeLoading: boolean;
    impactedObjects: ImpactedObjects;
    updatedTemplate: UpdatedTemplate[];
    readmeResult: string[];
    outputResult: BulkOutput;
    showExamples: boolean;
    showHeaderDescription: boolean;
    showImpactedtData: boolean;
    showOutputData: boolean;
    bulkConfig: BulkConfiguration[];
    codeEditorPayload: string;
}

export interface OutputTabType {
    handleOutputTabs: (e) => void;
    outputName: string;
    value: string;
    name: string;
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
    serverMode: SERVER_MODE_TYPE
}