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
import ExternalArgoAppDetail from './ExternalArgoAppDetail'

export default function ExternalArgoApp() {
    const params = useParams<{ clusterId: string; appName: string; namespace: string }>()
    const { path } = useRouteMatch()

    return (
        <>
            <EAHeaderComponent
                title={AppListConstants.AppTabs.ARGO_APPS}
                redirectURL={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.ARGO_APPS}`}
                showAppDetailsOnly
            />
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`}>
                        <ExternalArgoAppDetail
                            clusterId={params.clusterId}
                            appName={params.appName}
                            namespace={params.namespace}
                            isExternalApp
                        />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                </Switch>
            </Suspense>
        </>
    )
}
