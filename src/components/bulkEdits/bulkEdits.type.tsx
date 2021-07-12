import { RouteComponentProps } from "react-router-dom";

export interface CodeEditorScript {
    apiVersion: string;
    kind: string;
    payload: {
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

export interface ImpactedObjects {
    appId: number;
    appNames: string;
    envId: number;
}

export interface OutputKeys {
    appId: number;
    appName: string;
    envId: number;
    message: string;
}

export interface BulkOutput {
    message: string[];
    failure: OutputKeys[];
    successful: OutputKeys[];
 }

export interface BulkEditsState {
    view: string;
    statusCode: number;
    outputName: string;
    isReadmeLoading: boolean;
    impactedObjects: ImpactedObjects[];
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
}

