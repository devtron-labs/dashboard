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
import { AppCheckListState, AppCheckListProps } from './checklist.type';
import { getAppCheckList } from './checklist.service';
import { Progressing, showError } from '../common';
import  Uncheck from '../../assets/img/ic-success@2x.png';

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

export class AppCheckList extends Component<AppCheckListProps, AppCheckListState> {
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
        this.toggleAppCheckbox = this.toggleAppCheckbox.bind(this);
        this.toggleChartCheckbox = this.toggleChartCheckbox.bind(this);
    }

    componentDidMount() {
        this.fetchAppCheckList()
    }

    fetchAppCheckList() {
        getAppCheckList().then((response) => {
            let appCheckList = response.result
            this.setState({
                view: ViewType.FORM,
                saveLoading: false,
                form: appCheckList,
            }, (() => { console.log(this.state) }))
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code });
        })
    }

    toggleAppCheckbox() {
        this.setState({
            isAppCollapsed: !this.state.isAppCollapsed,
        })
    }

    toggleChartCheckbox() {
        this.setState({
            isChartCollapsed: !this.state.isChartCollapsed,
        })
    }

    renderAppCheckListModal() {
        return (<div>
            <img src={Checklist} className="checklist__top-img" />
            <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Let’s get you started!</div>
            <div className="cn-9 mb-16">Complete the required configurations to perform desired task</div>
            <div className="checklist__custom-input cursor cn-9 pt-12 pb-12 fw-6 flex" onClick={this.toggleAppCheckbox}>
                <div>To deploy custom application (2/6 completed)</div>
                <span className="checklist__dropdown "><Dropdown className="icon-dim-20 rotate " style={{ ['--rotateBy' as any]: '180deg' }} /></span>
            </div>
            {this.state.isAppCollapsed ? <div className="checklist__custom-input ">
                <NavLink to={`${URLS.GLOBAL_CONFIG_HOST_URL}`} className="no-decor cb-5 mt-8 flex left">
                    {!this.state.form.appChecklist.hostUrl ? <img src={Uncheck} className="icon-dim-16 flex mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add host URL</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_GITOPS}`} className="no-decor cb-5 mt-8 flex left">
                    {!this.state.form.appChecklist.gitOps ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Configure GitOps</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="no-decor cn-5 mt-8 flex left">
                    {!this.state.form.appChecklist.git ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add Git account</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_DOCKER}`} className="no-decor cb-5 mt-8 flex left">
                    {!this.state.form.appChecklist.docker ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add docker registry</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="no-decor cn-5 mt-8 flex left">
                    {!this.state.form.appChecklist.environment ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add cluster & environment</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor cb-5 mt-8 pb-8 flex left">
                    {!this.state.form.appChecklist.project ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add project</NavLink>
            </div> : ''}
            <div className="flex cn-9 pt-12 pb-12 fw-6" onClick={this.toggleChartCheckbox}>
                <div>To deploy chart (0/3 completed)</div>
                <span className="checklist__dropdown"><Dropdown className="icon-dim-20 rotate " /></span>
            </div>
            {this.state.isChartCollapsed ? <div className="checklist__custom-input ">
                <NavLink to={`${URLS.GLOBAL_CONFIG_HOST_URL}`} className="no-decor cb-5 mt-8 flex left">
                    {!this.state.form.chartChecklist.gitOps ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className=" icon-dim-16 mr-8" />}
                    Configure GitOps</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_GITOPS}`} className="no-decor cb-5 mt-8 flex left">
                    {!this.state.form.chartChecklist.environment ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add cluster & environment</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor cb-5 mt-8 pb-8 flex left">
                    {!this.state.form.chartChecklist.project ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add project</NavLink>
            </div> : ''}
        </div>)
    }

    renderCheckChartModal() {
        return <div className="bcg-1 flexbox ">
            <img className="img-width pt-12 pb-12 pl-16 " src={img} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Deploy charts using Devtron.</div>
                <NavLink to={`${URLS.CHARTS}/discover`} className="no-decor cb-5 fw-6">Discover charts</NavLink>
            </div>
        </div>
    }

    renderCustomAppDeploy() {
        return <div className="bcg-1 mb-8 flexbox">
            <img className="img-width pt-12 pb-12 pl-16 " src={Deploy} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Create, build and deploy a custom application.</div>
                <NavLink to={`${URLS.APP}/create-app`} className="no-decor cb-5 fw-6">Create App</NavLink>
            </div>
        </div>
    }

    renderSampleApplication() {
        return <div className="bcg-1 mb-8 flexbox">
            <img className="img-width pt-12 pb-12 pl-16 " src={Sample} />
            <div className="pl-20">
                <div className="pt-16 cn-9"> Deploy sample “Hello world” application.</div>
                <NavLink to={`${URLS.CHARTS}/discover`} className="no-decor cb-5 fw-6">View documentation</NavLink>
            </div>
        </div>
    }

    renderAllCheckSetModal() {
        return (<div className="">
            <img src={Complete} className="checklist__top-img" />
            <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Get started!</div>
            <div className="cn-9 mb-16"> You’re all set to get started with Devtron.</div>
            {this.renderSampleApplication()}
            {this.renderCustomAppDeploy()}
            {this.renderCheckChartModal()}
        </div>)
    }

    render() {
        return (<div className="br-4 bcn-0 p-20 applist__checklist">
            {this.renderAppCheckListModal()}
            {/* {this.renderCheckChartModal()}*/}
            {this.renderAllCheckSetModal()}
        </div>)
    }
}