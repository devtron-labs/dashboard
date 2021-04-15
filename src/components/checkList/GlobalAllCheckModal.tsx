import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { DOCUMENTATION, URLS } from '../../config';
import { GlobalChartsCheck } from './GlobalChartCheck';
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png';
import Deploy from '../../assets/img/ic-checklist-app@2x.png';
import './checklist.css';

export class GlobalAllCheckModal extends Component {

    renderCustomAppDeploy() {
        return <div className="bcn-0 mb-8 br-4">
            <img className="img-width pt-12 pl-16" src={Deploy} />
            <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                <div className="cn-9">Create, build and deploy a custom application.</div>
                <NavLink to={`${URLS.APP}/create-app`} className="no-decor cb-5 fw-6">Create App</NavLink>
            </div>
        </div>
    }

    renderSampleApplication() {
        return <div className="bcn-0 mb-8 br-4">
            <img className="img-width pt-12 pl-16" src={Sample} />
            <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                <div className="cn-9">Deploy sample “Hello world” application.</div>
                <a href={DOCUMENTATION.APP_CREATE} target="_blank" rel="noopener noreferer" className="no-decor cb-5 fw-6">View documentation</a>
            </div>
        </div>
    }

    render() {
        return <div className="">
            <div className="cn-9 fw-6 fs-16 mb-8">Get started!</div>
            <div className="cn-9 mb-16 fs-13"> You’re all set to get started with Devtron.</div>
            {this.renderCustomAppDeploy()}
            {this.renderSampleApplication()}
            <GlobalChartsCheck />
        </div>
    }
}