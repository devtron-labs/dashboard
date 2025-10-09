import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { Overview } from './Overview'
import { VMList } from './VMList'

const ObservabilityRouter: React.FC = () => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/list`}>
                <VMList />
            </Route>

            <Route>
                <Overview />
            </Route>

            <Redirect to={path} />
        </Switch>
    )
}

export default ObservabilityRouter
