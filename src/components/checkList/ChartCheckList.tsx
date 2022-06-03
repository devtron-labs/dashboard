import React, { Component } from 'react';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-chevron-down.svg';
import { ChartCheckListProps } from './checklist.type';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg';
import Uncheck from '../../assets/img/ic-success@2x.png';

export class ChartCheckList extends Component<ChartCheckListProps, {}> {

    render() {
        let { gitOps, environment, project } = this.props.chartChecklist;

        return (
            <>
                <div className="cn-9 pt-12 pb-12 fw-6">
                    <div className="fs-14">To deploy chart</div>
                </div>
                <div className="fs-13">
                    {!this.props.chartChecklist.gitOps && <NavLink to={`${URLS.GLOBAL_CONFIG_GITOPS}`} className="no-decor  mt-8 flex left" style={{ ['color']: gitOps ? `#767d84` : `#0066cc` }}>
                    Configure gitops</NavLink>}
                    {!this.props.chartChecklist.project && <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="no-decor  mt-8 flex left" style={{ ['color']: project ? `#767d84` : `#0066cc` }}>
                    Add project</NavLink>}
                    {!this.props.chartChecklist.environment && <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="no-decor mt-8 pb-8 flex left" style={{ ['color']: environment ? `#767d84` : `#0066cc` }}>
                    Add cluster & environment</NavLink>}
                </div>
            </>
        )
    }
}