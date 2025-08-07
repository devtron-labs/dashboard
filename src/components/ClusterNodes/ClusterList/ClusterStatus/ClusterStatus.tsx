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

/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { StatusComponent, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterStatusProps } from './types'
import { getClusterStatus } from './utils'

export const ClusterStatus = ({ status, errorInNodeListing }: ClusterStatusProps) => (
    <Tooltip alwaysShowTippyOnHover={!!errorInNodeListing} content={errorInNodeListing} interactive>
        {/* This div is added to render the tooltip, otherwise it is not visible. */}
        <div className="flex left">
            <StatusComponent status={getClusterStatus(status)} hideIconTooltip message={status} />
        </div>
    </Tooltip>
)
