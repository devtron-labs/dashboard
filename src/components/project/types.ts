import { RouteComponentProps } from "react-router-dom";

export interface ProjectListProps extends RouteComponentProps<{}>{
    isSuperAdmin: boolean;
}
export interface ProjectListState {
    code: number;
    loadingData: boolean;
    view: string;
    projects: Array<ProjectType>;
    isValid: {
        name: boolean;
    },
    errorMessage: {
        name: string;
    }
}

export interface ProjectType {
    id: number;
    name: string;
    active: boolean;
    isCollapsed: boolean;
}