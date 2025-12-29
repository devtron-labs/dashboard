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

import { useEffect, useMemo, useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import {
    APIResponseHandler,
    BreadCrumb,
    ComponentSizeType,
    DOCUMENTATION,
    getInfrastructureManagementBreadcrumb,
    handleAnalyticsEvent,
    PageHeader,
    SegmentedControl,
    SegmentedControlProps,
    SelectPickerProps,
    useAsync,
    useBreadcrumb,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartSelector } from '@Components/AppSelector'
import { getChartSelectAPI } from '@Components/charts/charts.util'
import { URLS } from '@Config/routes'

import { ChartDetailsAbout } from './ChartDetailsAbout'
import { ChartDetailsDeploy } from './ChartDetailsDeploy'
import { ChartDetailsDeployments } from './ChartDetailsDeployments'
import { ChartDetailsPresetValues } from './ChartDetailsPresetValues'
import { ChartDetailsReadme } from './ChartDetailsReadme'
import { CHART_DETAILS_PORTAL_CONTAINER_ID, CHART_DETAILS_SEGMENTS } from './constants'
import { fetchChartDetails, fetchChartVersions } from './services'
import { ChartDetailsRouteParams, ChartDetailsSearchParams, ChartDetailsSegment } from './types'
import { chartSelectorFilterOption, chartSelectorFormatOptionLabel, parseChartDetailsSearchParams } from './utils'

import './chartDetails.scss'

export const ChartDetails = () => {
    // STATES
    const [selectedChartVersion, setSelectedChartVersion] = useState<number>(null)

    // HOOKS
    const {
        path,
        params: { chartId },
    } = useRouteMatch<ChartDetailsRouteParams>()

    const { tab, updateSearchParams } = useUrlFilters<void, ChartDetailsSearchParams>({
        parseSearchParams: parseChartDetailsSearchParams,
    })

    // ASYNC CALLS
    const [isFetchingChartVersions, chartVersions, chartVersionsErr, reloadChartVersions] = useAsync(
        () => fetchChartVersions(chartId),
        [chartId],
    )

    const [isFetchingChartDetails, chartDetails, chartDetailsErr, reloadChartDetails] = useAsync(
        () => fetchChartDetails(selectedChartVersion),
        [selectedChartVersion],
        !!selectedChartVersion,
        { resetOnChange: false },
    )

    useEffect(() => {
        if (!isFetchingChartVersions && chartVersions?.length) {
            setSelectedChartVersion(chartVersions[0].id)
        }
    }, [isFetchingChartVersions, chartVersions])

    // CONFIGS
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ...getInfrastructureManagementBreadcrumb(),
                discover: {
                    component: 'Chart Store',
                    linked: true,
                },
                ':chartSegment?': null,
                ':chartId': {
                    component: (
                        <ChartSelector
                            primaryKey="chartId"
                            primaryValue="name"
                            api={getChartSelectAPI}
                            matchedKeys={[]}
                            apiPrimaryKey="id"
                            formatOptionLabel={chartSelectorFormatOptionLabel}
                            filterOption={chartSelectorFilterOption}
                        />
                    ),
                    linked: false,
                },
                chart: null,
                'chart-store': null,
            },
        },
        [chartId],
    )

    const chartOptions = useMemo(
        () =>
            (chartVersions ?? []).map(({ id, version }) => ({
                label: version.startsWith('v') ? version : `v${version}`,
                value: id,
            })),
        [JSON.stringify(chartVersions)],
    )

    // CONSTANTS
    const isChartDetailsLoading = isFetchingChartDetails || !chartDetails

    // HANDLERS
    const handleSegmentChange: SegmentedControlProps['onChange'] = (selectedSegment) => {
        const updatedTab = selectedSegment.value as ChartDetailsSegment

        if (updatedTab === ChartDetailsSegment.PRESET_VALUES) {
            handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_CHART_PRESET_VALUES' })
        }

        updateSearchParams({ tab: updatedTab })
    }

    const handleChartChange: SelectPickerProps<number>['onChange'] = ({ value }) => {
        setSelectedChartVersion(value)
    }

    // RENDERERS
    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    const renderSegments = () => {
        switch (tab) {
            case ChartDetailsSegment.README:
                return (
                    <ChartDetailsReadme
                        chartName={chartDetails?.name}
                        readme={chartDetails?.readme}
                        chartsOptions={chartOptions}
                        selectedChartVersion={selectedChartVersion}
                        onChartChange={handleChartChange}
                        isLoading={isChartDetailsLoading}
                        error={chartDetailsErr}
                        reload={reloadChartDetails}
                    />
                )
            case ChartDetailsSegment.PRESET_VALUES:
                return <ChartDetailsPresetValues />
            case ChartDetailsSegment.DEPLOYMENTS:
                return <ChartDetailsDeployments chartIcon={chartDetails?.icon} />
            default:
                return null
        }
    }

    return (
        <div className="flex-grow-1 flexbox-col bg__secondary dc__overflow-hidden">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} docPath={DOCUMENTATION.INFRA_MANAGEMENT} />

            <APIResponseHandler
                isLoading={isFetchingChartVersions}
                progressingProps={{ pageLoader: true }}
                error={chartVersionsErr}
                errorScreenManagerProps={{ code: chartVersionsErr?.code, reload: reloadChartVersions }}
            >
                <Switch>
                    <Route path={`${path}${URLS.DEPLOY_CHART}/:presetValueId?`}>
                        <ChartDetailsDeploy
                            chartDetails={chartDetails}
                            chartVersions={chartVersions}
                            selectedChartVersion={selectedChartVersion}
                        />
                    </Route>
                    <Route>
                        <div className="chart-details flex-grow-1 p-20 dc__overflow-auto">
                            <div className="flexbox-col dc__gap-16 mw-none">
                                <div id={CHART_DETAILS_PORTAL_CONTAINER_ID} className="flex dc__content-space">
                                    <SegmentedControl
                                        name="chart-details-segmented-control"
                                        segments={CHART_DETAILS_SEGMENTS}
                                        value={tab}
                                        onChange={handleSegmentChange}
                                        size={ComponentSizeType.xs}
                                    />
                                </div>
                                {renderSegments()}
                            </div>
                            <ChartDetailsAbout isLoading={isChartDetailsLoading} chartDetails={chartDetails} />
                        </div>
                    </Route>
                </Switch>
            </APIResponseHandler>
        </div>
    )
}
