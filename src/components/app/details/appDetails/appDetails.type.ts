export enum AppMetricsTab {
    Aggregate = 'aggregate',
    Pod = 'pod'
}

export enum ChartType {
    Cpu = 'cpu',
    Ram = 'ram',
    Status = 'status',
    Latency = 'latency'
}

export enum StatusType {
    status5xx = '5xx',
    status4xx = '4xx',
    status2xx = '2xx',
    Throughput = 'Throughput',
}

export enum CalendarFocusInput {
    StartDate = "startDate",
    EndDate = "endDate",
}

export type AppMetricsTabType = 'aggregate' | 'pod';
export type ChartTypes = 'cpu' | 'ram' | 'status' | 'latency';
export type StatusTypes = '5xx' | '4xx' | '2xx' | 'Throughput';
export type CalendarFocusInputType = 'startDate' | 'endDate';

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