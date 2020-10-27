export interface ProjectListState {
    code: number;
    loadingData: boolean;
    view: string;
    projects: Array<ProjectType & { isCollapsed: boolean }>;
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
}