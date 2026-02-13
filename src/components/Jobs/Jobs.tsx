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

import { ErrorBoundary } from '../common'
import JobDetails from './JobDetails/JobDetails'
import JobsList from './JobList/JobsList'

const JOB_ROUTES = BASE_ROUTES.AUTOMATION_AND_ENABLEMENT.JOBS

const Jobs = () => (
    <ErrorBoundary>
        <Routes>
            <Route path={`${JOB_ROUTES.LIST.ROOT}/*`} element={<JobsList />} />
            <Route path={`${JOB_ROUTES.DETAIL.ROOT}/*`} element={<JobDetails />} />
            <Route path="*" element={<Navigate to={JOB_ROUTES.LIST.ROOT} replace />} />
        </Routes>
    </ErrorBoundary>
)

export default Jobs
