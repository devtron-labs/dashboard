import { RouteComponentProps } from "react-router-dom";


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
    impactedObjectList: "";
    outputList: [];
    updatedTemplate: UpdatedTemplate[];
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