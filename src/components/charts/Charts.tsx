import React, { lazy, useState } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { DOCUMENTATION, URLS } from '../../config'
import Deployed from './list/Deployed'
import DeploymentDetail from './deploymentDetail/DeploymentDetail'
import DiscoverCharts from './list/DiscoverCharts'
import { NavLink } from 'react-router-dom'
import './list/list.scss'
import '../app/details/appDetails/appDetails.scss'
import './charts.css'
import { RedirectWithSentry } from '../common/navigation/NavigationRoutes'
import { ErrorBoundary, AppContext } from '../common'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import { EnvType } from '../v2/appDetails/appDetails.type'

export default function Charts() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/deployments/:appId(\\d+)/env/:envId(\\d+)`} component={DeploymentDetail} />
            <Route path={`${path}/discover`} component={DiscoverCharts} />
            <Redirect to={`${path}/discover`} />
        </Switch>
    )
}

export function GenericChartsHeader({ children = null }) {
    return <div className="page-header page-header--tabs">{children}</div>
}

export function ChartDetailNavigator() {
    return (
        <ul role="tablist" className="tab-list">
            <li className="tab-list__tab">
                <NavLink replace to="discover" className="tab-list__tab-link" activeClassName="active">
                    Discover
                </NavLink>
            </li>
        </ul>
    )
}

export function HeaderTitle({ children = null }) {
    return <h1 className="page-header__title flex left">{children}</h1>
}

export function HeaderSubtitle({ children = null }) {
    return <div className="subtitle">{children}</div>
}

export function HeaderButtonGroup({ children = null }) {
    return <div className="page-header__cta-container flex right">{children}</div>
}
