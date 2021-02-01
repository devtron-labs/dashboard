import React, { Component } from 'react';
import { DeployedChartProps, DeployedChartState } from '../charts.types';
import { ViewType } from '../../../config';
import EmptyState from '../../EmptyState/EmptyState';
import { Link, withRouter } from 'react-router-dom';
import { ErrorScreenManager, LazyImage, Progressing } from '../../common';
import { UpdateWarn } from '../../common/DeprecatedUpdateWarn';
import { getInstalledCharts } from '../charts.service';
import emptyAppListImage from '../../../assets/img/empty-applist@2x.png'
import { toast } from 'react-toastify'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg';
import { Command, CommandErrorBoundary } from '../../command';
import { HeaderButtonGroup, GenericChartsHeader, ChartDetailNavigator } from '../Charts'
class Deployed extends Component<DeployedChartProps, DeployedChartState> {

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            installedCharts: [],
            isCommandBarActive: false,
        }
        this.toggleCommandBar = this.toggleCommandBar.bind(this);
    }

    componentDidMount() {
        this.getInstalledCharts();
    }

    toggleCommandBar(flag: boolean): void {
        this.setState({
            isCommandBarActive: flag
        });
    }

    getInstalledCharts(): void {
        getInstalledCharts().then((response) => {
            this.setState({ installedCharts: response.result, view: ViewType.FORM });
        }).catch((errors) => {
            this.setState({ code: errors.code, view: ViewType.ERROR })
            if (errors && Array.isArray(errors.error)) {
                errors.errors.map(err => toast.error(err, { autoClose: false }))
            }
        })
    }

    handleImageError(e): void {
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
                {deprecated && <div>
                        <UpdateWarn />
                        {/* <div className="chart-grid-item__top-right"><img src={check} className="chart-grid-item__top-right-icon" />Deployed</div> */}
                    </div>}
            </div>
            <div className="chart-grid-item__title ellipsis-right">{appName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{chartName}/{appStoreApplicationName}</div>
            <div className="chart-grid-item__env"><span className="env-badge">ENV</span>{environmentName}</div>
            <div className="chart-grid-item__light-text ellipsis-right">{deployedAt}</div>
        </Link>
    }

    render() {
        if (this.state.code) return <ErrorScreenManager code={this.state.code} />
        else return <div className="chart-list-page">
            <GenericChartsHeader>
                <div className="flexbox flex-align-items-center flex-justify">
                    <h1 className="m-0 fs-16 cn-9 fw-6">Chart Store</h1>
                    <div className="cursor flexbox flex-align-items-center bcn-1 bw-1 en-2 pl-12 pr-12 br-4 fs-13 cn-5 command-open"
                        onClick={() => this.toggleCommandBar(true)}>
                        <span>Jump to...</span>
                    </div>
                    <CommandErrorBoundary toggleCommandBar={this.toggleCommandBar}>
                        <Command location={this.props.location}
                            match={this.props.match}
                            history={this.props.history}
                            isCommandBarActive={this.state.isCommandBarActive}
                            toggleCommandBar={this.toggleCommandBar}
                        />
                    </CommandErrorBoundary>
                </div>
                <ChartDetailNavigator />
                <HeaderButtonGroup><span /></HeaderButtonGroup>
            </GenericChartsHeader>
            {this.state.view === ViewType.LOADING
                ? <Progressing pageLoader />
                : this.state.installedCharts.length === 0
                    ? <EmptyState>
                        <EmptyState.Image><img src={emptyAppListImage} alt="" /> </EmptyState.Image>
                        <EmptyState.Title><h2 className="empty__title">No Charts Deployed</h2></EmptyState.Title>
                        <EmptyState.Subtitle>You haven’t deployed any charts. Browse and deploy charts to find them here.</EmptyState.Subtitle>
                        <EmptyState.Button>
                            <Link to="discover" className="cta no-decor ghosted" >Discover charts</Link>
                        </EmptyState.Button>
                    </EmptyState>
                    : <div className="chart-grid">
                        {this.state.installedCharts.map((chart) => {
                            return this.renderCard(chart);
                        })}
                    </div>
            }
        </div>
    }
}
export default withRouter(props => <Deployed {...props} />)
