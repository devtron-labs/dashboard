import { RouteComponentProps } from 'react-router';

export interface DiscoverChartDetailsProps extends RouteComponentProps<{ chartId: string }> {
}



export interface DeploymentProps {
    icon?: string;
    chartName?: string;
    name?: string;
    chartId: string;
    appStoreApplicationName?: string;
    deprecated: boolean;
    availableVersions: Map<number, { id, version }>;
}