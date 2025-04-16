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

import React from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { URLS as COMMON_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import ClusterInstallationStatus from './ClusterInstallationStatus'
import ResourceBrowser from './ResourceBrowser'
import ResourceList from './ResourceList'

import './ResourceBrowser.scss'

const CompareClusterViewWrapper = importComponentFromFELibrary('CompareClusterViewWrapper', null, 'function')

const ResourceBrowserRouter: React.FC = () => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            {CompareClusterViewWrapper && (
                <Route path={URLS.RESOURCE_BROWSER_INSTALLATION_CLUSTER} exact>
                    <ClusterInstallationStatus />
                </Route>
            )}

            <Route path={`${path}/:clusterId/:namespace/:nodeType/:group/:node?`}>
                <ResourceList />
            </Route>

            {CompareClusterViewWrapper && window._env_.FEATURE_RB_SYNC_CLUSTER_ENABLE && (
                <Route path={`${COMMON_URLS.RESOURCE_BROWSER}${COMMON_URLS.COMPARE_CLUSTERS}`} exact>
                    <CompareClusterViewWrapper />
                </Route>
            )}

            <Route path={path} exact>
                <ResourceBrowser />
            </Route>

            <Redirect to={path} />
        </Switch>
    )
}

export default ResourceBrowserRouter
