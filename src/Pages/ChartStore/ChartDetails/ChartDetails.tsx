import { useEffect, useMemo, useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import {
    APIResponseHandler,
    BreadCrumb,
    PageHeader,
    SegmentedControl,
    SegmentedControlProps,
    SelectPickerProps,
    useAsync,
    useBreadcrumb,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartSelector } from '@Components/AppSelector'
import { URLS } from '@Config/routes'
import { getAvailableCharts } from '@Services/service'

import { ChartDetailsAbout } from './ChartDetailsAbout'
import { ChartDetailsDeploy } from './ChartDetailsDeploy'
import { ChartDetailsReadme } from './ChartDetailsReadme'
import { CHART_DETAILS_SEGMENTS } from './constants'
import { fetchChartDetails, fetchChartVersions } from './services'
import { ChartDetailsSearchParams, ChartDetailsSegment } from './types'
import { chartSelectorFilterOption, chartSelectorFormatOptionLabel, parseChartDetailsSearchParams } from './utils'

import './chartDetails.scss'

export const ChartDetails = () => {
    // STATES
    const [selectedChartVersion, setSelectedChartVersion] = useState<number>(null)

    // HOOKS
    const {
        path,
        params: { chartId },
    } = useRouteMatch<{ chartId: string; chartSegment: ChartDetailsSegment }>()

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
        if (!isFetchingChartVersions && chartVersions) {
            setSelectedChartVersion(chartVersions[0].id)
        }
    }, [isFetchingChartVersions, chartVersions])

    // CONFIGS
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':chartSegment?': null,
                ':chartId': {
                    component: (
                        <ChartSelector
                            primaryKey="chartId"
                            primaryValue="name"
                            api={getAvailableCharts}
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

    // HANDLERS
    const handleSegmentChange: SegmentedControlProps['onChange'] = (selectedSegment) => {
        updateSearchParams({ tab: selectedSegment.value as ChartDetailsSegment })
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
                        isLoading={isFetchingChartDetails}
                        error={chartDetailsErr}
                        reload={reloadChartDetails}
                    />
                )
            case ChartDetailsSegment.PRESET_VALUES:
                return <div>PRESET VALUES</div>
            case ChartDetailsSegment.DEPLOYMENTS:
                return <div>DEPLOYMENTS</div>
            default:
                return null
        }
    }

    return (
        <div className="flex-grow-1 flexbox-col bg__secondary dc__overflow-hidden">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />

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
                            <div className="flex column left top dc__gap-16 mw-none">
                                <SegmentedControl
                                    name="chart-details-segmented-control"
                                    segments={CHART_DETAILS_SEGMENTS}
                                    value={tab}
                                    onChange={handleSegmentChange}
                                />
                                {renderSegments()}
                            </div>
                            <ChartDetailsAbout isLoading={isFetchingChartDetails} chartDetails={chartDetails} />
                        </div>
                    </Route>
                </Switch>
            </APIResponseHandler>
        </div>
    )
}
