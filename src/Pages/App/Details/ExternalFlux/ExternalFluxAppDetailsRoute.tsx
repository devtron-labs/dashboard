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

import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppListConstants, Progressing, ROUTER_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import EAHeaderComponent from '../../../../components/v2/headers/EAHeader.component'

const ExternalFluxAppDetails = lazy(() => import('./ExternalFluxAppDetails'))

const ExternalFluxAppDetailsRoute = () => (
    <>
        <EAHeaderComponent
            title={AppListConstants.AppTabs.FLUX_APPS}
            redirectURL={ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST.FLUX_CD}
            showAppDetailsOnly
            breadCrumbConfig={{
                ':namespace': null,
                'external-flux': null,
                ':templateType': null,
            }}
            breadcrumbPathPattern={ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_APP_DETAIL.EXTERNAL_FLUX_APP}
        />
        <Suspense fallback={<Progressing pageLoader />}>
            <Routes>
                <Route path={`${URLS.APP_DETAILS}/*`} element={<ExternalFluxAppDetails />} />
                <Route path="*" element={<Navigate to={URLS.APP_DETAILS} />} />
            </Routes>
        </Suspense>
    </>
)

export default ExternalFluxAppDetailsRoute
