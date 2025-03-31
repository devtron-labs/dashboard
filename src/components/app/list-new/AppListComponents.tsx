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

import { GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as InfoFill } from '@Icons/ic-info-filled.svg'
import { APP_LIST_EMPTY_STATE_MESSAGING } from './Constants'
import { AskToClearFiltersProps } from './AppListType'

const AskToClearFilters = ({ clearAllFilters, showTipToSelectCluster = false }: AskToClearFiltersProps) => (
    <GenericFilterEmptyState
        title={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFound}
        subTitle={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
        handleClearFilters={clearAllFilters}
    >
        {showTipToSelectCluster && (
            <div className="mt-18">
                <p
                    className="bcb-1 cn-9 fs-13 pt-10 pb-10 pl-16 pr-16 eb-2 bw-1 br-4 cluster-tip flex left top"
                    style={{ width: '300px' }}
                >
                    <span>
                        <InfoFill className="icon-dim-20" />
                    </span>
                    <div className="ml-12 cn-9" style={{ textAlign: 'start' }}>
                        <span className="fw-6">Tip </span>
                        <span>{APP_LIST_EMPTY_STATE_MESSAGING.selectCluster}</span>
                    </div>
                </p>
            </div>
        )}
    </GenericFilterEmptyState>
)

export default AskToClearFilters
