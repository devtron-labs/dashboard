import React, { Component } from 'react';
import { DeployedChartProps, DeployedChartState } from '../charts.types';
import { ViewType } from '../../../config';
import { Link, withRouter } from 'react-router-dom';
import { ErrorScreenManager, LazyImage, Progressing, multiSelectStyles, Checkbox, Option } from '../../common';
import { UpdateWarn } from '../../common/DeprecatedUpdateWarn';
import { getInstalledCharts } from '../charts.service';
import { toast } from 'react-toastify'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { HeaderTitle, HeaderButtonGroup, GenericChartsHeader, ChartDetailNavigator } from '../Charts'
import { ChartCheckListModal } from '../../checkList/ChartCheckModal';
import { AllCheckModal } from '../../checkList/AllCheckModal';
import DeployedChartFilters from './DeployedChartFilters';
import { showError } from '../../common';
import { getChartRepoList, getEnvironmentListMin } from '../../../services/service'

const QueryParams = {
    ChartRepoId: 'chartRepoId',
    EnvironmentId: 'envId',
    IncludeDeprecated: 'includeDeprecated',
    AppStoreName: 'appStoreName',
}
class Deployed extends Component<DeployedChartProps, DeployedChartState> {

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            loading: true,
            view: ViewType.LOADING,
            installedCharts: [],
            chartRepos: [],
            environment: [],
            selectedChartRepo: [],
            selectedEnvironment: [],
            includeDeprecated: 0,
            appStoreName: "",
            searchApplied: false,
            appliedChartRepoFilter: [],
            chartListloading: true
        }
        this.handleFilterChanges = this.handleFilterChanges.bind(this)
    }

    async componentDidMount() {
        try {
            const [{ result: chartRepoList }, { result: environments }] = await Promise.all([getChartRepoList(), getEnvironmentListMin()])
            let chartRepos = chartRepoList.map((chartRepo) => {
                {console.log(chartRepo)}

                return {
                    value: chartRepo.id,
                    label: chartRepo.name
                }
            });
            let environment = environments.map((env) => {
                {console.log(env)}
                return {
                    value: env.id,
                    label: env.environment_name
                }
            });
            this.setState({ ...this.state, loading: false, chartRepos: chartRepos, environment: environment });
        }
        catch (err) {
            showError(err)
            this.setState(state => ({ ...state, loading: false }))
        }
        finally {
            this.setState(state => ({ ...state, loading: false }))
        }

        if (!this.props.location.search) {
            this.props.history.push(`${this.props.match.url}?${QueryParams.IncludeDeprecated}=0`);
        }
        else {
            this.initialiseFromQueryParams(this.state.chartRepos, this.state.environment);
            this.callApplyFilterOnCharts();
            this.getInstalledCharts(this.props.location.search);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.initialiseFromQueryParams(this.state.chartRepos, this.state.environment);
            this.callApplyFilterOnCharts();
        }
    }

    getInstalledCharts(qs) {
        getInstalledCharts(qs).then((response) => {
            this.setState({ installedCharts: response.result, view: ViewType.FORM });
        }).catch((errors) => {
            this.setState({ code: errors.code, view: ViewType.ERROR })
            if (errors && Array.isArray(errors.error)) {
                errors.errors.map(err => toast.error(err, { autoClose: false }))
            }
        })
    }

    handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    renderCard(chart) {
        let { icon, chartName, appName, appStoreApplicationName, environmentName, deployedAt, installedAppId, environmentId, deprecated } = chart;
        return <Link key={appName} className="chart-grid-item white-card chart-grid-item--deployed" to={`deployments/${installedAppId}/env/${environmentId}`}>
            <div className="chart-grid-item__flexbox">
                <div className="chart-grid-item__icon-wrapper">
                    <LazyImage className="chart-grid-item__icon" src={icon} onError={this.handleImageError} />
                </div>
                {
                    deprecated &&
                    <div>
                        <UpdateWarn />
                        {/* <div className="chart-grid-item__top-right"><img src={check} className="chart-grid-item__top-right-icon" />Deployed</div> */}
                    </div>
                }
            </div>
            <div className="chart-grid-item__title ellipsis-right">{appName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{chartName}/{appStoreApplicationName}</div>
            <div className="chart-grid-item__env"><span className="env-badge">ENV</span>{environmentName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{deployedAt}</div>
        </Link>
    }

    renderPageHeader() {
        return <GenericChartsHeader>
            <HeaderTitle>Chart Store</HeaderTitle>
            <ChartDetailNavigator />
            <HeaderButtonGroup><span /></HeaderButtonGroup>
        </GenericChartsHeader>
    }

    setAppStoreName = (event) => {
        // this.setState({ appStoreName: event.target.value})
    }

    handleFilterChanges = (selected, key): void => {
        const searchParams = new URLSearchParams(this.props.location.search);
        const app = searchParams.get(QueryParams.AppStoreName);
        const deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        const envId = searchParams.get(QueryParams.EnvironmentId)

        let url = this.props.match.url

        if (key == "chart-repo") {
            let chartRepoId = selected?.map((e) => { return e.value }).join(",");
            let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`)
        };

        if (key == "deprecated") {
            let qs = `${QueryParams.IncludeDeprecated}=${selected}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "search") {
            selected.preventDefault();
            let qs = `${QueryParams.AppStoreName}=${this.state.appStoreName}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "environment") {
            let environment = selected?.map((e) => { return e.value }).join(",");
            let qs = `${QueryParams.EnvironmentId}=${environment}`;
            if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            this.props.history.push(`${url}?${qs}`);
        }

        if (key == "clear") {
            let qs: string = "";
            if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
            if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
            if (envId) qs = `${qs}&${QueryParams.EnvironmentId}=${envId}`;
            this.props.history.push(`${url}?${qs}`);
        }
    }

    handleViewAllCharts = () => {
        this.props.history.push(`${this.props.match.url}?${QueryParams.IncludeDeprecated}=1`);
    }

    handleCloseFilter = () => {
        this.setState({ selectedChartRepo: this.state.appliedChartRepoFilter })
    }

    initialiseFromQueryParams = (chartRepoList, environmentList) => {
        let searchParams = new URLSearchParams(this.props.location.search);
        let allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId);
        let deprecated: string = searchParams.get(QueryParams.IncludeDeprecated);
        let appStoreName: string = searchParams.get(QueryParams.AppStoreName);
        let environment: string = searchParams.get(QueryParams.EnvironmentId);

        let chartRepoIdArray = [];
        if (allChartRepoIds) { chartRepoIdArray = allChartRepoIds.split(",") }
        { console.log(allChartRepoIds) }

        chartRepoIdArray = chartRepoIdArray.map((chartRepoId => parseInt(chartRepoId)))
        let selectedRepos = [];
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            let chartRepo = chartRepoList.find(item => item.value === chartRepoIdArray[i]);
            if (chartRepo) selectedRepos.push(chartRepo);
        }

        if (selectedRepos) { this.setState({ selectedChartRepo: selectedRepos }) };
        if (deprecated) {
            this.setState({ includeDeprecated: parseInt(deprecated) })
        }
        if (appStoreName) {
            this.setState({
                searchApplied: true,
                appStoreName: appStoreName
            });
        }
        else {
            this.setState({
                searchApplied: false,
                appStoreName: ""
            })
        }
        if (selectedRepos) { this.setState({ appliedChartRepoFilter: selectedRepos }) }
    }

    async callApplyFilterOnCharts() {
        this.setState({ view: ViewType.LOADING })
        await getInstalledCharts(this.props.location.search)
        this.setState({ view: ViewType.FORM })
    }

    // handleSelectedchartRepo = (selected) => {
    //     this.setState({ selectedChartRepo: })
    // }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <div className="chart-list-page ">
                {this.renderPageHeader()}
                <div style={{ height: '100vh', width: '100vw' }}>
                    <Progressing pageLoader />
                </div>
            </div>
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <ErrorScreenManager code={this.state.code} />
            </div>
        }
        if (this.state.installedCharts.length === 0) {
            return <div className="chart-list-page" >
                {this.renderPageHeader()}
                <div style={{ width: "600px", margin: "auto", marginTop: '20px' }} className="bcn-0 pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20">
                    <AllCheckModal />
                </div>
            </div>
        }
        else {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <DeployedChartFilters
                    handleFilterChanges={this.handleFilterChanges}
                    appStoreName={this.state.appStoreName}
                    searchApplied={this.state.searchApplied}
                    handleCloseFilter={this.handleCloseFilter}
                    selectedChartRepo={this.state.selectedChartRepo}
                    includeDeprecated={this.state.includeDeprecated}
                    chartRepos={this.state.chartRepos}
                    setAppStoreName={this.setAppStoreName}
                    environment = {this.state.environment}
                />
                <div className="chart-grid">
                    {this.state.installedCharts.map((chart) => {
                        return this.renderCard(chart);
                    })}
                </div>
            </div>
        }
    }
}
export default withRouter(props => <Deployed {...props} />)
