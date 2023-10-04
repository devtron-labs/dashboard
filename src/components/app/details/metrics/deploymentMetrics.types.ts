import { Moment } from "moment";
import { RouteComponentProps } from "react-router";

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

export interface DeploymentMetricsProps extends RouteComponentProps<{ appId: string; envId: string; }> {
  filteredEnvIds?: string
}

export interface Environment{
  label: string;
  value: number;
  deploymentAppDeleteRequest?: boolean
}

export interface DeploymentMetricsState {
    code: number;
    view: string;
    //used by ReactSelect Menu
    selectedEnvironment: undefined | { label: string; value: number; };
    environments: Array<Environment>;
    frequencyAndLeadTimeGraph: {
        startTime: number;
        endTime: number;
        frequency: number;
        failures: number;
        success: number;
        maxLeadTime: number;
        xAxisLabel: string;
    }[];
    recoveryTimeGraph: { recoveryTime: number }[]
    rows: any[],
    avgFrequency: number;
    maxFrequency: number;
    totalDeployments: number;
    failedDeployments: number;
    frequencyBenchmark: any;

    failureRate: number;
    failureRateBenchmark: any;

    meanLeadTime: number;
    meanLeadTimeLabel: string;
    leadTimeBenchmark: any;

    meanRecoveryTime: number;
    meanRecoveryTimeLabel: string;
    recoveryTimeBenchmark: any;

    statusFilter: number;

    benchmarkModalData: {
        metric: "DEPLOYMENT_FREQUENCY" | "LEAD_TIME" | "RECOVERY_TIME" | "FAILURE_RATE";
        valueLabel: string;
        catgory: string;
        value: number;
    } | undefined;

    startDate: Moment;
    endDate: Moment;
    focusedInput: any;
    filterBy: {
        startDate: undefined | Moment;
        endDate: undefined | Moment;
    };
    deploymentTableView: string;
    filteredEnvironment: Array<Environment>;
}