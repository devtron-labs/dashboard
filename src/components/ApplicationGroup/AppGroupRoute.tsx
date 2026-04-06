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

import { useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { BASE_ROUTES } from '@devtron-labs/devtron-fe-common-lib'

import { AppContext } from '../common'
import EnvironmentsList from './List/EnvironmentsList'
import { AppGroupAdminType } from './AppGroup.types'
import AppGroupDetailsRoute from './AppGroupDetailsRoute'

const APP_GROUP_ROUTES = BASE_ROUTES.APPLICATION_MANAGEMENT.APPLICATION_GROUP

const AppGroupRoute = ({ isSuperAdmin }: AppGroupAdminType) => {
    const [environmentId, setEnvironmentId] = useState(null)
    const [currentEnvironmentName, setCurrentEnvironmentName] = useState<string>('')

    const contextValue = useMemo(
        () => ({
            environmentId,
            setEnvironmentId,
            currentEnvironmentName,
            setCurrentEnvironmentName,
        }),
        [environmentId, currentEnvironmentName],
    )

    return (
        <AppContext.Provider value={contextValue}>
            <Routes>
                <Route path={APP_GROUP_ROUTES.LIST} element={<EnvironmentsList isSuperAdmin={isSuperAdmin} />} />
                <Route
                    path={`${APP_GROUP_ROUTES.DETAIL.ROOT}/*`}
                    element={<AppGroupDetailsRoute isSuperAdmin={isSuperAdmin} />}
                />
                <Route path="*" element={<Navigate to={APP_GROUP_ROUTES.LIST} />} />
            </Routes>
        </AppContext.Provider>
    )
}

export default AppGroupRoute
