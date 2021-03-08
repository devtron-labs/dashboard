import { RouteComponentProps } from 'react-router';

export interface MaterialListProps extends RouteComponentProps<{ appId: string; }> {
    respondOnSuccess: () => void;
}

export interface GitMaterialType {
    id?: number;
    name?: string;
    gitProvider: { id: number; name: string };
    url: string;
    checkoutPath: string;
    active: boolean;
}


export interface MaterialListState {
    statusCode: number;
    view: string;
    materials: GitMaterialType[];
    providers: any[];
    configStatus: number;
}

export interface CreateMaterialState {
    material: {
        gitProvider: { id: number; name: string };
        url: string;
        checkoutPath: string;
        active: boolean;
    };
    isCollapsed: boolean;
    isLoading: boolean;
    isError: MaterialError;
}

interface MaterialError {
    gitProvider: undefined | string;
    url: undefined | string;
    checkoutPath: undefined | string;
}

export interface UpdateMaterialState {
    material: GitMaterialType;
    isCollapsed: boolean;
    isLoading: boolean;
    isError: MaterialError;
}

export interface MaterialViewProps {
    isMultiGit: boolean;
    material: GitMaterialType;
    isCollapsed: boolean;
    isLoading: boolean;
    isError: MaterialError;
    providers: any[];
    handleProviderChange: (selected) => void;
    handleUrlChange: (event) => void;
    handlePathChange: (event) => void;
    toggleCollapse: (event) => void;
    save: (event) => void;
    cancel: (event) => void;
}

export interface MaterialViewState{
    isChecked: boolean
}