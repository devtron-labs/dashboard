import React, { Component } from 'react';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import { AppCheckList } from './AppCheckList';
import { ChartCheckList } from './ChartCheckList';
import { showError, ErrorScreenManager } from '../common';
import { GlobalConfigCheckListState } from './checklist.type';
import { getAppCheckList } from '../../services/service';
import { GlobalAllCheckModal } from './GlobalAllCheckModal';
import { GlobalChartsCheck } from './GlobalChartCheck';
import { ViewType } from '../../config';
import { RouteComponentProps } from 'react-router-dom';
import './checklist.css';

export interface GlobalConfigCheckListProps extends RouteComponentProps<{}> {

}

export class GlobalConfigCheckList extends Component<GlobalConfigCheckListProps, GlobalConfigCheckListState> {

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            isChartCollapsed: true,
            isAppCollapsed: true,
            appChecklist: undefined,
            chartChecklist: undefined,
            appStageCompleted: 0,
            chartStageCompleted: 0,
        }
        this.toggleChartChecklist = this.toggleChartChecklist.bind(this);
        this.toggleAppChecklist = this.toggleAppChecklist.bind(this);
    }

    componentDidMount() {
        getAppCheckList().then((response) => {
            let appChecklist = response.result.appChecklist;
            let chartChecklist = response.result.chartChecklist;
            let appStageArray: number[] = Object.values(appChecklist);
            let chartStageArray: number[] = Object.values(chartChecklist);
            let appStageCompleted: number = appStageArray.reduce((item, sum) => {
                sum = sum + item;
                return sum;
            }, 0)
            let chartStageCompleted: number = chartStageArray.reduce((item, sum) => {
                sum = sum + item;
                return sum;
            }, 0)

            this.setState({
                view: ViewType.FORM,
                appChecklist,
                chartChecklist,
                appStageCompleted,
                chartStageCompleted,
            })
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code });
        })
    }

    toggleAppChecklist(e): void {
        this.setState({ isAppCollapsed: !this.state.isAppCollapsed });
    }

    toggleChartChecklist(e): void {
        this.setState({ isChartCollapsed: !this.state.isChartCollapsed });
    }

    renderGlobalChecklist() {
        if (this.state.appStageCompleted < 6 && this.state.chartStageCompleted < 3) {
            //(app + chart) incomplete
            return <div className="">
                <img src={Checklist} className="applist__checklist-img" />
                <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Configuration checklist</div>
                <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
                <AppCheckList appChecklist={this.state.appChecklist}
                    isAppCollapsed={this.state.isAppCollapsed}
                    appStageCompleted={this.state.appStageCompleted}
                    toggleAppChecklist={this.toggleAppChecklist} />
                <hr className="checklist__divider mt-0 mb-0" />
                <ChartCheckList chartChecklist={this.state.chartChecklist}
                    isChartCollapsed={this.state.isChartCollapsed}
                    chartStageCompleted={this.state.chartStageCompleted}
                    toggleChartChecklist={this.toggleChartChecklist} />
            </div>
        }
        else if (this.state.appStageCompleted >= 6 && this.state.chartStageCompleted >= 3) {
            //(app + chart) complete
            return <GlobalAllCheckModal />
        }
        else {
            //app incomplete, chart complete 
            return <div className="">
                <img src={Checklist} className="applist__checklist-img" />
                <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Configuration checklist</div>
                <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
                <AppCheckList appChecklist={this.state.appChecklist}
                    isAppCollapsed={this.state.isAppCollapsed}
                    appStageCompleted={this.state.appStageCompleted}
                    toggleAppChecklist={this.toggleAppChecklist} />
                <GlobalChartsCheck />
            </div>
        }
    }

    render() {
        if (this.state.view === ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.statusCode} />
        }
        else if (this.state.view !== ViewType.LOADING) {
            return <div className="mt-36 ml-20 mr-20 mb-20 global__checklist">
                {this.renderGlobalChecklist()}
            </div>
        }
        return null;
    }
}
