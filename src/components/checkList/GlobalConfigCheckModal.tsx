import React, { Component } from 'react';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import { AppCheckList } from './AppCheckList';
import { ChartCheckList } from './ChartCheckList';
import { showError } from '../common';
import { GlobalConfigCheckListState } from './checklist.type';
import { getAppCheckList } from '../../services/service';
import './checklist.css';
import { GlobalAllCheckModal } from './GlobalAllCheckModal';
import { GlobalChartsCheck } from './GlobalChartCheck';

interface GlobalConfigCheckListProps {



}

export class GlobalConfigCheckList extends Component<GlobalConfigCheckListProps, GlobalConfigCheckListState> {

    constructor(props) {
        super(props);
        this.state = {
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
                // view: ViewType.FORM,
                appChecklist,
                chartChecklist,
                appStageCompleted,
                chartStageCompleted,
            })
        }).catch((error) => {
            showError(error);
            // this.setState({ view: ViewType.ERROR, });
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
            return <>
                <ChartCheckList chartChecklist={this.state.chartChecklist}
                    isChartCollapsed={this.state.isChartCollapsed}
                    chartStageCompleted={this.state.chartStageCompleted}
                    toggleChartChecklist={this.toggleChartChecklist} />
                <AppCheckList appChecklist={this.state.appChecklist}
                    isAppCollapsed={this.state.isAppCollapsed}
                    appStageCompleted={this.state.appStageCompleted}
                    toggleAppChecklist={this.toggleAppChecklist} />
            </>
        }
        else if (this.state.appStageCompleted >= 6 && this.state.chartStageCompleted >= 3) {
            //(app + chart) complete
            return <GlobalAllCheckModal />

        }
        else {
            //app incomplete, chart complete 
            return <>
                <GlobalChartsCheck />
                <AppCheckList appChecklist={this.state.appChecklist}
                    isAppCollapsed={this.state.isAppCollapsed}
                    appStageCompleted={this.state.appStageCompleted}
                    toggleAppChecklist={this.toggleAppChecklist} />
            </>
        }
    }

    render() {
        return (<div className="br-4 bcn-0 p-20 global__checklist">
            {/* {this.renderAppCheckListModal()} */}
            <div className="">
                <img src={Checklist} className="checklist__top-img" />
                <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Configuration checklist</div>
                <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
                {this.renderGlobalChecklist()}
            </div>
        </div>)
    }
}
