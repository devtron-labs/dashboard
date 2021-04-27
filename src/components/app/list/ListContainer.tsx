import React, { Component } from 'react'
import AppListContainer from './AppListContainer'
import { ListContainerProps, ListContainerState } from './types';
import { ReactComponent as Check } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Dropdown } from '../../../assets/icons/appstatus/ic-dropdown.svg'
import { URLS } from '../../../config';
import { AppListViewType } from '../config';
import ExternalListContainer from './ExternalListContainer';

export default class ListContainer extends React.Component<ListContainerProps, ListContainerState> {
    constructor(props) {
        super(props)

        this.state = {
            collapsed: false,
            code: 0,
            view: AppListViewType.LOADING,
        }
    }

    renderListHeader(){
        // const path = this.props.match.path;
        return <>hi
        {/* <ul role="tablist" className="tab-list">
        <li className="tab-list__tab ellipsis-right">
            <NavLink activeClassName="active" to={`${path}/scans`} className="tab-list__tab-link">Security Scans</NavLink>
        </li>
        <li className="tab-list__tab">
            <NavLink activeClassName="active" to={`${path}/policies`} className="tab-list__tab-link">Security Policies</NavLink>
        </li>
    </ul> */}
        </>
    }

    render() {
        {console.log(this.props)}
        return (
            <div>
                {this.renderListHeader()}
                {/* <AppListContainer /> */}
                {/* <ExternalListContainer {...this.props} /> */}

            </div>
        )
    }
}
