import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { showError, Progressing, ErrorScreenManager } from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import { DeployedChartProps, DeployedChartState } from '../charts.types'
import { URLS, ViewType } from '../../../config'
import { LazyImage } from '../../common'
import { UpdateWarn } from '../../common/DeprecatedUpdateWarn'
import { getInstalledCharts } from '../charts.service'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { HeaderTitle, HeaderButtonGroup, GenericChartsHeader, ChartDetailNavigator } from '../Charts'
import { AllCheckModal } from '../../checkList/AllCheckModal'
import DeployedChartFilters from './DeployedChartFilters'
import { getChartRepoList, getEnvironmentListMin } from '../../../services/service'
import ChartEmptyState from '../../common/emptyState/ChartEmptyState'

const QueryParams = {
    ChartRepoId: 'chartRepoId',
    EnvironmentId: 'envs',
    onlyDeprecated: 'onlyDeprecated',
    AppStoreName: 'appName',
}

const FilterName = {
    Environemnt: 'environment',
    ChartRepo: 'repository',
}

class Deployed extends Component<DeployedChartProps, DeployedChartState> {
    constructor(props) {
        super(props)
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            installedCharts: [],
            chartRepos: [],
            environment: [],
            selectedChartRepo: [],
            selectedEnvironment: [],
            onlyDeprecated: false,
            appStoreName: '',
            searchApplied: false,
            appliedChartRepoFilter: [],
            appliedEnvironmentFilter: [],
            chartListloading: true,
        }
    }

    componentDidMount() {
        this.getChartFilter()
    }

    getChartFilter = async () => {
        try {
            const [{ result: chartRepoListResp }, { result: envListResponse }] = await Promise.all([
                getChartRepoList(),
                getEnvironmentListMin(),
            ])
            let chartRepos = chartRepoListResp || []
            chartRepos = chartRepos.map((chartRepo) => {
                return {
                    value: chartRepo.id,
                    label: chartRepo.name,
                }
            })
            let environment = envListResponse || []
            environment = environment.map((env) => {
                return {
                    value: env.id,
                    label: env.environment_name,
                }
            })
            this.setState({ ...this.state, view: ViewType.FORM, chartRepos, environment }, () => {
                this.initialiseFromQueryParams()
                this.callApplyFilterOnCharts()
            })
        } catch (err) {
            showError(err)
            this.setState({ ...this.state, view: ViewType.LOADING })
        } finally {
            this.setState({ ...this.state, view: ViewType.LOADING })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.initialiseFromQueryParams()
            this.callApplyFilterOnCharts()
        }
    }

    getInstalledCharts() {
        getInstalledCharts(this.props.location.search)
            .then((response) => {
                this.setState({ installedCharts: response.result, view: ViewType.FORM })
            })
            .catch((errors) => {
                this.setState({ code: errors.code, view: ViewType.ERROR })
                if (errors && Array.isArray(errors.error)) {
                    errors.errors.map((err) => toast.error(err, { autoClose: false }))
                }
            })
    }

    handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    renderPageHeader() {
        return (
            <GenericChartsHeader>
                <HeaderTitle>Chart Store</HeaderTitle>
                <ChartDetailNavigator />
                <HeaderButtonGroup>
                    <span />
                </HeaderButtonGroup>
            </GenericChartsHeader>
        )
    }

    renderCard(chart) {
        const {
            icon,
            chartName,
            appName,
            appStoreApplicationName,
            environmentName,
            deployedAt,
            installedAppId,
            environmentId,
            deprecated,
        } = chart
        return (
            <Link
                key={appName}
                className="chart-grid-item white-card chart-grid-item--deployed"
                to={`deployments/${installedAppId}/env/${environmentId}/${URLS.APP_DETAILS}`}
            >
                <div className="chart-grid-item__flexbox">
                    <div className="dc__chart-grid-item__icon-wrapper">
                        <LazyImage className="dc__chart-grid-item__icon" src={icon} onError={this.handleImageError} />
                    </div>
                    {deprecated && (
                        <div>
                            <UpdateWarn />
                            {/* <div className="chart-grid-item__top-right"><img src={check} className="chart-grid-item__top-right-icon" />Deployed</div> */}
                        </div>
                    )}
                </div>
                <div className="chart-grid-item__title dc__ellipsis-right">{appName}</div>
                <div className="chart-grid-item__light-text dc__ellipsis-right">
                    {chartName}/{appStoreApplicationName}
                </div>
                <div className="chart-grid-item__env">
                    <span className="env-badge">ENV</span>
                    {environmentName}
                </div>
                <div className="chart-grid-item__light-text dc__ellipsis-right">{deployedAt}</div>
            </Link>
        )
    }

    handleAppStoreName = (event) => {
        this.setState({ appStoreName: event })
    }

    handleSelectedFilters = (selected, key) => {
        if (key == FilterName.ChartRepo) {
            this.setState({ selectedChartRepo: selected })
        } else if (key == FilterName.Environemnt) {
            this.setState({ selectedEnvironment: selected })
        }
    }

    handleAppliedEnvironmentAndChartRepoFilter = (selected, key) => {
        if (key == FilterName.ChartRepo) {
            this.setState({ appliedChartRepoFilter: selected })
        } else if (key == FilterName.Environemnt) {
            this.setState({ appliedEnvironmentFilter: selected })
        }
    }

    handleFilterQueryChanges = (selected, key): void => {
        const searchParams = new URLSearchParams(this.props.location.search)
        const app = searchParams.get(QueryParams.AppStoreName)
        const deprecate = searchParams.get(QueryParams.onlyDeprecated)
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId)
        const envId = searchParams.get(QueryParams.EnvironmentId)

        const { url } = this.props.match

        if (key == 'repository') {
            const chartRepoId = selected
                ?.map((e) => {
                    return e.value
                })
                .join(',')
            let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`
            if (app) {
                qs = `${qs}&${QueryParams.AppStoreName}=${app}`
            }
            if (deprecate) {
                qs = `${qs}&${QueryParams.onlyDeprecated}=${deprecate}`
            }
            if (envId) {
                qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`
            }
            this.props.history.push(`${url}?${qs}`)
        } else if (key == 'deprecated') {
            let qs = `${QueryParams.onlyDeprecated}=${selected}`
            if (app) {
                qs = `${qs}&${QueryParams.AppStoreName}=${app}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            if (envId) {
                qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`
            }
            this.props.history.push(`${url}?${qs}`)
        } else if (key == 'search') {
            selected.preventDefault()
            let qs = `${QueryParams.AppStoreName}=${this.state.appStoreName}`
            if (deprecate) {
                qs = `${qs}&${QueryParams.onlyDeprecated}=${deprecate}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            if (envId) {
                qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`
            }
            this.props.history.push(`${url}?${qs}`)
        } else if (key == 'environment') {
            const environmentId = selected
                ?.map((e) => {
                    return e.value
                })
                .join(',')
            let qs = `${QueryParams.EnvironmentId}=${environmentId}`
            if (app) {
                qs = `${qs}&${QueryParams.AppStoreName}=${app}`
            }
            if (deprecate) {
                qs = `${qs}&${QueryParams.onlyDeprecated}=${deprecate}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            this.props.history.push(`${url}?${qs}`)
        } else if (key == 'clear') {
            let qs: string = ''
            if (deprecate) {
                qs = `${qs}&${QueryParams.onlyDeprecated}=${deprecate}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            if (envId) {
                qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`
            }
            this.props.history.push(`${url}?${qs}`)
        }
    }

    handleViewAllCharts = () => {
        this.props.history.push(`${this.props.match.url}`)
    }

    handleCloseFilter = (key) => {
        if (key == FilterName.ChartRepo) {
            this.setState({
                selectedChartRepo: this.state.appliedChartRepoFilter,
            })
        } else if (key == FilterName.Environemnt) {
            this.setState({
                selectedEnvironment: this.state.appliedEnvironmentFilter,
            })
        }
    }

    initialiseFromQueryParams = () => {
        const searchParams = new URLSearchParams(this.props.location.search)
        const allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId)
        const deprecated: string = searchParams.get(QueryParams.onlyDeprecated)
        const appStoreName: string = searchParams.get(QueryParams.AppStoreName)
        const allenvironmentIds: string = searchParams.get(QueryParams.EnvironmentId)

        let chartRepoIdArray = []
        if (allChartRepoIds) {
            chartRepoIdArray = allChartRepoIds.split(',')
        }
        chartRepoIdArray = chartRepoIdArray.map((chartRepoId) => parseInt(chartRepoId))
        const selectedRepos = []
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            const chartRepo = this.state.chartRepos.find((item) => item.value === chartRepoIdArray[i])
            if (chartRepo) {
                selectedRepos.push(chartRepo)
            }
        }
        if (selectedRepos) {
            this.setState({ selectedChartRepo: selectedRepos })
        }
        let environmentIdArray = []
        if (allenvironmentIds) {
            environmentIdArray = allenvironmentIds.split(',')
        }
        environmentIdArray = environmentIdArray.map((environmentId) => parseInt(environmentId))
        const selectedEnvironment = []
        for (let i = 0; i < environmentIdArray.length; i++) {
            const environment = this.state.environment.find((item) => item.value === environmentIdArray[i])
            if (environment) {
                selectedEnvironment.push(environment)
            }
        }
        if (selectedEnvironment) {
            this.setState({ ...this.state, selectedEnvironment })
        }
        if (deprecated) {
            this.setState({ onlyDeprecated: JSON.parse(deprecated) })
        }
        if (appStoreName) {
            this.setState({
                searchApplied: true,
                appStoreName,
            })
        } else {
            this.setState({
                searchApplied: false,
                appStoreName: '',
            })
        }
        if (selectedRepos) {
            this.handleAppliedEnvironmentAndChartRepoFilter(selectedRepos, FilterName.ChartRepo)
        }
        if (selectedEnvironment) {
            this.setState({ appliedEnvironmentFilter: selectedEnvironment })
        }
    }

    async callApplyFilterOnCharts() {
        this.setState({ view: ViewType.LOADING })
        const response = await getInstalledCharts(this.props.location.search)
        this.setState({ view: ViewType.FORM, installedCharts: response.result })
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="chart-list-page ">
                    {this.renderPageHeader()}
                    <div style={{ height: '100vh', width: '100vw' }}>
                        <Progressing pageLoader />
                    </div>
                </div>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="chart-list-page">
                    {this.renderPageHeader()}
                    <ErrorScreenManager code={this.state.code} />
                </div>
            )
        }
        if (this.state.installedCharts.length === 0) {
            if (!this.props.location.search) {
                return (
                    <div>
                        {this.renderPageHeader()}
                        <div
                            style={{ width: '600px', margin: 'auto', marginTop: '20px' }}
                            className="bcn-0 pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20"
                        >
                            <AllCheckModal />
                        </div>
                    </div>
                )
            }

            return (
                <div className="chart-list-page">
                    {this.renderPageHeader()}
                    <DeployedChartFilters
                        handleFilterQueryChanges={this.handleFilterQueryChanges}
                        appStoreName={this.state.appStoreName}
                        searchApplied={this.state.searchApplied}
                        handleCloseFilter={this.handleCloseFilter}
                        onlyDeprecated={this.state.onlyDeprecated}
                        chartRepos={this.state.chartRepos}
                        handleAppStoreName={this.handleAppStoreName}
                        environment={this.state.environment}
                        handleSelectedFilters={this.handleSelectedFilters}
                        selectedChartRepo={this.state.selectedChartRepo}
                        selectedEnvironment={this.state.selectedEnvironment}
                    />
                    <ChartEmptyState onClickViewChartButton={this.handleViewAllCharts} heightToDeduct={160} />
                </div>
            )
        }

        return (
            <div className="chart-list-page">
                {this.renderPageHeader()}
                <DeployedChartFilters
                    handleFilterQueryChanges={this.handleFilterQueryChanges}
                    appStoreName={this.state.appStoreName}
                    searchApplied={this.state.searchApplied}
                    handleCloseFilter={this.handleCloseFilter}
                    onlyDeprecated={this.state.onlyDeprecated}
                    chartRepos={this.state.chartRepos}
                    handleAppStoreName={this.handleAppStoreName}
                    environment={this.state.environment}
                    handleSelectedFilters={this.handleSelectedFilters}
                    selectedChartRepo={this.state.selectedChartRepo}
                    selectedEnvironment={this.state.selectedEnvironment}
                />
                <div className="chart-grid">
                    {this.state.installedCharts.map((chart) => {
                        return this.renderCard(chart)
                    })}
                </div>
            </div>
        )
    }
}
export default withRouter((props) => <Deployed {...props} />)
