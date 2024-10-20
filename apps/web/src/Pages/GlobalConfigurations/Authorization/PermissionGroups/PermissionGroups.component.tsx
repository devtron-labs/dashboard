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

const PermissionGroupList = lazy(() => import('./List'))
const PermissionGroupAddEdit = lazy(() => import('./AddEdit'))

const PermissionGroups = () => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={path} component={PermissionGroupList} exact />
            <Route
                path={`${path}/:groupId`}
                render={({ match }) => (
                    <section className="flexbox-col flex-grow-1 h-100">
                        {/* Passing the groupId as key to re-mount the component on its change */}
                        <PermissionGroupAddEdit key={match.params.groupId} />
                    </section>
                )}
            />
            <Redirect to={path} />
        </Switch>
    )
}

export default PermissionGroups
