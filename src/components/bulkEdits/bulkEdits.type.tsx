import { RouteComponentProps } from "react-router-dom";

export interface BulkEditResponse {
    task: string
    payload: OutputList[]
    readme: ""
}

export interface OutputList {
    appNameIncludes: string;
    appNameExcludes: string;
    envId: number;
    isGlobal: boolean;
    patchJson: string;
}

export interface CodeEditorScript {
    apiVersion: string;
    kind: string;
    payload: {
        include: {
            name: string;
        }
        exclude: {
            name: string;
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
    task:string;
    script: CodeEditorScript;
    readme: string;
}

export interface UpdatedTemplate {
    value: number,
    label: string
}

export interface BulkEditsState {
    view: string;
    statusCode: number;
    ImpactedObjectList: string;
    ImpactedObjectsConfig: string;
    outputList: OutputList[]
    updatedTemplate: UpdatedTemplate[],
    showObjectsOutputDrawer: boolean;
    readmeResult: undefined;
    showExamples: boolean;
    showHeaderDescription: boolean;
    showOutputData: boolean;
    bulkConfig: BulkConfiguration[];
    codeEditorPayload: string;
}

export enum OutputObjectTabs {
    OUTPUT = "Output",
    IMPACTED_OBJECTS = "Impacted objects"
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
}