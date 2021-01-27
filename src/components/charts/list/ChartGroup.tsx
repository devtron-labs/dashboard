
import React from 'react';
import { Progressing, BreadCrumb, useAsync, useBreadcrumb } from '../../common';
import { getChartGroups } from '../charts.service';
import ChartGroupCard from '../util/ChartGroupCard';
import { useRouteMatch, useHistory, useLocation, Switch } from 'react-router'
import { Route, Link } from 'react-router-dom'
import CreateChartGroup from '../modal/CreateChartGroup'
import ChartGroupUpdate from '../ChartGroupUpdate'
import ChartGroupDetails from '../ChartGroupDetails';
import ChartGroupAdvanceDeploy from '../ChartGroupAdvanceDeploy';
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';

function ChartGroupList() {
    const [loading, result, error, reload] = useAsync(getChartGroups, [])
    const { breadcrumbs } = useBreadcrumb({})
    const match = useRouteMatch()
    const { url } = match
    return (
        <div className="chart-group-list-page">
            <div className="page-header">
                <div className="flex column left">
                    <div className="flex left">
                        <BreadCrumb breadcrumbs={breadcrumbs.slice(1)} />
                    </div>
                    <div className="page-header__title">Chart Groups</div>
                </div>
                <div className="page-header__cta-container flex">
                    <Link className="flex cta" to={`${url}/create`}>
                        <Add className="icon-dim-18 mr-5" /> Create Group
                    </Link>
                </div>
            </div>
            <div className="chart-group-list-page__body">
                {loading ? (
                    <Progressing pageLoader />
                ) : (
                        <div className="chart-grid">
                            {result?.result?.groups
                                ?.sort((a, b) => a.name.localeCompare(b.name))
                                .map((chartGroup) => (
                                    <ChartGroupCard key={chartGroup.id} chartGroup={chartGroup} />
                                ))}
                        </div>
                    )}
            </div>
        </div>
    );
}

export default function ChartGroupRouter() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const { url, path } = match
    return (
        <Switch>
            <Route exact path={`${path}/create`}>
                <ChartGroupList />
                <CreateChartGroup
                    history={history}
                    location={location}
                    match={match}
                    closeChartGroupModal={() => history.push(url)}
                />
            </Route>
            <Route exact path={`${path}/:groupId/edit`} component={ChartGroupUpdate} />
            <Route exact path={`${path}/:groupId/deploy`} component={ChartGroupAdvanceDeploy} />
            <Route exact path={`${path}/:groupId`} component={ChartGroupDetails} />
            <Route>
                <ChartGroupList />
            </Route>
        </Switch>
    )
}

export function ChartGroupListMin({ chartGroups }) {
    const history = useHistory();
    const match = useRouteMatch();

    return <div className="chart-group" style={{ minHeight: "280px" }}>
        <div className="chart-group__header">
            <div className="flexbox">
                <h2 className="chart-grid__title">Chart Groups</h2>
                <button type="button" className="chart-group__view-all"
                    onClick={(e) => history.push(match.url + '/group')}>View All
                </button>
            </div>
        </div>
        <div className="chart-grid chart-grid--chart-group-snapshot">
            {chartGroups?.map((chartGroup, idx) => <ChartGroupCard key={idx} chartGroup={chartGroup} />)}
        </div>
    </div>
}