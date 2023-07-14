import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import { ReactComponent as Delete } from '../../assets/icons/ic-delete.svg';
import { ReactComponent as DownArrow } from '../../assets/icons/ic-chevron-down.svg';
import { DeleteDialog, not, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import NoDeploymentImg from '../../assets/img/app-not-configured.png';
import { InstalledChartGroup, InstalledChart } from './charts.types';
import { URLS } from '../../config';
import placeHolder from '../../assets/icons/ic-plc-chart.svg';
import { EMPTY_STATE_STATUS } from '../../config/constantMessaging';

interface ChartGroupDeploymentsProps {
    name: string;
    description: string;
    installedChartData: InstalledChartGroup[];
    deleteInstalledChart: (e) => void;
}

const ChartGroupDeployments: React.FC<ChartGroupDeploymentsProps> = function (props) {

    return <>
        <div className="chart-group-deployments">
            <div className="white-card white-card--chart-store mb-20">
                <div className="chart-store-card__header">About</div>
                <div className="chart-store-card__body">
                    <span className="chart-store-card__subtitle">Description</span>
                    <p className="chart-store-card__text chart-store-card__text--no-margin">{props.description || "No description"}</p>
                </div>
            </div>
            <div className="white-card white-card--running-deployments">
                <div className="chart-store-card__header">Running Deployments</div>
                <div className="chart-store-card__deployment-list">
                    {props.installedChartData.length > 0
                        ? props.installedChartData.map((group, index) => <CollapsibleDeployment
                            key={index}
                            index={index}
                            installedChartGroup={group}
                            deleteInstalledChart={props.deleteInstalledChart}
                        />)
                        : <EmptyStateChartDeploymentList />
                    }
                </div>
            </div>
        </div>
    </>
}


const CollapsibleDeployment: React.FC<{ index?:number; installedChartGroup: InstalledChartGroup; deleteInstalledChart: (installedAppId: number) => void; }> = function (props) {
    let defaultInstalledChart: InstalledChart = {
        chartName: "",
        chartRepoName: "",
        icon: "",
        appStoreId: 0,
        appStoreApplicationVersion: "",
        environmentName: "",
        environmentId: 0,
        installedAppId: 0,
    }
    const [collapsed, toggleCollapsed] = useState(true);
    const [candidateChart, setCandidateChart] = useState(defaultInstalledChart);
    let expandedRow = collapsed ? "chart-group-deployment__expanded-row" : "chart-group-deployment__expanded-row show";
    let chartNames = props.installedChartGroup.installedCharts.map((chart) => { return chart.chartName });
    let allChartNames = chartNames.join(", ");

    //TODO:move to helper
    function handleImageError(e) {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = placeHolder;
    }

    return <React.Fragment >
        <div className="chart-group-deployment__row" data-testid={`past-deployment-${props.index}`}>
            <div className="chart-group-deployment__cell chart-group-deployment__cell--first-child">
                {moment(props.installedChartGroup.installationTime).format('ddd, DD MMM YYYY, HH:mm a')}
            </div>
            <div className="chart-group-deployment__cell chart-group-deployment__cell--child-2">
                <span className="dc__ellipsis-right">{allChartNames}</span>
                <span></span>
            </div>
            <div className="chart-group-deployment__cell chart-group-deployment__cell--last-child">
                <DownArrow className={`icon-dim-20 chart-group-deployment__expand-row ${collapsed ? "" : "chart-group-deployment__expand-row--rotated"}` }
                    data-testid="down-arrow"
                    onClick={(e) => toggleCollapsed(not)}
                />
            </div>
        </div>
        <div className={expandedRow}>
            {props.installedChartGroup.installedCharts.map((chart: InstalledChart, index) => {
                return <Link to={`${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${chart.installedAppId}/env/${chart.environmentId}`} key={`${index} - ${chart.chartName}}`} className="chart-group-deployment__row" data-testid={`group-deployment-${props.index}`}>
                    <div className="chart-group-deployment__cell chart-group-deployment__cell--first-child">
                        <img className="icon-dim-40 mr-16" onError={handleImageError} alt="chart" src={chart.icon || ""} />
                        <p className="chart-group-deployment-cell__chart-name dc__ellipsis-right m-0" data-testid="chart-name">{chart.chartName}</p>
                    </div>
                    <div className="chart-group-deployment__cell chart-group-deployment__cell--child-2">
                        <span className="dc__ellipsis-right">{chart.environmentName}</span>
                    </div>
                    <div className="chart-group-deployment__cell chart-group-deployment__cell--last-child">
                        <Delete className="icon-dim-20 cursor chart-group-deployment__delete-app" data-testid={`deployment-delete-icon-${chart.chartName}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCandidateChart(chart);
                            }} />
                    </div>

                </Link>
            })}
        </div>
        {candidateChart.installedAppId ? <DeleteDialog title={`Delete '${candidateChart.chartName}' ?`}
            delete={() => {
                props.deleteInstalledChart(candidateChart.installedAppId);
                setCandidateChart(defaultInstalledChart);
            }}
            closeDelete={() => { setCandidateChart(defaultInstalledChart) }}>
            <DeleteDialog.Description>
                <p className="fs-13 cn-7 lh-1-54">This will delete all resources associated with this application</p>
                <p className="fs-13 cn-7 lh-1-54">Deleted applications cannot be restored.</p>
            </DeleteDialog.Description>
        </DeleteDialog> : null}
    </React.Fragment>
}

function EmptyStateChartDeploymentList() {
    return (
        <GenericEmptyState
            image={NoDeploymentImg}
            title={EMPTY_STATE_STATUS.CHART_GROUP_DEPLOYMENT.TITLE}
            subTitle={EMPTY_STATE_STATUS.CHART_GROUP_DEPLOYMENT.SUBTITLE}
            classname='dc__position-rel-imp'
        />
    )
}

export default ChartGroupDeployments;