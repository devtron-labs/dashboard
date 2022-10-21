import React, { Component } from 'react';
import { ChartCheckListProps } from './checklist.type';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';

export class ChartCheckList extends Component<ChartCheckListProps, {}> {

    render() {
        let { environment, project } = this.props.chartChecklist;

        return (
            <>
                <div className="cn-9 pt-12 pb-12 fw-6">
                    <div className="fs-14">To deploy chart</div>
                </div>
                <div className="fs-13">
                    {!this.props.chartChecklist.project && <NavLink to={`${URLS.GLOBAL_CONFIG_PROJECT}`} className="dc__no-decor  mt-8 flex left" style={{ ['color']: project ? `var(--N500)` : `var(--B500)` }}>
                    Add project</NavLink>}
                    {!this.props.chartChecklist.environment && <NavLink to={`${URLS.GLOBAL_CONFIG_CLUSTER}`} className="dc__no-decor mt-8 pb-8 flex left" style={{ ['color']: environment ? `var(--N500)` : `var(--B500)` }}>
                    Add cluster & environment</NavLink>}
                </div>
            </>
        )
    }
}