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
    value: string,
    label: string
}

export interface ImpactedObjects {
    appId: number;
    appNames: string;
    envId: number;
}

export interface BulkOutput {
    MESSAGE: any,
    FAILURE: any,
    SUCCESSFULL: any
 
 }

 export interface FailureOutput {
     appId: number;
     appName: string,
     envId: number;
     message: string;
 }

export interface BulkEditsState {
    view: string;
    empty: string;
    statusCode: number;
    outputName: string;
    isReadmeLoading: boolean;
    impactedObjects: ImpactedObjects[];
    bulkOutputMessage: BulkOutput[];
    failueOutput: FailureOutput[];
    succesfullOutput:FailureOutput[];
    updatedTemplate: UpdatedTemplate[];
    readmeResult: string[];
    showExamples: boolean;
    showHeaderDescription: boolean;
    showOutputData: boolean;
    bulkConfig: BulkConfiguration[];
    codeEditorPayload: string;
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
}

export interface OutputTabType {
    handleOutputTabs: (e) => void;
    outputName: string;
    value: string;
    name: string;
}