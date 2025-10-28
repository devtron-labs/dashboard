import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { URLS } from '@devtron-labs/devtron-fe-common-lib'

import Customers from './Customer/Customers'
import Project from './ProjectObservability/Project'
import { ProjectOverview } from './ProjectObservability/ProjectOverview'
import VM from './VMObservability/VM'
import VMList from './VMObservability/VMList'
import { VMOverview } from './VMObservability/VMOverview'
import { Overview } from './Overview'

const ObservabilityRouter: React.FC = () => {
    const { path } = useRouteMatch()
    return (
        <Switch>
            <Route exact path={URLS.OBSERVABILITY_OVERVIEW}>
                <Overview />
            </Route>

            <Route exact path={URLS.OBSERVABILITY_CUSTOMER_LIST}>
                <Customers />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/projects/:projectId`}>
                <VM />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/projects/:projectId/vms`}>
                <VMList />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/projects/:projectId/vms/overview`}>
                <VMOverview />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId`}>
                <Project />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/overview`}>
                <ProjectOverview />
            </Route>

            <Redirect from={path} to={URLS.OBSERVABILITY_OVERVIEW} />
        </Switch>
    )
}

export default ObservabilityRouter
