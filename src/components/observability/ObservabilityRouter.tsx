import { Redirect, Route, Switch } from 'react-router-dom'

import { URLS } from '@devtron-labs/devtron-fe-common-lib'

import Project from './Project'
import VMList from './VMList'
import { Overview } from './Overview'

const ObservabilityRouter: React.FC = () => (
    <Switch>
        <Route exact path={URLS.OBSERVABILITY_LIST}>
            <Project />
        </Route>

        <Route exact path={URLS.OBSERVABILITY_OVERVIEW}>
            <Project/>
        </Route>

        <Redirect exact to={URLS.OBSERVABILITY_OVERVIEW} />
    </Switch>
)

export default ObservabilityRouter
