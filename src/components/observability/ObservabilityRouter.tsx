import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { URLS } from '@devtron-labs/devtron-fe-common-lib'

import Customers from './Customer/Customers'
import Project from './ProjectObservability/Project'
import VM from './VMObservability/VM'
import { Overview } from './Overview'

const ObservabilityRouter: React.FC = () => {
    const { path, url } = useRouteMatch()
    return (
        <Switch>
            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/projects/:projectId/vms/:vmId`}>
                <Overview view="singleVm" url={url} />
            </Route>

            <Route exact path={URLS.OBSERVABILITY_OVERVIEW}>
                <Overview view="tenants" url={url} />
            </Route>

            <Route exact path={URLS.OBSERVABILITY_CUSTOMER_LIST}>
                <Customers />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/projects/:projectId`}>
                <VM />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/projects/:projectId/vms/overview`}>
                <Overview view="vm" url={url} />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId`}>
                <Project />
            </Route>

            <Route path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customerId/overview`}>
                <Overview view="project" url={url} />
            </Route>

            <Redirect from={path} to={URLS.OBSERVABILITY_OVERVIEW} />
        </Switch>
    )
}

export default ObservabilityRouter
