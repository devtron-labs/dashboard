import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { DOCUMENTATION, URLS, AppListConstants } from '../../config';
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png';
import Deploy from '../../assets/img/ic-checklist-app@2x.png';
import Complete from '../../assets/img/ic-empty-done@2x.png';
import { AllChartsCheck } from './AllChartsCheck';

export class AllCheckModal extends Component {

    renderCustomAppDeploy() {
        return <div className="bcg-1 mb-8 flexbox">
            <img className="img-width pt-12 pb-12 pl-16" src={Deploy} />
            <div className="pl-20 fs-13">
                <div className="pt-16 cn-9"> Create, build and deploy a custom application.</div>
                <NavLink to={`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}/${AppListConstants.CREATE_APP_URL}`} className="no-decor cb-5 fw-6">Create App</NavLink>
            </div>
        </div>
    }

    render() {
        return (
            <div className="">
                <img src={Complete} className="applist__checklist-img" />
                <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Get started!</div>
                <div className="cn-9 mb-16 fs-13"> You’re all set to get started with Devtron.</div>
                <div className="mb-8"><AllChartsCheck /></div>
                {this.renderCustomAppDeploy()}
            </div>
        )
    }
}