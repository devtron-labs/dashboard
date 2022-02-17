import { RouteComponentProps } from 'react-router';

export interface MaterialListProps extends RouteComponentProps<{ appId: string; }> {
    respondOnSuccess: () => void;
    isWorkflowEditorUnlocked: boolean;
}

export interface GitMaterialType {
    id?: number;
    name?: string;
    gitProvider: { id: number; name: string };
    url: string;
    checkoutPath: string;
    active: boolean;
    fetchSubmodules: boolean;
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
        fetchSubmodules: boolean;
    };
    isCollapsed: boolean;
    isChecked: boolean;
    isLoading: boolean;
    isError: MaterialError;
    showSaveModal: boolean;
}

interface MaterialError {
    gitProvider: undefined | string;
    url: undefined | string;
    checkoutPath: undefined | string;
}

export interface UpdateMaterialState {
    material: GitMaterialType;
    isCollapsed: boolean;
    isChecked: boolean;
    isLoading: boolean;
    isError: MaterialError;
}

export interface MaterialViewProps {
    isMultiGit: boolean;
    isChecked: boolean;
    material: GitMaterialType;
    isCollapsed: boolean;
    isLoading: boolean;
    isError: MaterialError;
    providers: any[];
    handleProviderChange: (selected, url) => void;
    handleCheckoutPathCheckbox: (event) => void;
    handleUrlChange: (event) => void;
    handlePathChange: (event) => void;
    toggleCollapse: (event) => void;
    save: (event) => void;
    cancel: (event) => void;
    isWorkflowEditorUnlocked : boolean;
    handleSubmoduleCheckbox:(event) => void;
    appId?: number;
    reload: ()=> void;
}

export interface MaterialViewState {
    deleting: boolean;
    confirmation: boolean;
}