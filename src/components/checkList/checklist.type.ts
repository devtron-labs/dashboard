import { RouteComponentProps } from 'react-router';

export interface AppCheckList{
    gitOps: boolean;
    project: boolean;
    git: boolean;
    environment: boolean;
    docker: boolean;
    hostUrl: boolean;
    }


export interface AppCheckListState{
    view: string;
    statusCode: number;
    isAppCollapsed: boolean;
    saveLoading: boolean;
    form:{
        appChecklist: AppCheckList;
    }
}

export interface ChartCheckList{
    gitOps: boolean;
    project: boolean;
    environment: boolean;
}

export interface ChartCheckListState{
    view: string;
    statusCode: number;
    isChartCollapsed: boolean;
    saveLoading: boolean;
    form:{
        chartChecklist: ChartCheckList;
    }
}

export interface AppCheckListModalState{
    view: string;
    statusCode: number;
    saveLoading: boolean;
    
}

export interface ChartCheckListModalState{
    view: string;
    statusCode: number;
    isAppCollapsed: boolean;
    isChartCollapsed: boolean;
    saveLoading: boolean;
    form:{
        appChecklist: AppCheckList,
        chartChecklist: ChartCheckList
    }
}

export interface AppCheckListModalProps extends RouteComponentProps { }
export interface ChartCheckListModalProps extends RouteComponentProps { }
export interface AppCheckListProps extends RouteComponentProps { isAppCollapsed : boolean }
export interface ChartCheckListProps extends RouteComponentProps { isChartCollapsed : boolean }

