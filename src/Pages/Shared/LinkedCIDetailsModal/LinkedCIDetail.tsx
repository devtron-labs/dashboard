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

import { Route, Routes } from 'react-router-dom'

import { URLS } from '../../../config'
import LinkedCIDetailsModal from './LinkedCIDetailsModal'
import { LinkedCIDetailModalProps } from './types'

const LinkedCIDetail = ({ workflows }: LinkedCIDetailModalProps) => (
    <Routes>
        <Route
            path={`${URLS.LINKED_CI_DETAILS}/:ciPipelineId`}
            element={<LinkedCIDetailsModal workflows={workflows} />}
        />
    </Routes>
)

export default LinkedCIDetail
