/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { Route, Switch, Redirect, NavLink } from 'react-router-dom'
import DiscoverCharts from './list/DiscoverCharts'
import './list/list.scss'
import '../app/details/appDetails/appDetails.scss'
import './charts.scss'
import { useRouteMatch } from 'react-router'

export default function Charts({ isSuperAdmin }: { isSuperAdmin: boolean }) {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/discover`} render={() => <DiscoverCharts isSuperAdmin={isSuperAdmin} />} />
            <Redirect to={`${path}/discover`} />
        </Switch>
    )
}

export const GenericChartsHeader = ({ children = null }) => {
    return <div className="dc__page-header dc__page-header__tabs">{children}</div>
}

export const ChartDetailNavigator = () => {
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

export const HeaderTitle = ({ children = null }) => {
    return <h1 className="dc__page-header__title flex left">{children}</h1>
}

export const HeaderSubtitle = ({ children = null }) => {
    return <div className="subtitle">{children}</div>
}

export const HeaderButtonGroup = ({ children = null }) => {
    return <div className="dc__page-header__cta-container flex right">{children}</div>
}
