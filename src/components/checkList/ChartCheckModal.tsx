import React, { Component } from 'react';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import { AppCheckList } from './AppCheckList';
import { ChartCheckList } from './ChartCheckList'
import { ChartCheckListModalProps, ChartCheckListModalState } from './checklist.type';
import { AllChartsCheck } from './AllChartsCheck';
import { AllCheckModal } from './AllCheckModal';
import { ErrorScreenManager, showError } from '../common';
import { getAppCheckList } from '../../services/service';
import { ViewType } from '../../config';
import './checklist.css';

export class ChartCheckListModal extends Component<ChartCheckListModalProps, ChartCheckListModalState> {

    constructor(props) {
        super(props);
        this.state = {
            statusCode: 0,
            view: ViewType.LOADING,
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
            this.setState({ statusCode: error.code, view: ViewType.ERROR, });
        })
    }

    toggleAppChecklist(e): void {
        this.setState({ isAppCollapsed: !this.state.isAppCollapsed });
    }

    toggleChartChecklist(e): void {
        this.setState({ isChartCollapsed: !this.state.isChartCollapsed });
    }

    renderChartChecklist() {
        if (this.state.appStageCompleted < 6 && this.state.chartStageCompleted < 3) {
            //(app + chart) incomplete
            return <>
                <AppCheckList appChecklist={this.state.appChecklist}
                    isAppCollapsed={this.state.isAppCollapsed}
                    appStageCompleted={this.state.appStageCompleted}
                    toggleAppChecklist={this.toggleChartChecklist} />
                <ChartCheckList chartChecklist={this.state.chartChecklist}
                    isChartCollapsed={this.state.isChartCollapsed}
                    chartStageCompleted={this.state.chartStageCompleted}
                    toggleChartChecklist={this.toggleChartChecklist}
                />
            </>
        }
        else if (this.state.appStageCompleted >= 6 && this.state.chartStageCompleted >= 3) {
            //(app + chart) complete
            return <AllCheckModal />
        }
        else {
            //app incomplete, chart complete 
            return <>
                <AppCheckList appChecklist={this.state.appChecklist}
                    isAppCollapsed={this.state.isAppCollapsed}
                    appStageCompleted={this.state.appStageCompleted}
                    toggleAppChecklist={this.toggleChartChecklist} />
                <AllChartsCheck />
            </>
        }
    }

    render() {
        if (this.state.view === ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.statusCode} />
        }
        else if (this.state.view !== ViewType.LOADING) {
            return (
                <div className="br-4 bcn-0 p-20 applist__checklist">
                    <div>
                        <img src={Checklist} className="checklist__top-img" />
                        <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Let’s get you started!</div>
                        <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
                        {this.renderChartChecklist()}
                    </div>
                </div>
            )
        }
        return null;
    }
}