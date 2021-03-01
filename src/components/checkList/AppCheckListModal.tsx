import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg';
import { URLS } from '../../config';
import img from '../../assets/img/ic-checklist-chart@2x.png';
import './checklist.css';
import { ViewType } from '../../config'
import Complete from '../../assets/img/ic-empty-done@2x.png';
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png';
import Deploy from '../../assets/img/ic-checklist-app@2x.png';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { AppCheckListModalState, AppCheckListModalProps } from './checklist.type';
import { getAppCheckList } from './checklist.service';
import { Progressing, showError } from '../common';
import  Uncheck from '../../assets/img/ic-success@2x.png';
import { AppCheckList } from './AppCheckList';
import { ChartCheckList }from './ChartCheckList'

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

export class AppCheckListModal extends Component<AppCheckListModalProps, AppCheckListModalState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            isAppCollapsed: true,
            isChartCollapsed: false,
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


    renderAppCheckListModal() {
        return (<div>
            <img src={Checklist} className="checklist__top-img" />
            <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Let’s get you started!</div>
            <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
            < AppCheckList {...this.props}/>
            < ChartCheckList {...this.props}/>            
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