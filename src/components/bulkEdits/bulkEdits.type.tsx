import { RouteComponentProps } from "react-router-dom";

export interface BulkConfigType {
    name?: string;
    id?: number;
    url?: string;
    config: {
        type: string;
        id: string;
        name: string;
        config: string; //YAML string
    },
    active?: boolean;
}

export interface BulkEditsState {
  editsConfig: BulkConfigType | undefined;
  showImpactedObjects: boolean;
  readmeResult;
  showExamples: boolean;
  showHeaderDescription: boolean;
}

export enum OutputObjectTabs {
    OUTPUT = "Output",
    IMPACTED_OBJECTS = "Impacred objects"
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
}