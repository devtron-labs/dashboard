import React, { Component } from 'react';
import { GlobalChartsCheck } from './GlobalChartCheck';
import './checklist.css';
import CustomAppDeploy from './CustomAppDeploy';
import SampleAppDeploy from './SampleAppDeploy';
import { DEPLOY_CHART_MESSAGING } from './constants';

export class GlobalAllCheckModal extends Component {
    render() {
        return (
            <div className="">
                <div className="cn-9 fw-6 fs-16 mb-8">{DEPLOY_CHART_MESSAGING.GET_STARTED}</div>
                <div className="cn-9 mb-16 fs-13"> {DEPLOY_CHART_MESSAGING.ALL_SET}</div>
                <SampleAppDeploy />
                <CustomAppDeploy />
                <GlobalChartsCheck />
            </div>
        );
    }
}
