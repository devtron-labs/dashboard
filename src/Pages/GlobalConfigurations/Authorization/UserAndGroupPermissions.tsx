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

import {
    ConditionalWrap,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    Progressing,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { lazy, useMemo, useState } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { importComponentFromFELibrary } from '@Components/common'
import { API_STATUS_CODES, Routes } from '../../../config'
import './authorization.scss'
import { getCustomRoles } from './authorization.service'
import { AuthorizationProvider } from './AuthorizationProvider'
import { getMetaPossibleRoles } from './utils'
import { UserAndGroupPermissionsWrapProps } from './types'

const APITokens = lazy(() => import('./APITokens'))
const UserPermissions = lazy(() => import('./UserPermissions'))
const PermissionGroups = lazy(() => import('./PermissionGroups'))

const AuthorizationGlobalConfigWrapper = importComponentFromFELibrary('AuthorizationGlobalConfigWrapper')

const UserAndGroupPermissionsWrap = ({ children, setIsAutoAssignFlowEnabled }: UserAndGroupPermissionsWrapProps) => {
    const getWrap = (child) => (
        <AuthorizationGlobalConfigWrapper setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}>
            {child}
        </AuthorizationGlobalConfigWrapper>
    )

    return (
        <ConditionalWrap condition={!!AuthorizationGlobalConfigWrapper} wrap={getWrap}>
            {children}
        </ConditionalWrap>
    )
}

const UserAndGroupPermissions = () => {
    const { path } = useRouteMatch()
    const [isDataLoading, customRolesList, error, reload] = useAsync(getCustomRoles)
    // For handling the auto assign flow for enterprise
    const [isAutoAssignFlowEnabled, setIsAutoAssignFlowEnabled] = useState(false)

    // parsing access manager role as it is not required on FE
    // to be removed when access manager can give access manager permissions
    const filteredCustomRoles = customRolesList?.result.filter((role) => role.roleName !== 'accessManager')

    const authorizationProviderValue = useMemo(
        () => ({
            customRoles: getMetaPossibleRoles(filteredCustomRoles ?? []),
            isAutoAssignFlowEnabled,
        }),
        [isAutoAssignFlowEnabled, customRolesList],
    )

    if (isDataLoading) {
        return <Progressing pageLoader />
    }

    if (error) {
        if (error.code === API_STATUS_CODES.PERMISSION_DENIED) {
            return (
                <ErrorScreenNotAuthorized
                    subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                    title={TOAST_ACCESS_DENIED.TITLE}
                />
            )
        }
        return <Reload reload={reload} />
    }

    return (
        <div className="flexbox-col flex-grow-1 h-100 w-100 dc__content-center">
            <AuthorizationProvider value={authorizationProviderValue}>
                <Switch>
                    <Route path={`${path}/${Routes.USER_PERMISSIONS}`}>
                        <UserAndGroupPermissionsWrap setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}>
                            <UserPermissions />
                        </UserAndGroupPermissionsWrap>
                    </Route>
                    <Route path={`${path}/${Routes.PERMISSION_GROUPS}`}>
                        <UserAndGroupPermissionsWrap setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}>
                            <PermissionGroups />
                        </UserAndGroupPermissionsWrap>
                    </Route>
                    <Route path={`${path}/${Routes.API_TOKEN}`} component={APITokens} />
                    <Redirect to={`${path}/${Routes.USER_PERMISSIONS}`} />
                </Switch>
            </AuthorizationProvider>
        </div>
    )
}

export default UserAndGroupPermissions
