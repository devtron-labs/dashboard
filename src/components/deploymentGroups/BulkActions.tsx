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
import { Switch, Route, Redirect } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import DeploymentGroupList from './DeploymentGroupList'
import BulkActionEdit from './BulkActionEdit'
import BulkActionDetails from './BulkActionDetails'
import './BulkActions.scss'
import { DOCUMENTATION, SERVER_MODE } from '../../config'
import EAEmptyState, { EAEmptyStateType } from '../common/eaEmptyState/EAEmptyState'
import { useMainContext } from '@devtron-labs/devtron-fe-common-lib'

export default function BulkActions({ ...props }) {
    const { path } = useRouteMatch()
    const { serverMode } = useMainContext()

    const renderEmptyStateForEAOnlyMode = () => {
        return (
            <div style={{ height: 'calc(100vh - 250px)' }}>
                <EAEmptyState
                    title="Create, build, deploy and debug custom apps"
                    msg="Create custom application by connecting your code repository. Build and deploy images at the click of a button. Debug your applications using the interactive UI."
                    stateType={EAEmptyStateType.BULKEDIT}
                    knowMoreLink={DOCUMENTATION.HOME_PAGE}
                    headerText="Deployment Groups"
                />
            </div>
        )
    }
    return serverMode === SERVER_MODE.EA_ONLY ? (
        renderEmptyStateForEAOnlyMode()
    ) : (
        <Switch>
            <Route path={`${path}/:id/details`} render={() => <BulkActionDetails />} />
            <Route exact path={`${path}/:id/edit`} render={() => <BulkActionEdit />} />
            <Route exact path={`${path}`} component={DeploymentGroupList} />
            <Redirect to={`${path}`} />
        </Switch>
    )
}
