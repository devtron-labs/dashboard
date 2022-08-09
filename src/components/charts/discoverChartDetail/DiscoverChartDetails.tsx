import React, { useState, useEffect, useContext } from 'react'
import { Route, Switch } from 'react-router-dom'
import { useRouteMatch, useLocation, useParams, useHistory } from 'react-router'
import { useEffectAfterMount, List, showError, Progressing, useBreadcrumb, BreadCrumb } from '../../common'
import { URLS } from '../../../config'
import { getChartVersionsMin, getChartVersionDetails, getChartValuesCategorizedListParsed } from '../charts.service'
import { getAvailableCharts } from '../../../services/service'
import { DiscoverChartDetailsProps, DeploymentProps } from './types'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import fileIcon from '../../../assets/icons/ic-file.svg'
import { marked } from 'marked'
import { About } from './About'
import { ChartDeploymentList } from './ChartDeploymentList'
import { getSavedValuesListURL, getChartValuesURL } from '../charts.helper'
import { ChartSelector } from '../../AppSelector'
import { DeprecatedWarn } from '../../common/DeprecatedUpdateWarn'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import './DiscoverChartDetails.scss'
import PageHeader from '../../common/header/PageHeader'
import ChartValuesView from '../../v2/values/chartValuesDiff/ChartValuesView'
import { ChartInstalledConfig, ChartKind } from '../../v2/values/chartValuesDiff/ChartValuesView.type'
import ChartVersionSelectorModal from './ChartVersionSelectorModal'
import { ChartValuesType } from '../charts.types'
import { toast } from 'react-toastify'

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
    const { serverMode } = useContext(mainContext)

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
        if (!searchString) return true
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

    function goBackToDiscoverChart() {
        history.push(`${URLS.CHARTS}/discover/chart/${chartId}`)
    }

    async function fetchVersions() {
        setLoading(true)
        try {
            let { result } = await getChartVersionsMin(chartId)
            if(result?.length){
              setChartVersions(result)
              selectVersion(result[0].id)
            } else{
              toast.error('Some error occurred. Please try reloading the page');
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
        let url = getChartValuesURL(chartId)
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
        let chartValues = chartValuesList.find((chrtValue) => {
            if (chrtValue.kind === 'DEFAULT' && chrtValue.id === selectedVersion) return chrtValue
        })
        if (chartValues) setChartValues(chartValues)
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
                goBackToDiscoverChart,
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
            <div className="chart-detail-container">
                <PageHeader isBreadcrumbs={true} breadCrumbs={renderBreadcrumbs} />
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
            <Switch>
                <Route
                    path={`${URLS.CHARTS_DISCOVER}${URLS.CHART}/:chartId${URLS.DEPLOY_CHART}/:presetValueId?`}
                    render={(props) => {
                        return (
                            <div className="deploy-chart__container">
                                {!chartInformation.chartName ||
                                !selectedVersion ||
                                chartValuesList.length <= 0 ||
                                availableVersions.length <= 0 ? (
                                    <Progressing pageLoader />
                                ) : (
                                    <>
                                        <PageHeader
                                            headerName={`Deploy chart: ${chartInformation.chartName}/${chartInformation.name}`}
                                            additionalHeaderInfo={() =>
                                                chartInformation.deprecated && (
                                                    <span style={{ color: 'var(--R500)' }}>&nbsp;(Deprecated)</span>
                                                )
                                            }
                                            showCloseButton={true}
                                            onClose={goBackToDiscoverChart}
                                        />
                                        <ChartValuesView
                                            isDeployChartView={true}
                                            installedConfigFromParent={chartInformation as ChartInstalledConfig}
                                            chartValuesListFromParent={chartValuesList}
                                            chartVersionsDataFromParent={availableVersions}
                                            chartValuesFromParent={chartValues}
                                            selectedVersionFromParent={selectedVersion}
                                        />
                                    </>
                                )}
                            </div>
                        )
                    }}
                />
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
    const { serverMode } = useContext(mainContext)
    const [showChartVersionSelectorModal, setShowChartVersionSelectorModal] = useState(false)
    const [deployedChartValueList, setDeployedChartValueList] = useState<ChartValuesType[]>([])
    const [presetChartValueList, setPresetChartValueList] = useState<ChartValuesType[]>([])

    useEffect(() => {
        const _deployedChartValues = [],
            _presetChartValues = []
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
            <div className="chart-grid-item__icon-wrapper">
                <img src={icon} onError={handleImageError} className="chart-grid-item__icon" alt="chart icon" />
            </div>
            <div className="mb-16">
                <div className="repository">
                    <div className="user anchor">{chartName}</div>
                    <div className="repo">{appStoreApplicationName}</div>
                </div>
                {deprecated && (
                    <div className="mt-8">
                        <DeprecatedWarn />
                    </div>
                )}
            </div>
            <button type="button" className="flex cta h-36" onClick={handleDeploy}>
                Deploy...
            </button>
            <button type="button" className="flex cta h-36 cb-5 cancel mt-8" onClick={openSavedValuesList}>
                Preset values
            </button>
        </div>
    )
}

function ReadmeRowHorizontal({ readme = null, version = '', ...props }) {
    const [collapsed, toggleCollapse] = useState(true)
    return (
        <div className="discover__readme discover__readme--horizontal">
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

export function MarkDown({ markdown = '', className = '', breaks = false, ...props }) {
    const { hash } = useLocation()
    const renderer = new marked.Renderer()
    renderer.table = function (header, body) {
        return `
        <div class="table-container">
            <table>
                ${header}
                ${body}
            </table>
        </div>
        `
    }

    renderer.heading = function (text, level) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')

        return `
          <a name="${escapedText}" rel="noreferrer noopener" class="anchor" href="#${escapedText}">
                <h${level}>
              <span class="header-link"></span>
              ${text}
              </h${level}>
            </a>`
    }

    marked.setOptions({
        renderer,
        gfm: true,
        smartLists: true,
        ...(breaks && { breaks: true }),
    })

    function createMarkup() {
        return { __html: marked(markdown) }
    }
    return (
        <article
            {...props}
            className={`deploy-chart__readme-markdown ${className}`}
            dangerouslySetInnerHTML={createMarkup()}
        />
    )
}

export default DiscoverChartDetails
