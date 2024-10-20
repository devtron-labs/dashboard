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

import { Switch, useRouteMatch, Route } from 'react-router-dom'
import { Drawer } from '@devtron-labs/devtron-fe-common-lib'
import LinkedCIDetailsModal from './LinkedCIDetailsModal'
import { URLS } from '../../../config'
import { LinkedCIDetailModalProps } from './types'

const LinkedCIDetail = ({ workflows, handleClose }: LinkedCIDetailModalProps) => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/${URLS.LINKED_CI_DETAILS}/:ciPipelineId`} exact>
                <Drawer position="right" width="800px" onEscape={handleClose}>
                    <LinkedCIDetailsModal workflows={workflows} handleClose={handleClose} />
                </Drawer>
            </Route>
        </Switch>
    )
}

export default LinkedCIDetail
