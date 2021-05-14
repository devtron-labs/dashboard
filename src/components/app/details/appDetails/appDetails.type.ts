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

export interface ScalePodsNameType {
    name: {
        isChecked: boolean;
        value: "CHECKED" | "INTERMEDIATE"
    }
}

export interface ScalePodsList {
    kind: string;
    name: string;
}

export interface ScalePodsObjectList {
    scalePodsList: ScalePodsList[];
    objectToRestoreList: ScalePodsList[];
}

export interface ScalePodsToZero {
    rollout: {
        isChecked: boolean;
        value: "CHECKED" | "INTERMEDIATE";
    },
    horizontalPodAutoscaler: {
        isChecked: boolean;
        value: "CHECKED" | "INTERMEDIATE";
    },
    deployment: {
        isChecked: boolean;
        value: "CHECKED" | "INTERMEDIATE";
    }
}

export interface ScaleToZero {
    kind: string;
    name: string;
    isChecked: boolean;
    value: "INTERMEDIATE" | "CHECKED";
}

export interface ScalePodName {
    name: {
        isChecked: boolean;
        value: "INTERMEDIATE" | "CHECKED";
    }
}
export interface ExternalAppScaleModalState {
    view: string;
    scalePodsToZero: ScaleToZero[];
    objectToRestore: ScaleToZero[];
    scalePodName: ScalePodName;
    objectToRestoreName: ScalePodName;
    scalePodLoading: boolean;
    objectToRestoreLoading: boolean;
    showRestore: boolean;
}

export interface ExternalAppScaleModalProps {
    onClose: () => void
}