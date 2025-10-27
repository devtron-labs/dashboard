import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { URLS } from '@devtron-labs/devtron-fe-common-lib'

import VM from './VMObservability/VM'
import Customers from './Customers'

const ObservabilityRouter: React.FC = () => {
    const { path } = useRouteMatch()
    return (
        <Switch>
            <Route exact path={URLS.OBSERVABILITY_OVERVIEW}>
                <VM />
            </Route>

            <Route exact path={URLS.OBSERVABILITY_CUSTOMER_LIST}>
                <Customers />
            </Route>

            <Redirect exact from={path} to={URLS.OBSERVABILITY} />
        </Switch>
    )
}

export default ObservabilityRouter
