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

import React, { useState } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'
import EnvironmentsList from './List/EnvironmentsList'
import { AppContext } from '../common'
import { AppGroupAdminType } from './AppGroup.types'
import AppGroupDetailsRoute from './AppGroupDetailsRoute'

export default function AppGroupRoute({ isSuperAdmin }: AppGroupAdminType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    const [currentEnvironmentName, setCurrentEnvironmentName] = useState<string>('')

    return (
        <AppContext.Provider
            value={{ environmentId, setEnvironmentId, currentEnvironmentName, setCurrentEnvironmentName }}
        >
            <Switch>
                <Route path={`${path}/${URLS.APP_LIST}`}>
                    <EnvironmentsList isSuperAdmin={isSuperAdmin} />
                </Route>
                <Route
                    path={`${path}/:envId`}
                    render={({ match }) => (
                        <AppGroupDetailsRoute
                            isSuperAdmin={isSuperAdmin}
                            key={`environment-${match.params.envId}-route`}
                        />
                    )}
                />
                <Redirect to={`${path}/${URLS.APP_LIST}`} />
            </Switch>
        </AppContext.Provider>
    )
}
