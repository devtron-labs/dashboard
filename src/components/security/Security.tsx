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

import { URLS } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { SecurityPoliciesTab } from './SecurityPoliciesTab'
import { VulnerabilitiesRouter } from './Vulnerabilities'

import './security.scss'

const SecurityCenterOverview = importComponentFromFELibrary('SecurityCenterOverview', null, 'function')
const SecurityEnablement = importComponentFromFELibrary('SecurityEnablement', null, 'function')

export const Security = () => (
    <Switch>
        {SecurityCenterOverview && (
            <Route exact path={URLS.SECURITY_CENTER_OVERVIEW}>
                <SecurityCenterOverview />
            </Route>
        )}
        <Route path={URLS.SECURITY_CENTER_VULNERABILITIES}>
            <VulnerabilitiesRouter />
        </Route>
        {SecurityEnablement && (
            <Route path={URLS.SECURITY_CENTER_SECURITY_ENABLEMENT}>
                <SecurityEnablement />
            </Route>
        )}
        <Route path={URLS.SECURITY_CENTER_POLICIES}>
            <SecurityPoliciesTab />
        </Route>
        <Redirect to={SecurityCenterOverview ? URLS.SECURITY_CENTER_OVERVIEW : URLS.SECURITY_CENTER_VULNERABILITIES} />
    </Switch>
)
