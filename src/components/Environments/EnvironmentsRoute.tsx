import React, { useState } from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import EnvironmentsList from './List/EnvironmentsList'
import EnvironmentDetailsRoute from './EnvironmentDetailsRoute'
import { AppContext } from '../common'

export default function EnvironmentsRoute() {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    
    return (
        <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
            <Switch>
            <Route path={`${path}/${URLS.APP_LIST}`}>
                <EnvironmentsList />
            </Route>
            <Route path={`${path}/:envId`}>
                <EnvironmentDetailsRoute />
            </Route>
            <Redirect to={`${path}/${URLS.APP_LIST}`} />
        </Switch>
        </AppContext.Provider>
    )
}
