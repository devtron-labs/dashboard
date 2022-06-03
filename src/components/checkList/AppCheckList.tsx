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
        let { project, git, environment, docker, hostUrl } = this.props.appChecklist;

        return <>
            <div className="cn-9 pt-12 pb-12 fw-6">
                <p className="m-0 fs-14">To deploy custom application</p>
            </div>
            <div className="fs-13">
                {!hostUrl && <NavLink to={`${URLS.GLOBAL_CONFIG_HOST_URL}`} className="no-decor mt-8 flex left" style={{ ['color']: hostUrl ? `#767d84` : `#0066cc` }} >
                    Add host URL</NavLink>}
                {!project && <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor  mt-8 flex left" style={{ ['color']: project ? `#767d84` : `#0066cc` }}>
                    Add project</NavLink>}
                {!environment && <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="no-decor mt-8 flex left" style={{ ['color']: environment ? `#767d84` : `#0066cc` }}>
                    Add cluster & environment</NavLink>}
                {!git && <NavLink to={`${URLS.GLOBAL_CONFIG_GIT}`} className="no-decor mt-8 flex left" style={{ ['color']: git ? `#767d84` : `#0066cc` }}>
                    Add git account</NavLink>}
                {!docker && <NavLink to={`${URLS.GLOBAL_CONFIG_DOCKER}`} className="no-decor mt-8 pb-8 flex left" style={{ ['color']: docker ? `#767d84` : `#0066cc` }}>
                    Add container registry</NavLink>}
            </div>
        </>
    }
}