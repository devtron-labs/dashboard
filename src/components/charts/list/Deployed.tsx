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
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { HeaderTitle, HeaderButtonGroup, GenericChartsHeader, ChartDetailNavigator } from '../Charts'
import { ChartCheckListModal } from '../../checkList/ChartCheckModal';

class Deployed extends Component<DeployedChartProps, DeployedChartState> {

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            installedCharts: [],
        }
    }

    componentDidMount() {
        this.getInstalledCharts();
    }

    getInstalledCharts() {
        getInstalledCharts().then((response) => {
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

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <Progressing pageLoader />
            </div>
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <ErrorScreenManager code={this.state.code} />
            </div>
        }
        else if (this.state.installedCharts.length === 0) {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
                <div>
                    <ChartCheckListModal {...this.props} />
                </div>
            </div>
        }
        else {
            return <div className="chart-list-page">
                {this.renderPageHeader()}
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
