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

import { Navigate, Route, Routes } from 'react-router-dom'

import { BASE_ROUTES } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { SecurityCenterOverview } from '@PagesDevtron2.0/SecurityCenter'

import { SecurityPoliciesTab } from './SecurityPoliciesTab'
import { VulnerabilitiesRouter } from './Vulnerabilities'

import './security.scss'

const SecurityEnablement = importComponentFromFELibrary('SecurityEnablement', null, 'function')

export const Security = () => (
    <Routes>
        <Route path={BASE_ROUTES.SECURITY_CENTER.OVERVIEW} element={<SecurityCenterOverview />} />
        <Route path={`${BASE_ROUTES.SECURITY_CENTER.VULNERABILITIES.ROOT}/*`} element={<VulnerabilitiesRouter />} />
        {SecurityEnablement && (
            <Route path={BASE_ROUTES.SECURITY_CENTER.SECURITY_ENABLEMENT} element={<SecurityEnablement />} />
        )}
        <Route path={`${BASE_ROUTES.SECURITY_CENTER.POLICIES}/*`} element={<SecurityPoliciesTab />} />
        <Route path="*" element={<Navigate to={BASE_ROUTES.SECURITY_CENTER.OVERVIEW} />} />
    </Routes>
)
