import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { DOCUMENTATION, URLS } from '../../config';
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png';
import Deploy from '../../assets/img/ic-checklist-app@2x.png';
import Complete from '../../assets/img/ic-empty-done@2x.png';
import { AllChartsCheck } from './AllChartsCheck';

export class AllCheckModal extends Component {

    renderCustomAppDeploy() {
        return <div className="bcg-1 mb-8 flexbox">
            <img className="img-width pt-12 pb-12 pl-16" src={Deploy} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Create, build and deploy a custom application.</div>
                <NavLink to={`${URLS.APP}/create-app`} className="no-decor cb-5 fw-6">Create App</NavLink>
            </div>
        </div>
    }

    renderSampleApplication() {
        return <div className="bcg-1 mb-8 mt-8 flexbox">
            <img className="img-width pt-12 pb-12 pl-16" src={Sample} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Deploy sample “Hello world” application.</div>
                <a href={DOCUMENTATION.APP_CREATE} target="_blank" className="no-decor cb-5 fw-6">View documentation</a>
            </div>
        </div>
    }

    render() {
        return (
            <div className="">
                <img src={Complete} className="applist__checklist-img" />
                <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Get started!</div>
                <div className="cn-9 mb-16"> You’re all set to get started with Devtron.</div>
                <AllChartsCheck />
                {this.renderSampleApplication()}
                {this.renderCustomAppDeploy()}
            </div>
        )
    }
}