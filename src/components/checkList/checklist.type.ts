import { RouteComponentProps } from 'react-router';

export interface AppCheckList {
    gitOps: boolean;
    project: boolean;
    git: boolean;
    environment: boolean;
    docker: boolean;
    hostUrl: boolean;
}


export interface AppCheckListState {

}

export interface ChartCheckList {
    gitOps: boolean;
    project: boolean;
    environment: boolean;
}

export interface ChartCheckListState {
    view: string;
    statusCode: number;
    isChartCollapsed: boolean;
    saveLoading: boolean;
    form: {
        chartChecklist: ChartCheckList;
    }
}

export interface AppCheckListModalState {
    isAppCollapsed: boolean;
    isChartCollapsed: boolean;
}

export interface ChartCheckListModalState {
    isLoading: boolean;
    isAppCreated: boolean;
    isAppCollapsed: boolean;
    isChartCollapsed: boolean;
    appStageCompleted: number;
    chartStageCompleted: number;
    appChecklist: AppCheckList,
    chartChecklist: ChartCheckList
}

export interface AppCheckListModalProps extends RouteComponentProps {
    appStageCompleted: number;
    chartStageCompleted: number;
    appChecklist: AppCheckList;
    chartChecklist: ChartCheckList;
}

export interface ChartCheckListModalProps extends RouteComponentProps {

}

export interface GlobalConfigCheckListProps extends RouteComponentProps<{}> {
    isLoading: boolean;
    isAppCreated: boolean;
    appChecklist: AppCheckList;
    chartChecklist: ChartCheckList;
    appStageCompleted: number;
    chartStageCompleted: number;
}

export interface GlobalConfigCheckListState {
    isChartCollapsed: boolean;
    isAppCollapsed: boolean;
}
export interface AppCheckListProps {
    showDivider: boolean;
    appChecklist: AppCheckList;
    appStageCompleted: number;
    isAppCollapsed: boolean;
    toggleAppChecklist: (event) => void;
}

export interface ChartCheckListProps {
    isChartCollapsed: boolean;
    chartChecklist: ChartCheckList;
    chartStageCompleted: number;
    showDivider: boolean;
    toggleChartChecklist: (event) => void;
}