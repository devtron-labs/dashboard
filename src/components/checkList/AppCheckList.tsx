import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Checklist from '../../assets/img/ic-empty-checklist.png';
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg';
import { URLS } from '../../config';
import img from '../../assets/img/ic-checklist-chart@2x.png';
import './checklist.css';
import Complete from '../../assets/img/ic-empty-done@2x.png';
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png';
import Deploy from '../../assets/img/ic-checklist-app@2x.png';

export class AppCheckList extends Component {

    renderAppCheckListModal(){
        return(<div>
            <img src={Checklist} className="checklist__top-img" />
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
        </div>)
    }

    renderCheckChartModal() {
       return  <div className="bcg-1 flexbox ">
            <img className="img-width pt-12 pb-12 pl-16 " src={img} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Deploy charts using Devtron.</div>
                <NavLink to={`${URLS.CHARTS}/discover`} className="no-decor cb-5 fw-6">Discover charts</NavLink>
            </div>
        </div>
    }

    renderCustomAppDeploy(){
        return  <div className="bcg-1 mb-8 flexbox">
            <img className="img-width pt-12 pb-12 pl-16 " src={Deploy} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Create, build and deploy a custom application.</div>
                <NavLink to={`${URLS.APP}/create-app`} className="no-decor cb-5 fw-6">Create App</NavLink>
            </div>
        </div>
    }

    renderSampleApplication(){
        return  <div className="bcg-1 mb-8 flexbox">
            <img className="img-width pt-12 pb-12 pl-16 " src={Sample} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Deploy sample “Hello world” application.</div>
                <NavLink to={`${URLS.CHARTS}/discover`} className="no-decor cb-5 fw-6">View documentation</NavLink>
            </div>
        </div>
    }

    renderAllCheckSetModal(){
        return(<div className="">
            <img src={Complete} className="checklist__top-img"/>
            <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Get started!</div>
            <div className="cn-9 mb-16"> You’re all set to get started with Devtron.</div>
            {this.renderSampleApplication()}
            {this.renderCustomAppDeploy()}
            {this.renderCheckChartModal()}
        </div>)
    }

   

    render() {
        return (<div className="br-4 bcn-0 p-20 applist__checklist">
             {/*{this.renderAppCheckListModal()}*/}
             {/* {this.renderCheckChartModal()}*/}
             {this.renderAllCheckSetModal()}
        </div>)
    }
}