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

import React, { Suspense } from 'react'
import { Route, Switch, Redirect, useRouteMatch, useParams } from 'react-router-dom'
import { Progressing, AppListConstants } from '@devtron-labs/devtron-fe-common-lib'
import EAHeaderComponent from '../v2/headers/EAHeader.component'
import { URLS } from '../../config'
import ExternalAppDetail from '../v2/appDetails/ea/EAAppDetail.component'
import ChartDeploymentHistory from '../v2/chartDeploymentHistory/ChartDeploymentHistory.component'
import ChartValuesView from '../v2/values/chartValuesDiff/ChartValuesView'

export default function ExternalApps() {
    const params = useParams<{ appId: string; appName: string }>()
    const { path } = useRouteMatch()
    return (
        <div className="flexbox-col h-100">
            <EAHeaderComponent
                title={AppListConstants.AppTabs.HELM_APPS}
                redirectURL={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.HELM_APPS}`}
            />
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`}>
                        <ExternalAppDetail appId={params.appId} appName={params.appName} isExternalApp />
                    </Route>
                    <Route path={`${path}/${URLS.APP_VALUES}`}>
                        <ChartValuesView appId={params.appId} isExternalApp />
                    </Route>
                    <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`}>
                        <ChartDeploymentHistory appId={params.appId} appName={params.appName} isExternal />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                </Switch>
            </Suspense>
        </div>
    )
}
