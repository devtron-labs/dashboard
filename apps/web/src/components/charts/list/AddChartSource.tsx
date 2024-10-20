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

import { NavLink } from 'react-router-dom'
import { URLS } from '../../../config'

const AddChartSource = ({ baseClass }: { baseClass?: string }) => (
    <div className={`chart-list__add w-200 en-2 bw-1 br-4 bcn-0 fw-4 fs-13 cn-9 mt-8 pt-4 pb-4 ${baseClass || ''}`}>
        <NavLink className="add-repo-row dc__no-decor pl-8 pr-8 flex left cn-9" to={URLS.GLOBAL_CONFIG_CHART}>
            Add Chart Repository
        </NavLink>

        <NavLink className="add-repo-row dc__no-decor pl-8 pr-8 flex left cn-9" to={`${URLS.GLOBAL_CONFIG_DOCKER}/0`}>
            Add OCI Registry
        </NavLink>
    </div>
)

export default AddChartSource
