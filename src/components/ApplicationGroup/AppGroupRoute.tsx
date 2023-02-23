import React, { useState } from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import EnvironmentsList from './List/EnvironmentsList'
import EnvironmentDetailsRoute from './AppGroupDetailsRoute'
import { AppContext } from '../common'
import { AppGroupAdminType } from './AppGroup.types'

export default function EnvironmentsRoute({ isSuperAdmin }: AppGroupAdminType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)

    return (
        <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
            <Switch>
                <Route path={`${path}/${URLS.APP_LIST}`}>
                    <EnvironmentsList isSuperAdmin={isSuperAdmin} />
                </Route>
                <Route path={`${path}/:envId`}>
                    <EnvironmentDetailsRoute isSuperAdmin={isSuperAdmin} />
                </Route>
                <Redirect to={`${path}/${URLS.APP_LIST}`} />
            </Switch>
        </AppContext.Provider>
    )
}
