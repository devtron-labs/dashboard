import React, { Component } from 'react'
import { Switch, Route, Redirect, NavLink, RouteComponentProps } from 'react-router-dom'
import { SecurityPoliciesTab } from './SecurityPoliciesTab'
import { SecurityScansTab } from './SecurityScansTab'
import './security.css'
import { DOCUMENTATION, SERVER_MODE, SERVER_MODE_TYPE } from '../../config'
import EAEmptyState, { EAEmptyStateType } from '../common/eaEmptyState/EAEmptyState'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import PageHeader from '../common/header/PageHeader'

interface SecurityProps extends RouteComponentProps<{}> {
    serverMode: SERVER_MODE_TYPE
}

export class Security extends Component<SecurityProps> {
    renderRouter() {
        const path = this.props.match.path
        return (
            <Switch>
                <Route path={`${path}/scans`} component={SecurityScansTab} />
                <Route path={`${path}/policies`} component={SecurityPoliciesTab} />
                <Redirect to={`${path}/scans`} />
            </Switch>
        )
    }

    renderSecurityTabs = () => {
        const path = this.props.match.path
        return (
            <>
                <ul role="tablist" className="tab-list">
                    <li className="tab-list__tab ellipsis-right">
                        <NavLink activeClassName="active" to={`${path}/scans`} className="tab-list__tab-link">
                            Security Scans
                        </NavLink>
                    </li>
                    <li className="tab-list__tab">
                        <NavLink activeClassName="active" to={`${path}/policies`} className="tab-list__tab-link">
                            Security Policies
                        </NavLink>
                    </li>
                </ul>
            </>
        )
    }

    renderPageheader() {
        return (
            <PageHeader
                headerName="Security"
                isTippyShown={true}
                tippyRedirectLink={DOCUMENTATION.SECURITY}
                showTabs={true}
                renderHeaderTabs={this.renderSecurityTabs}
            />
        )
    }

    renderEmptyStateForEAOnlyMode = () => {
        return (
            <div style={{ height: 'calc(100vh - 250px)' }}>
                <EAEmptyState
                    title={'Integrated DevSecOps'}
                    msg={
                        'Enable security scanning to identify vulnerabilities in your container and protect from external attacks. Manage security policies to allow or block specific vulnerabilities.'
                    }
                    stateType={EAEmptyStateType.SECURITY}
                    knowMoreLink={DOCUMENTATION.SECURITY}
                />
            </div>
        )
    }

    render() {
        return (
            <>
                {this.renderPageheader()}
                {this.props.serverMode === SERVER_MODE.EA_ONLY
                    ? this.renderEmptyStateForEAOnlyMode()
                    : this.renderRouter()}
            </>
        )
    }
}
