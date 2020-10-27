import { RouteComponentProps } from 'react-router';

export interface ArtifactsProps extends RouteComponentProps<{ appId: string }> {
    configStatus: number;
    respondOnSuccess: () => void;
}

export interface Material {
    id: number;
    name: string;
    url: string;
    gitProviderId: number;
    checkoutPath: string;
    providers: any[];
}

export interface ArtifactsState {
    configStatus: number;
    code: number;
    view: string;
    materials: Array<Material & { isCollapsed: boolean; }>;
    materialsFromResponse: Material[];
    loadingData: boolean;
}
