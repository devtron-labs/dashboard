import { RouteComponentProps } from 'react-router';

export interface AppCheckListState{
    isCollapsed: boolean;
    isChartCollapsed: boolean;

}

export interface AppCheckListProps extends RouteComponentProps { }