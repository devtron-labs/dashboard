/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { lazy } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import {
    ERROR_EMPTY_SCREEN,
    ErrorScreenNotAuthorized,
    Progressing,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

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
