import React, { Component } from 'react';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import './checklist.css';
import { AppCheckList } from './AppCheckList';
import { ChartCheckList } from './ChartCheckList'
import { ViewType } from '../../config'
import { ChartCheckListModalProps, ChartCheckListModalState } from './checklist.type';

const DefaultAppCheckList = {
    gitOps: false,
    project: false,
    git: false,
    environment: false,
    docker: false,
    hostUrl: false,
}

const DefaultChartCheckList = {
    gitOps: false,
    project: false,
    environment: false,
}

export class ChartCheckListModal extends Component<ChartCheckListModalProps, ChartCheckListModalState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            isAppCollapsed: false,
            isChartCollapsed: true,
            saveLoading: false,
            form: {
                appChecklist: {
                    ...DefaultAppCheckList
                },
                chartChecklist: {
                    ...DefaultChartCheckList
                }
            }
        }
    }

    renderChartCheckListModal() {
        return (<div>
            <img src={Checklist} className="checklist__top-img" />
            <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Let’s get you started!</div>
            <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
            < ChartCheckList {...this.props}  isChartCollapsed={true} />
            < AppCheckList {...this.props} isAppCollapsed={false} />
        </div>)
    }

    render() {
        return (<div className="br-4 bcn-0 p-20 applist__checklist">
            {this.renderChartCheckListModal()}
            {/* {this.renderCheckChartModal()}*/}
            {/*this.renderAllCheckSetModal()*/}
        </div>)
    }
}