export interface GraphType {
    xAxisLabel: string;
    frequency: number;
    failures: number;
    startTime: any;
    endTime: any;
}

export interface StatisticsType {
    graphs: GraphType[];
    avgFrequency: number;
    failureRate: number;
    meanLeadTime: string;
    meanRecoveryTime: string;
}