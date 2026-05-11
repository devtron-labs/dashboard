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

import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import {
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getInfrastructureManagementBreadcrumb,
    PageHeader,
    Progressing,
    ROUTER_URLS,
    useAsync,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import Add from '../../../assets/icons/ic-add.svg?react'
import ChartGroupAdvanceDeploy from '../ChartGroupAdvanceDeploy'
import { ChartGroupCard } from '../ChartGroupCard'
import ChartGroupDetails from '../ChartGroupDetails'
import ChartGroupUpdate from '../ChartGroupUpdate'
import { getChartGroups } from '../charts.service'
import CreateChartGroup from '../modal/CreateChartGroup'

const pagePathPattern = `${ROUTER_URLS.CHART_STORE}/group`

const ChartGroupList = () => {
    const [loading, result] = useAsync(getChartGroups, [])
    const { breadcrumbs } = useBreadcrumb(
        pagePathPattern,
        {
            alias: {
                ...getInfrastructureManagementBreadcrumb(),
                'chart-store': null,
                discover: {
                    component: <BreadcrumbText heading="Chart Store" />,
                    linked: true,
                },
                group: { component: 'Chart Groups', linked: false },
            },
        },
        [],
    )

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} path={pagePathPattern} />
            </div>
        )
    }

    const renderCreateGroupButton = () => {
        return (
            <div className="dc__page-header__cta-container flex ">
                <Link className="flex cta h-32" to="create">
                    <Add className="icon-dim-18 mr-5" /> Create Group
                </Link>
            </div>
        )
    }
    return (
        <div className="chart-group-list-page bg__primary">
            <PageHeader
                isBreadcrumbs
                breadCrumbs={renderBreadcrumbs}
                renderActionButtons={renderCreateGroupButton}
                docPath={DOCUMENTATION.INFRA_MANAGEMENT}
            />
            <div className="chart-group-list-page__body">
                {loading ? (
                    <Progressing pageLoader />
                ) : (
                    <div className="chart-grid">
                        {result?.result?.groups
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((chartGroup) => (
                                <ChartGroupCard key={chartGroup.id} chartGroup={chartGroup} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ChartGroupRouter() {
    const navigate = useNavigate()
    const location = useLocation()
    return (
        <Routes>
            <Route
                path="create"
                element={
                    <>
                        <ChartGroupList />
                        <CreateChartGroup
                            location={location}
                            navigate={navigate}
                            params={{}}
                            closeChartGroupModal={() => navigate(-1)}
                        />
                    </>
                }
            />
            <Route path=":groupId/edit" element={<ChartGroupUpdate />} />
            <Route path=":groupId/deploy" element={<ChartGroupAdvanceDeploy />} />
            <Route path=":groupId" element={<ChartGroupDetails />} />
            <Route index element={<ChartGroupList />} />
        </Routes>
    )
}
