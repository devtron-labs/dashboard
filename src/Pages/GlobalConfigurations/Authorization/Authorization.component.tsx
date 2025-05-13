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

import { lazy, useRef } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { Routes } from '../../../config'

import './authorization.scss'

const UserAndGroupPermissions = lazy(() => import('./UserAndGroupPermissions'))
const SSOLogin = lazy(() => import('./SSOLoginServices'))

const Authorization = () => {
    const { path } = useRouteMatch()
    const authorizationContainerRef = useRef<HTMLDivElement>(null)

    return (
        <Switch>
            <Route path={`${path}/${Routes.SSO_LOGIN_SERVICES}`} component={SSOLogin} />
            <Route
                path={path}
                render={() => (
                    <div
                        ref={authorizationContainerRef}
                        className="authorization-container flexbox-col flex-grow-1 h-100 bg__primary dc__overflow-hidden"
                    >
                        <div className="flex-grow-1 flexbox-col dc__overflow-auto">
                            <UserAndGroupPermissions authorizationContainerRef={authorizationContainerRef} />
                        </div>
                    </div>
                )}
            />
            <Redirect to={`${path}/${Routes.USER_PERMISSIONS}`} />
        </Switch>
    )
}

export default Authorization
