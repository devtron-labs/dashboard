import React, { Component } from 'react';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import './checklist.css';
import { ViewType } from '../../config'
import { AppCheckListModalState, AppCheckListModalProps } from './checklist.type';
import { AppCheckList } from './AppCheckList';
import { ChartCheckList } from './ChartCheckList'

interface GlobalConfigCheckListProps {

}
export class GlobalConfigCheckList extends Component<GlobalConfigCheckListProps, AppCheckListModalState> {

    renderAppCheckListModal() {
        return (<div>
            <img src={Checklist} className="checklist__top-img" />
            <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Configuration checklist</div>
            <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
            < AppCheckList {...this.props} isAppCollapsed={true} />
            < ChartCheckList {...this.props} isChartCollapsed={false} />
        </div>)
    }

    render() {
        return (<div className="br-4 bcn-0 p-20 applist__checklist">
            {this.renderAppCheckListModal()}
            {/* {this.renderCheckChartModal()}*/}
            {/*this.renderAllCheckSetModal()*/}
        </div>)
    }
}
