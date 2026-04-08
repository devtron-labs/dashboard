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

import { Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { AppListConstants, Progressing, ROUTER_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '../../config'
import ExternalAppDetail from '../v2/appDetails/ea/EAAppDetail.component'
import ChartDeploymentHistory from '../v2/chartDeploymentHistory/ChartDeploymentHistory.component'
import EAHeaderComponent from '../v2/headers/EAHeader.component'
import ChartValuesView from '../v2/values/chartValuesDiff/ChartValuesView'

const ExternalApps = () => {
    const params = useParams<{ appId: string; appName: string }>()
    return (
        <div className="flexbox-col h-100">
            <EAHeaderComponent
                title={AppListConstants.AppTabs.HELM_APPS}
                redirectURL={ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST.HELM}
                breadCrumbConfig={{
                    ea: null,
                }}
                breadcrumbPathPattern={ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_APP_DETAIL.EXTERNAL_HELM_APP}
            />
            <Suspense fallback={<Progressing pageLoader />}>
                <Routes>
                    <Route
                        path={`${URLS.APP_DETAILS}/*`}
                        element={<ExternalAppDetail appId={params.appId} appName={params.appName} isExternalApp />}
                    />
                    <Route path={URLS.APP_VALUES} element={<ChartValuesView appId={params.appId} isExternalApp />} />
                    <Route
                        path={URLS.APP_DEPLOYMNENT_HISTORY}
                        element={<ChartDeploymentHistory appId={params.appId} appName={params.appName} isExternal />}
                    />
                    <Route path="*" element={<Navigate to={URLS.APP_DETAILS} />} />
                </Routes>
            </Suspense>
        </div>
    )
}

export default ExternalApps
