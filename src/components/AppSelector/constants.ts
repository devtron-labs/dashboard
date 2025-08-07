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

import { RecentlyVisitedGroupedOptionsType } from '@devtron-labs/devtron-fe-common-lib'

export const getMinCharSearchPlaceholderGroup = (resourceKind): RecentlyVisitedGroupedOptionsType => ({
    label: `All ${resourceKind}`,
    options: [{ value: 0, label: 'Type 3 characters to search', isDisabled: true }],
})

export const appSelectorGAEvents = {
    DA_SWITCH_RECENTLY_VISITED_CLICKED: 'DA_SWITCH_RECENTLY_VISITED_CLICKED',
    DA_SWITCH_SEARCHED_APP_CLICKED: 'DA_SWITCH_SEARCHED_APP_CLICKED',
    JOB_SWITCH_RECENTLY_VISITED_CLICKED: 'JOB_SWITCH_RECENTLY_VISITED_CLICKED',
    JOB_SWITCH_SEARCHED_ITEM_CLICKED: 'JOB_SWITCH_SEARCHED_ITEM_CLICKED',
    CS_CHART_DETAIL_SWITCH_ITEM_CLICKED: 'CS_CHART_DETAIL_SWITCH_ITEM_CLICKED',
}
