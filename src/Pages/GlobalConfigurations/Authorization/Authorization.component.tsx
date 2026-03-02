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
import { Route, Routes } from 'react-router-dom'

import { BASE_ROUTES } from '@devtron-labs/devtron-fe-common-lib'

import './authorization.scss'

const UserAndGroupPermissions = lazy(() => import('./UserAndGroupPermissions'))
const SSOLogin = lazy(() => import('./SSOLoginServices'))

const Authorization = () => {
    const authorizationContainerRef = useRef<HTMLDivElement>(null)

    return (
        <Routes>
            <Route path={BASE_ROUTES.GLOBAL_CONFIG.AUTH.LOGIN_SERVICE} element={<SSOLogin />} />
            <Route
                path="*"
                element={
                    <div
                        ref={authorizationContainerRef}
                        className="authorization-container flexbox-col flex-grow-1 h-100 bg__primary dc__overflow-hidden"
                    >
                        <div className="flex-grow-1 flexbox-col dc__overflow-auto">
                            <UserAndGroupPermissions authorizationContainerRef={authorizationContainerRef} />
                        </div>
                    </div>
                }
            />
        </Routes>
    )
}

export default Authorization
