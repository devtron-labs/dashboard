import React, { Component } from 'react';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-chevron-down.svg';
import { AppCheckListProps, AppCheckListState } from './checklist.type';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg';
import Uncheck from '../../assets/img/ic-success@2x.png';
import './checklist.css';

export class AppCheckList extends Component<AppCheckListProps, AppCheckListState> {

    render() {
        let { gitOps, project, git, environment, docker, hostUrl } = this.props.appChecklist;

        return <>
            <div className="cn-9 pt-12 pb-12 fw-6">
                <p className="m-0 fs-14">To deploy custom application</p>
            </div>
            <div className="fs-13">
                {this.props.showDivider && <hr className="checklist__divider mt-0 mb-0" />}
                {!hostUrl && <NavLink to={`${URLS.GLOBAL_CONFIG_HOST_URL}`} className="no-decor mt-8 flex left" style={{ ['color']: hostUrl ? `#767d84` : `#0066cc` }} >
                    {!hostUrl ? <img src={Uncheck} className="icon-dim-16 flex mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Add host URL</NavLink>}
                {!gitOps && <NavLink to={`${URLS.GLOBAL_CONFIG_GITOPS}`} className="no-decor  mt-8 flex left" style={{ ['color']: gitOps ? `#767d84` : `#0066cc` }}>
                    {!gitOps ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Configure gitops</NavLink>}
                {!project && <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor  mt-8 flex left" style={{ ['color']: project ? `#767d84` : `#0066cc` }}>
                    {!project ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Add project</NavLink>}
                {!environment && <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="no-decor mt-8 flex left" style={{ ['color']: environment ? `#767d84` : `#0066cc` }}>
                    {!environment ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Add cluster & environment</NavLink>}
                {!git && <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="no-decor mt-8 flex left" style={{ ['color']: git ? `#767d84` : `#0066cc` }}>
                    {!git ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Add git account</NavLink>}
                {!docker && <NavLink to={`${URLS.GLOBAL_CONFIG_DOCKER}`} className="no-decor mt-8 pb-8 flex left" style={{ ['color']: docker ? `#767d84` : `#0066cc` }}>
                    {!docker ? <img src={Uncheck} className="icon-dim-16 mr-8" /> : <Check className="icon-dim-16 mr-8" />}
                    Add container registry</NavLink>}
            </div>
        </>
    }
}