import { useEffect, useMemo, useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import {
    APIResponseHandler,
    BreadCrumb,
    PageHeader,
    SearchBar,
    SegmentedControl,
    SegmentedControlProps,
    SelectPickerProps,
    useAsync,
    useBreadcrumb,
    useStateFilters,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartSelector } from '@Components/AppSelector'
import { URLS } from '@Config/routes'
import { getAvailableCharts } from '@Services/service'

import { ChartDetailsAbout } from './ChartDetailsAbout'
import { ChartDetailsDeploy } from './ChartDetailsDeploy'
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

    const { searchKey, handleSearch, clearFilters } = useStateFilters()

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

    useEffect(() => {
        clearFilters()
    }, [tab])

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
                return <ChartDetailsPresetValues searchKey={searchKey} onClearFilters={clearFilters} />
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
                            <div className="flexbox-col dc__gap-16 mw-none">
                                <div className="flex dc__content-space">
                                    <SegmentedControl
                                        name="chart-details-segmented-control"
                                        segments={CHART_DETAILS_SEGMENTS}
                                        value={tab}
                                        onChange={handleSegmentChange}
                                    />
                                    {(tab === ChartDetailsSegment.PRESET_VALUES ||
                                        tab === ChartDetailsSegment.DEPLOYMENTS) && (
                                        <div id={CHART_DETAILS_PORTAL_CONTAINER_ID} className="flex dc__gap-8">
                                            <SearchBar
                                                containerClassName="w-250"
                                                dataTestId="chart-details-search-bar"
                                                initialSearchText={searchKey}
                                                handleEnter={handleSearch}
                                            />
                                        </div>
                                    )}
                                </div>
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
