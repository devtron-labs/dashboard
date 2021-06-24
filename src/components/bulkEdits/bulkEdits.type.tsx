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
    isGlobal : boolean;
    patchJson: string;
}

export interface BulkEditsState {
    view: string
    ImpactedObjectList: string ;
    outputList: OutputList[] 
    showObjectsOutputDrawer: boolean;
    readmeResult;
    showExamples: boolean;
    showHeaderDescription: boolean;
    showOutputData: boolean
}

export enum OutputObjectTabs {
    OUTPUT = "Output",
    IMPACTED_OBJECTS = "Impacted objects"
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
}