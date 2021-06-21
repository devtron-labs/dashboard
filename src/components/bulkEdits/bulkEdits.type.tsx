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
  editsConfig: BulkConfigType | undefined
}

export interface BulkEditsProps extends RouteComponentProps<{}> {

}