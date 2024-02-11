import {
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    Progressing,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { lazy } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { API_STATUS_CODES } from '../../../../config'
import { getSSOConfigList } from '../SSOLoginServices/service'
import SSONotConfiguredState from './SSONotConfiguredState'

const UserPermissionList = lazy(() => import('./List'))
const UserPermissionAddEdit = lazy(() => import('./AddEdit'))

const UserPermissions = () => {
    const { path } = useRouteMatch()
    const [isSSOListLoading, ssoConfig, ssoConfigError, refetchSSOConfig] = useAsync(getSSOConfigList)

    if (isSSOListLoading) {
        return <Progressing pageLoader />
    }

    if (ssoConfigError) {
        if (ssoConfigError.code === API_STATUS_CODES.PERMISSION_DENIED) {
            return (
                <ErrorScreenNotAuthorized
                    subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                    title={TOAST_ACCESS_DENIED.TITLE}
                />
            )
        }
        return <Reload reload={refetchSSOConfig} />
    }

    const isSSOConfigured = ssoConfig?.result?.some((sso) => sso.active) || false

    // The users can only be configured if SSO is configured
    if (!isSSOConfigured) {
        return <SSONotConfiguredState />
    }

    return (
        <Switch>
            <Route path={path} component={UserPermissionList} exact />
            <Route
                path={`${path}/:userId`}
                render={({ match }) => (
                    <section className="flexbox-col flex-grow-1 h-100 dc__content-center">
                        {/* Passing the userId as key to re-mount the component on its change */}
                        <UserPermissionAddEdit key={match.params.userId} />
                    </section>
                )}
            />
            <Redirect to={path} />
        </Switch>
    )
}

export default UserPermissions
