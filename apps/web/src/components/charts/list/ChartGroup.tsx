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
import { Progressing, BreadCrumb, useBreadcrumb, useAsync, PageHeader } from '@devtron-labs/devtron-fe-common-lib'
import { useRouteMatch, useHistory, useLocation, Switch, Route, Link } from 'react-router-dom'
import { getChartGroups } from '../charts.service'
import ChartGroupCard from '../util/ChartGroupCard'
import CreateChartGroup from '../modal/CreateChartGroup'
import ChartGroupUpdate from '../ChartGroupUpdate'
import ChartGroupDetails from '../ChartGroupDetails'
import ChartGroupAdvanceDeploy from '../ChartGroupAdvanceDeploy'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'

const ChartGroupList = () => {
    const [loading, result, error, reload] = useAsync(getChartGroups, [])
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'chart-store': null,
                group: { component: 'Chart Groups', linked: false },
            },
        },
        [],
    )
    const match = useRouteMatch()
    const { url } = match

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </div>
        )
    }

    const renderCreateGroupButton = () => {
        return (
            <div className="dc__page-header__cta-container flex ">
                <Link className="flex cta h-32" to={`${url}/create`}>
                    <Add className="icon-dim-18 mr-5" /> Create Group
                </Link>
            </div>
        )
    }
    return (
        <div className="chart-group-list-page bcn-0">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} renderActionButtons={renderCreateGroupButton} />
            <div className="chart-group-list-page__body">
                {loading ? (
                    <Progressing pageLoader />
                ) : (
                    <div className="chart-grid">
                        {result?.result?.groups
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((chartGroup) => <ChartGroupCard key={chartGroup.id} chartGroup={chartGroup} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ChartGroupRouter() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const { url, path } = match
    return (
        <Switch>
            <Route exact path={`${path}/create`}>
                <ChartGroupList />
                <CreateChartGroup
                    history={history}
                    location={location}
                    match={match}
                    closeChartGroupModal={() => history.push(url)}
                />
            </Route>
            <Route exact path={`${path}/:groupId/edit`} component={ChartGroupUpdate} />
            <Route exact path={`${path}/:groupId/deploy`} component={ChartGroupAdvanceDeploy} />
            <Route exact path={`${path}/:groupId`} component={ChartGroupDetails} />
            <Route>
                <ChartGroupList />
            </Route>
        </Switch>
    )
}
