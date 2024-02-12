import React, { lazy } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { Routes } from '../../../config'
import './authorization.scss'

const UserAndGroupPermissions = lazy(() => import('./UserAndGroupPermissions'))
const SSOLogin = lazy(() => import('./SSOLoginServices'))

const Authorization = () => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/${Routes.SSO_LOGIN_SERVICES}`} component={SSOLogin} />
            <Route
                path={path}
                render={() => (
                    <div className="authorization-container flexbox-col flex-grow-1 min-h-100 bcn-0 flex-align-center dc__content-center pt-16">
                        <UserAndGroupPermissions />
                    </div>
                )}
            />
            <Redirect to={`${path}/${Routes.USER_PERMISSIONS}`} />
        </Switch>
    )
}

export default Authorization
