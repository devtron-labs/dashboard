import { RouteComponentProps } from 'react-router';

export interface AppCheckList{
    gitOps: boolean;
    project: boolean;
    git: boolean;
    environment: boolean;
    docker: boolean;
    hostUrl: boolean;}

export interface ChartChecklist{
    gitOps: boolean;
    project: boolean;
    environment: boolean;
}

export interface AppCheckListState{
    view: string;
    statusCode: number;
    isAppCollapsed: boolean;
    isChartCollapsed: boolean;
    saveLoading: boolean;
    form:{
        appChecklist: AppCheckList,
        chartChecklist: ChartChecklist
    }
}

export interface AppCheckListProps extends RouteComponentProps { }