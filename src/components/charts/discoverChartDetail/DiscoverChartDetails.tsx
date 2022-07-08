import React, { useState, useEffect, useContext } from 'react'
import { Route, Switch } from 'react-router-dom'
import { useRouteMatch, useLocation, useParams, useHistory } from 'react-router'
import {
    Select as DevtronSelect,
    useEffectAfterMount,
    List,
    showError,
    Progressing,
    useBreadcrumb,
    BreadCrumb,
} from '../../common'
import { URLS } from '../../../config'
import { getChartVersionsMin, getChartVersionDetails, getChartValuesCategorizedListParsed } from '../charts.service'
import { getAvailableCharts } from '../../../services/service'
import { DiscoverChartDetailsProps, DeploymentProps } from './types'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import fileIcon from '../../../assets/icons/ic-file.svg'
import { marked } from 'marked'
import ManageValues from '../modal/ManageValues'
import { About } from './About'
import { ChartDeploymentList } from './ChartDeploymentList'
import { ChartValuesSelect } from '../util/ChartValueSelect'
import { getManageValuesURL, getChartValuesURL } from '../charts.helper'
import { getDiscoverChartDetailsURL } from '../charts.helper'
import { ChartSelector } from '../../AppSelector'
import { DeprecatedWarn } from '../../common/DeprecatedUpdateWarn'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import './DiscoverChartDetails.scss'
import PageHeader from '../../common/header/PageHeader'
import ChartValuesView from '../../v2/values/chartValuesDiff/ChartValuesView'
import { ChartInstalledConfig } from '../../v2/values/chartValuesDiff/ChartValuesView.type'

const DiscoverDetailsContext = React.createContext(null)

function useDiscoverDetailsContext() {
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
            const { result } = await getChartVersionsMin(chartId)
            setChartVersions(result)
            selectVersion(result[0].id)
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

    function openManageValues() {
        let link = getManageValuesURL(chartId)
        history.push(link)
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
                openManageValues,
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
                    path={`${URLS.CHARTS}/discover/chart/:chartId/deploy-chart`}
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
                <Route
                    path={`${URLS.CHARTS}/discover/chart/:chartId/manage-values`}
                    render={(props) => {
                        return (
                            <ManageValues
                                chartId={chartId}
                                onDeleteChartValue={getChartValuesList}
                                close={() => {
                                    let link = getDiscoverChartDetailsURL(chartId)
                                    history.push(link)
                                }}
                            />
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
        openManageValues,
        selectedVersion,
        selectVersion,
        chartValuesList,
        chartValues,
        setChartValues,
    } = useDiscoverDetailsContext()
    const match = useRouteMatch()
    const { push } = useHistory()
    const { serverMode } = useContext(mainContext)

    const handleImageError = (e) => {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    function handleDeploy() {
        push(`${match.url}/deploy-chart`)
    }

    return (
        <div className="deployment-container chart-deployment flex column left white-card white-card--chart-detail">
            <div className="chart-grid-item__icon-wrapper">
                <img src={icon} onError={handleImageError} className="chart-grid-item__icon" alt="chart icon" />
            </div>
            <div className="mb-16">
                <div className="repository">
                    <span className="user anchor">{chartName}/</span>
                    <span className="repo">{appStoreApplicationName}</span>
                </div>
                {deprecated && (
                    <div className="mt-8">
                        <DeprecatedWarn />
                    </div>
                )}
            </div>
            <span className="form__label">Chart version</span>
            <DevtronSelect
                rootClassName="select-button--default mb-20"
                value={
                    selectedVersion && availableVersions.has(selectedVersion)
                        ? availableVersions.get(selectedVersion).id
                        : null
                }
                onChange={(event) => {
                    selectVersion(event.target.value)
                }}
            >
                <DevtronSelect.Button>
                    {availableVersions.has(selectedVersion)
                        ? availableVersions.get(selectedVersion).version
                        : 'Select version'}
                </DevtronSelect.Button>
                {availableVersions &&
                    Array.from(availableVersions).map(([versionId, versionInfo], idx) => (
                        <DevtronSelect.Option key={versionId} value={versionId}>
                            {versionInfo.version}
                        </DevtronSelect.Option>
                    ))}
            </DevtronSelect>

            <div className="form__label form__label--manage-values">
                <span className="form__label form__label--no-margin">Chart Values*</span>
                <button className="text-button p-0" onClick={openManageValues}>
                    Manage
                </button>
            </div>
            <div className="mb-20 w-100">
                <ChartValuesSelect
                    chartValuesList={chartValuesList}
                    chartValues={chartValues}
                    redirectToChartValues={redirectToChartValues}
                    onChange={(event) => {
                        setChartValues(event)
                    }}
                />
            </div>
            <button type="button" className="flex cta" onClick={handleDeploy}>
                Deploy
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
