import React from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import EnvironmentsList from './List/EnvironmentsList'
import EnvironmentDetailsRoute from './EnvironmentDetailsRoute'

export default function EnvironmentsRoute() {
    const { path } = useRouteMatch()
    return (
        <Switch>
            <Route path={`${path}/${URLS.APP_LIST}`} exact>
                <EnvironmentsList />
            </Route>
            <Route path={`${path}/:envId`}>
                <EnvironmentDetailsRoute />
            </Route>
            <Redirect to={`${path}/${URLS.APP_LIST}`} />
        </Switch>
    )
}
