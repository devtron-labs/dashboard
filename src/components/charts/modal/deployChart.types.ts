import { ChartValuesType } from '../charts.types';

export interface DeployChartProps
//  extends RouteComponentProps<{ chartId: string }>
 {
    appStoreVersion: number;
    chartValuesFromParent: ChartValuesType;
    installedAppVersion?: number;
    chartIdFromDeploymentDetail?: number;
    versions?: Map<number, { id: number, version: string }>;
    valuesYaml?: string;
    rawValues?:string;
    environmentId?: number;
    teamId?: number;
    installedAppId?: number;
    onHide?: any;
    chartName?: string;
    name?: string;
    readme?: string;
    appName?: string;
    deprecated?: boolean;
    appStoreId?: number;
    installedAppVersionId?: number;
}

export interface TextAreaProps {
    val: string;
    onChange?: any
    callbackRef?: any;
}