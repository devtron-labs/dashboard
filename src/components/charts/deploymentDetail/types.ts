import { RouteComponentProps } from 'react-router';

interface DeploymentDetails {
    deploymentId: string;
    environmentId: string;
}
export interface DeploymentDetailProps extends RouteComponentProps<DeploymentDetails> {

}

export interface DeploymentDetailState {
    view: string;
    isMore: boolean;
    environmentId: string | null;
    info: any;
    pods: any[];
    services: any[];
    ingress: any[];
    isDetailedView: boolean;
    selectedEventLogTab: string;
    podId: number;
    containerName: string;
    podMap: any;
    loadingChartVersionDetails: boolean;
    installedConfig: any;
}