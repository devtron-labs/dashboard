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

import { DeploymentChartType, SortingOrder, stringComparatorBySortOrder } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentChartsListSortableKeys } from '../types'

export const sortChartList = (
    a: DeploymentChartType,
    b: DeploymentChartType,
    sortBy: DeploymentChartsListSortableKeys,
    sortOrder: SortingOrder,
) => {
    switch (sortBy) {
        case DeploymentChartsListSortableKeys.CHART_VERSION:
            return stringComparatorBySortOrder(a.versions[0].version, b.versions[0].version, sortOrder)
        case DeploymentChartsListSortableKeys.UPLOADED_BY:
            return stringComparatorBySortOrder(a.versions[0].uploadedBy, b.versions[0].uploadedBy, sortOrder)
        default:
            return stringComparatorBySortOrder(a.name, b.name, sortOrder)
    }
}
