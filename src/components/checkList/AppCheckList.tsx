import React, { Component } from 'react';
import ChecklistImg from '../../assets/img/ic-empty-checklist.png';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { ViewType } from '../../config'
import { AppCheckListProps, AppCheckListState } from './checklist.type';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import  Uncheck from '../../assets/img/ic-success@2x.png';
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg';
import { getAppCheckList } from './checklist.service';
import { Progressing, showError } from '../common';

const DefaultAppCheckList = {
    gitOps: false,
    project: false,
    git: false,
    environment: false,
    docker: false,
    hostUrl: false,
}

export class AppCheckList extends Component<AppCheckListProps, AppCheckListState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            isAppCollapsed: this.props.isAppCollapsed,
            saveLoading: false,
            form: {
                appChecklist: {
                    ...DefaultAppCheckList
                },
            }
        }
        this.toggleAppCheckbox = this.toggleAppCheckbox.bind(this)
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

    render() {
        let { gitOps, project, git, environment, docker, hostUrl } = this.state.form.appChecklist;
        return (<>
            <div className="checklist__custom-input cursor cn-9 pt-12 pb-12 fw-6 flex" onClick={this.toggleAppCheckbox}>
                <div>To deploy custom application (2/6 completed)</div>
                <span className="checklist__dropdown "><Dropdown className="icon-dim-20 rotate " style={{ ['--rotateBy' as any]: this.state.isAppCollapsed ?  '180deg' : '0deg' }} /></span>
            </div>
            {this.state.isAppCollapsed ? <div className="checklist__custom-input ">
                <NavLink to={`${URLS.GLOBAL_CONFIG_HOST_URL}`} className="no-decor mt-8 flex left" style = {{ ['color'] : hostUrl ? `#767d84` : `#0066cc`}} >
                    {!this.state.form.appChecklist.hostUrl ? <img src={Uncheck} className="icon-dim-16 flex mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add host URL</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_GITOPS}`} className="no-decor  mt-8 flex left" style = {{ ['color'] : gitOps ? `#767d84` : `#0066cc`}}>
                    {!this.state.form.appChecklist.gitOps ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Configure GitOps</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="no-decor mt-8 flex left" style = {{ ['color'] : git ? `#767d84` : `#0066cc`}}>
                    {!this.state.form.appChecklist.git ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add Git account</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_DOCKER}`} className="no-decor mt-8 flex left" style = {{ ['color'] : docker ? `#767d84` : `#0066cc`}}>
                    {!this.state.form.appChecklist.docker ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add docker registry</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="no-decor mt-8 flex left" style = {{ ['color'] : environment ? `#767d84` : `#0066cc`}}>
                    {!this.state.form.appChecklist.environment ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add cluster & environment</NavLink>
                <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor  mt-8 pb-8 flex left" style = {{ ['color'] : project ? `#767d84` : `#0066cc`}}>
                    {!this.state.form.appChecklist.project ? <img src={Uncheck} className="icon-dim-16 mr-8"/> : <Check className="icon-dim-16 mr-8" />}
                    Add project</NavLink>
            </div> : ''}
            </>

        )
    }
}