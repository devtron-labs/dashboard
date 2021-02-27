import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg';
import { URLS } from '../../config';
import img from '../../assets/img/ic-checklist-chart@2x.png';
import './checklist.css'

export class AppCheckList extends Component {

    renderAllChartInputModal() {
       return  <div className="bcg-1 flexbox">
            <img className="img-width pt-12 pb-12 pl-16 " src={img} />
            <div className="pl-20">
                <div className="pt-20 cn-9"> Deploy charts using Devtron.</div>
                <NavLink to={`${URLS.CHARTS}/discover`} className="no-decor cb-5 fw-6">Discover charts</NavLink>
            </div>
        </div>
    }
    render() {
        return (<div className="br-4 bcn-0 p-20 applist__checklist">
            <img src={Checklist} className="checklist__img" />
            <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Let’s get you started!</div>
            <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
            <div className="checklist__custom-input cn-9 pt-12 pb-12 fw-6">To deploy custom application (2/6 completed)</div>
            <div className="checklist__custom-input ">
                <NavLink to={`${URLS.GLOBAL_CONFIG_HOST_URL}`} className="no-decor cb-5 mt-8 flexbox"><span><Check className="ic-dim-16 mr-8" /></span>Add host URL</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_GITOPS}`} className="no-decor cb-5 mt-8 flexbox"><span><Check className="ic-dim-16 mr-8" /></span>Configure GitOps</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="no-decor cn-5 mt-8 flexbox"><span><Check className="ic-dim-16 mr-8" /></span>Add Git account</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_DOCKER}`} className="no-decor cb-5 mt-8 flexbox"><span><Check className="ic-dim-16 mr-8" /></span>Add docker registry</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="no-decor cn-5 mt-8 flexbox"><span><Check className="ic-dim-16 mr-8" /></span>Add cluster & environment</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor cb-5 mt-8 pb-8 flexbox"><span><Check className="ic-dim-16 mr-8" /></span>Add project</NavLink>
            </div>
            <div className="cn-9 pt-12 pb-12 fw-6">To deploy chart (0/3 completed)</div>
               {/* {this.renderAllChartInputModal()}*/}
        </div>)
    }
}