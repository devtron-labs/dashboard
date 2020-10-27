export type AppMetricsTabType = 'aggregate' | 'pod';
export type ChartTypes = 'cpu' | 'ram' | 'status' | 'throughput' | 'latency';
export type ThroughputType = '5xx' | '4xx' | '2xx' | 'Throughput'
export type MetricsType = 'pod' | 'aggregate';
export interface AppDetailsPathParams {
    appId: string;
    envId?: string;
}