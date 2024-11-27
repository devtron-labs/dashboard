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

import React, { useState, useEffect } from 'react'
import { Route, Switch, useRouteMatch, useParams, useHistory } from 'react-router-dom'
import {
    showError,
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    useEffectAfterMount,
    PageHeader,
    versionComparatorBySortOrder,
    ToastManager,
    ToastVariantType,
    MarkDown,
} from '@devtron-labs/devtron-fe-common-lib'
import { List } from '../../common'
import { URLS } from '../../../config'
import { getChartVersionsMin, getChartVersionDetails, getChartValuesCategorizedListParsed } from '../charts.service'
import { getAvailableCharts } from '../../../services/service'
import { DiscoverChartDetailsProps, DeploymentProps } from './types'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import fileIcon from '../../../assets/icons/ic-file.svg'
import { About } from './About'
import { ChartDeploymentList } from './ChartDeploymentList'
import { getSavedValuesListURL, getChartValuesURL } from '../charts.helper'
import { ChartSelector } from '../../AppSelector'
import { DeprecatedWarn } from '../../common/DeprecatedUpdateWarn'
import './DiscoverChartDetails.scss'
import ChartValuesView from '../../v2/values/chartValuesDiff/ChartValuesView'
import { ChartInstalledConfig, ChartKind } from '../../v2/values/chartValuesDiff/ChartValuesView.type'
import { ChartValuesType } from '../charts.types'

const DiscoverDetailsContext = React.createContext(null)
export function useDiscoverDetailsContext() {
    const context = React.useContext(DiscoverDetailsContext)
    if (!context) {
        throw new Error(`Chart Detail Context Not Found`)
    }
    return context
}

function mapById(arr) {
    if (!Array.isArray(arr)) {
        throw Error('parameter is not an array')
    }
    return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map())
}

const DiscoverChartDetails: React.FC<DiscoverChartDetailsProps> = ({ match, history, location }) => {
    const [selectedVersion, selectVersion] = React.useState(null)
    const [availableVersions, setChartVersions] = React.useState([])
    const [chartInformation, setChartInformation] = React.useState({
        appStoreApplicationName: '',
        deprecated: false,
        chartName: '',
        name: '',
    })
    const [chartYaml, setChartYaml] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [chartValuesList, setChartValuesList] = useState([])
    const [chartValues, setChartValues] = useState({
        id: 0,
        kind: null,
        name: '',
        chartVersion: '',
        environmentName: '',
    })
    const { chartId } = useParams<{ chartId }>()

    function formatOptionLabel({ label, value, ...rest }) {
        return rest?.chart_name ? (
            <div>
                <span className="cn-7">{rest.chart_name}</span> / <span className="cn-9">{label}</span>
            </div>
        ) : (
            label
        )
    }

    function filterOption({ data: { label, value, ...rest } }, searchString: string): boolean {
        if (!searchString) {
            return true
        }
        searchString = searchString.toLowerCase()
        const match: boolean =
            label.toLowerCase().includes(searchString) || (rest?.chart_name || '').toLowerCase().includes(searchString)
        return match
    }
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':chartId': {
                    component: (
                        <ChartSelector
                            primaryKey="chartId"
                            primaryValue="name"
                            api={getAvailableCharts}
                            matchedKeys={[]}
                            apiPrimaryKey="id"
                            formatOptionLabel={formatOptionLabel}
                            filterOption={filterOption}
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

    async function fetchVersions() {
        setLoading(true)
        try {
            const { result } = await getChartVersionsMin(chartId)
            if (result?.length) {
                const sorted = [...result].sort((a, b) => versionComparatorBySortOrder(a.version, b.version))
                setChartVersions(sorted)
                selectVersion(sorted[0].id)
            } else {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Some error occurred. Please try reloading the page',
                })
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchChartVersionDetails() {
        setLoading(true)
        try {
            const { result } = await getChartVersionDetails(selectedVersion)
            setChartInformation(result)
            try {
                setChartYaml(JSON.parse(result.chartYaml))
            } catch (err) {}
        } catch (err) {
        } finally {
            setLoading(false)
        }
    }

    function openSavedValuesList() {
        history.push(getSavedValuesListURL(chartId))
    }

    async function getChartValuesList() {
        try {
            const { result } = await getChartValuesCategorizedListParsed(chartId)
            setChartValuesList(result)
        } catch (err) {}
    }

    async function redirectToChartValues() {
        const url = getChartValuesURL(chartId)
        history.push(url)
    }

    useEffect(() => {
        fetchVersions()
        getChartValuesList()
    }, [chartId])

    useEffectAfterMount(() => {
        fetchChartVersionDetails()
    }, [selectedVersion])

    useEffect(() => {
        const chartValues = chartValuesList.find((chartValue) => {
            if (chartValue.kind === 'DEFAULT' && chartValue.id === selectedVersion) {
                return chartValue
            }
        })
        if (chartValues) {
            setChartValues(chartValues)
        }
    }, [selectedVersion, chartValuesList])

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </div>
        )
    }
    return (
        <DiscoverDetailsContext.Provider
            value={{
                openSavedValuesList,
                availableVersions,
                selectedVersion,
                selectVersion,
                chartValues,
                setChartValues,
                chartValuesList,
                redirectToChartValues,
            }}
        >
            <Switch>
                <Route path={`${URLS.CHARTS_DISCOVER}${URLS.CHART}/:chartId`} exact>
                    <div className="chart-detail-container">
                        <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
                        {loading ? (
                            <Progressing pageLoader />
                        ) : (
                            <div style={{ overflow: 'auto' }}>
                                <div className="left-right-container">
                                    <div className="chart-detail-left">
                                        <About {...chartInformation} chartYaml={chartYaml} />
                                        <ReadmeRowHorizontal {...chartInformation} />
                                        <ChartDeploymentList chartId={chartId} />
                                    </div>
                                    <div className="chart-detail-right">
                                        <Deployment
                                            chartId={chartId}
                                            {...chartInformation}
                                            availableVersions={mapById(availableVersions)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Route>
                <Route path={`${URLS.CHARTS_DISCOVER}${URLS.CHART}/:chartId${URLS.DEPLOY_CHART}/:presetValueId?`}>
                    <div className="flexbox-col h-100">
                        <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
                        {!chartInformation.chartName ||
                        !selectedVersion ||
                        chartValuesList.length <= 0 ||
                        availableVersions.length <= 0 ||
                        loading ? (
                            <Progressing pageLoader />
                        ) : (
                            <ChartValuesView
                                isDeployChartView
                                installedConfigFromParent={chartInformation as ChartInstalledConfig}
                                chartValuesListFromParent={chartValuesList}
                                chartVersionsDataFromParent={availableVersions}
                                chartValuesFromParent={chartValues}
                                selectedVersionFromParent={selectedVersion}
                            />
                        )}
                    </div>
                </Route>
            </Switch>
        </DiscoverDetailsContext.Provider>
    )
}

const Deployment: React.FC<DeploymentProps> = ({
    icon = '',
    chartId = '',
    chartName = '',
    name = '',
    appStoreApplicationName = '',
    availableVersions,
    deprecated = '',
    ...rest
}) => {
    const {
        redirectToChartValues,
        openSavedValuesList,
        selectedVersion,
        selectVersion,
        chartValuesList,
        chartValues,
        setChartValues,
    } = useDiscoverDetailsContext()
    const match = useRouteMatch()
    const { push } = useHistory()
    const [showChartVersionSelectorModal, setShowChartVersionSelectorModal] = useState(false)
    const [deployedChartValueList, setDeployedChartValueList] = useState<ChartValuesType[]>([])
    const [presetChartValueList, setPresetChartValueList] = useState<ChartValuesType[]>([])

    useEffect(() => {
        const _deployedChartValues = []
        const _presetChartValues = []
        for (let index = 0; index < chartValuesList.length; index++) {
            const _chartValue = chartValuesList[index]
            const chartValueObj: ChartValuesType = {
                id: _chartValue.id,
                kind: _chartValue.kind,
                name: _chartValue.name,
                chartVersion: _chartValue.chartVersion,
                environmentName: '',
            }
            if (_chartValue.kind === ChartKind.DEPLOYED) {
                _deployedChartValues.push(chartValueObj)
            } else if (_chartValue.kind === ChartKind.TEMPLATE) {
                _presetChartValues.push(chartValueObj)
            }
        }
        setDeployedChartValueList(_deployedChartValues)
        setPresetChartValueList(_presetChartValues)
    }, [chartValuesList])

    const handleImageError = (e) => {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    function handleDeploy() {
        push(`${match.url}/deploy-chart`)
    }

    const handleDeployButtonClick = (): void => {
        if (deployedChartValueList.length === 0 && presetChartValueList.length === 0) {
            handleDeploy()
        } else {
            setShowChartVersionSelectorModal(true)
        }
    }

    const hideVersionModal = (): void => {
        setShowChartVersionSelectorModal(false)
    }

    return (
        <div className="deployment-container chart-deployment flex column left white-card white-card--chart-detail">
            <div className="dc__chart-grid-item__icon-wrapper">
                <img
                    src={icon}
                    onError={handleImageError}
                    className="dc__chart-grid-item__icon"
                    alt="chart icon"
                    data-testid="chart-type-image"
                />
            </div>
            <div className="mb-16">
                <div className="repository" data-testid="chart-type">
                    <div className="user anchor">{chartName}</div>
                    <div className="repo">{appStoreApplicationName}</div>
                </div>
                {deprecated && (
                    <div className="mt-8">
                        <DeprecatedWarn />
                    </div>
                )}
            </div>
            <button
                type="button"
                className="flex cta h-36"
                data-testid="configure-and-deploy-button"
                onClick={handleDeploy}
            >
                Configure & Deploy
            </button>
            <button
                type="button"
                className="flex cta h-36 cb-5 cancel mt-8"
                data-testid="preset-values-button"
                onClick={openSavedValuesList}
            >
                Preset values
            </button>
        </div>
    )
}

const ReadmeRowHorizontal = ({ readme = null, version = '', ...props }) => {
    const [collapsed, toggleCollapse] = useState(true)
    return (
        <div className="discover__readme discover__readme--horizontal" data-testid="readme-file-button">
            <List onClick={readme ? (e) => toggleCollapse((t) => !t) : (e) => {}}>
                <List.Logo src={fileIcon} />
                <List.Title
                    className={!readme ? 'not-available' : ''}
                    title={`${readme ? 'README.md' : 'README.md not available'}`}
                    subtitle={`chart version (v${version})`}
                />
                {readme && (
                    <List.DropDown
                        style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                        className="rotate"
                    />
                )}
            </List>
            {!collapsed && readme && <MarkDown markdown={readme} />}
        </div>
    )
}

export default DiscoverChartDetails
