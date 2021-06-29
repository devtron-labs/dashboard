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

export interface BulkConfiguration {
   apiVersion: string;
   kind: string;
   payload: {
       include: {
           name: string;
       }
       exclude: {
        name: string;
    }
    envId:number[];
    isGlobal: boolean;
    deploymentTemplate: {
        spec: {
            patchJson: string;
        }
    }
   }
}

export interface BulkEditsState {
    view: string;
    statusCode: number;
    ImpactedObjectList: string;
    outputList: OutputList[]
    showObjectsOutputDrawer: boolean;
    readmeResult: undefined;
    showExamples: boolean;
    showHeaderDescription: boolean;
    showOutputData: boolean;
    bulkConfig: BulkConfiguration;
}

export enum OutputObjectTabs {
    OUTPUT = "Output",
    IMPACTED_OBJECTS = "Impacted objects"
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
}