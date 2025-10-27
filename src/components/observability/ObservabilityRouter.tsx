import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { URLS } from '@devtron-labs/devtron-fe-common-lib'

import Project from './ProjectObservability/Project'
import Customers from './Customers'
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

            <Route exact path={`${URLS.OBSERVABILITY_CUSTOMER_LIST}/:customer`}>
                <Project />
            </Route>

            <Redirect exact from={path} to={URLS.OBSERVABILITY_OVERVIEW} />
        </Switch>
    )
}

export default ObservabilityRouter
