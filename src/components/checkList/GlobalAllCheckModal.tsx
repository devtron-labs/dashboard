import React, { Component } from 'react';
import { GlobalChartsCheck } from './GlobalChartCheck';
import './checklist.css';
import CustomAppDeploy from './CustomAppDeploy';
import SampleAppDeploy from './SampleAppDeploy';

export class GlobalAllCheckModal extends Component {
    render() {
        return (
            <div className="">
                <div className="cn-9 fw-6 fs-16 mb-8">Get started!</div>
                <div className="cn-9 mb-16 fs-13"> You’re all set to get started with Devtron.</div>
                <SampleAppDeploy />
                <CustomAppDeploy />
                <GlobalChartsCheck />
            </div>
        );
    }
}
