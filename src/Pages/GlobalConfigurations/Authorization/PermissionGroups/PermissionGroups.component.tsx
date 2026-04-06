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
import { Navigate, Route, Routes } from 'react-router-dom'

const PermissionGroupList = lazy(() => import('./List'))
const PermissionGroupAddEdit = lazy(() => import('./AddEdit'))

const PermissionGroups = () => (
    <Routes>
        <Route index element={<PermissionGroupList />} />
        <Route
            path=":groupId/*"
            element={
                <section className="flexbox-col flex-grow-1 h-100">
                    <PermissionGroupAddEdit />
                </section>
            }
        />
        <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
)

export default PermissionGroups
