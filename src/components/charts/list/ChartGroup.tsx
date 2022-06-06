import React from 'react'
import { Progressing, BreadCrumb, useAsync, useBreadcrumb } from '../../common'
import { getChartGroups } from '../charts.service'
import ChartGroupCard from '../util/ChartGroupCard'
import { useRouteMatch, useHistory, useLocation, Switch } from 'react-router'
import { Route, Link } from 'react-router-dom'
import CreateChartGroup from '../modal/CreateChartGroup'
import ChartGroupUpdate from '../ChartGroupUpdate'
import ChartGroupDetails from '../ChartGroupDetails'
import ChartGroupAdvanceDeploy from '../ChartGroupAdvanceDeploy'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import PageHeader from '../../common/header/PageHeader'

function ChartGroupList() {
    const [loading, result, error, reload] = useAsync(getChartGroups, [])
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'chart-store': null,
                group: { component: 'Chart Groups', linked: false },
            },
        },
        [],
    )
    const match = useRouteMatch()
    const { url } = match

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </div>
        )
    }

    const renderCreateGroupButton = () => {
        return (
            <div className="page-header__cta-container flex ">
                <Link className="flex cta h-32" to={`${url}/create`}>
                    <Add className="icon-dim-18 mr-5" /> Create Group
                </Link>
            </div>
        )
    }
    return (
        <div className="chart-group-list-page">
            <PageHeader
                isBreadcrumbs={true}
                breadCrumbs={renderBreadcrumbs}
                renderActionButtons={renderCreateGroupButton}
            />
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
    )
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
