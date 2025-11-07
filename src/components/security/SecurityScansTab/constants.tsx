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

import { GroupedFilterSelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

import { ScanDetailsType, SearchType, SearchTypeOptionType, SecurityScansTabMultiFilterKeys } from './types'

export const INITIAL_SCAN_DETAILS: ScanDetailsType = {
    appId: 0,
    envId: 0,
}

export const SEARCH_TYPE_OPTIONS: SearchTypeOptionType[] = [
    { label: 'Application', value: SearchType.APPLICATION },
    { label: 'Vulnerability', value: SearchType.VULNERABILITY },
]

export const SCAN_LIST_GROUP_FILTER_OPTIONS: GroupedFilterSelectPickerProps<SecurityScansTabMultiFilterKeys>['options'] =
    [
        {
            items: [
                {
                    id: SecurityScansTabMultiFilterKeys.cluster,
                    label: 'Cluster',
                },
                {
                    id: SecurityScansTabMultiFilterKeys.environment,
                    label: 'Environment',
                },
                {
                    id: SecurityScansTabMultiFilterKeys.severity,
                    label: 'Severity',
                },
            ],
        },
    ]
