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

import { Redirect, Route, Switch } from 'react-router-dom'
import { ERROR_STATUS_CODE, ErrorScreenManager, useMainContext, URLS } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { DeploymentChartsList } from './List'

const DeploymentChartDetailRouter = importComponentFromFELibrary('DeploymentChartDetailRouter', null, 'function')

const DeploymentChartsRouter = () => {
    const { isSuperAdmin } = useMainContext()

    if (!isSuperAdmin) {
        return <ErrorScreenManager code={ERROR_STATUS_CODE.PERMISSION_DENIED} />
    }

    return (
        // NOTE: need to give fixed height here for resizable code editor height
        <div className="flexbox-col bg__primary h-100">
            <Switch>
                <Route exact path={URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST}>
                    <DeploymentChartsList />
                </Route>
                {DeploymentChartDetailRouter && <DeploymentChartDetailRouter />}
                <Redirect to={URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST} />
            </Switch>
        </div>
    )
}

export default DeploymentChartsRouter
