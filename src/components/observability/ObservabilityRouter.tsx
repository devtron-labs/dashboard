import { Redirect, Route, Switch } from 'react-router-dom'

import { URLS } from '@devtron-labs/devtron-fe-common-lib'

import { Overview } from './Overview'
import { VMList } from './VMList'

const ObservabilityRouter: React.FC = () => (
    <Switch>
        <Route exact path={URLS.OBSERVABILITY_LIST}>
            <VMList />
        </Route>

        <Route exact path={URLS.OBSERVABILITY_OVERVIEW}>
            <Overview />
        </Route>

        <Redirect exact to={URLS.OBSERVABILITY_OVERVIEW} />
    </Switch>
)

export default ObservabilityRouter
