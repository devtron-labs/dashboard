import { RouteComponentProps } from 'react-router';

export interface MaterialListProps extends RouteComponentProps<{ appId: string; }> {
    configStatus: number;
    respondOnSuccess: () => void;
}

export interface GitMaterialType {
    id?: number;
    name?: string;
    gitProvider: { id: number; name: string };
    url: string;
    checkoutPath: string;
}

export interface MaterialListState {
    statusCode: number;
    view: string;
    materials: GitMaterialType[];
    providers: any[];
    configStatus: number;
}

export type CreateMaterialState = {
    gitProvider: { id: number; name: string };
    url: string;
    checkoutPath: string;
    isCollapsed: boolean;
    isLoading: boolean;
}

export type UpdateMaterialState = GitMaterialType & { isCollapsed: boolean; isLoading: boolean; }

export interface MaterialViewProps {
    isMultiGit: boolean;
    material: UpdateMaterialState;
    providers: any[];
    handleProviderChange: (selected) => void;
    handleUrlChange: (event) => void;
    handlePathChange: (event) => void;
    toggleCollapse: (event) => void;
    save: (event) => void;
    cancel: (event) => void;
    isCheckoutPathValid;
}