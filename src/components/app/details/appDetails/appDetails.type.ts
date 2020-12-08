 export enum AppMetricsTab {
    Aggregate = 'aggregate',
    Pod = 'pod'
}

export type AppMetricsTabType = 'aggregate' | 'pod';
export type ChartTypes = 'cpu' | 'ram' | 'status' | 'throughput' | 'latency';
export type ThroughputType = '5xx' | '4xx' | '2xx' | 'Throughput'
export interface AppDetailsPathParams {
    appId: string;
    envId?: string;
}
export interface SecurityVulnerabilititesProps {
    imageScanDeployInfoId: number;
    severityCount: {
        critical: number;
        moderate: number;
        low: number;
    };
    onClick: () => void;
}