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

import { BaseRecentlyVisitedEntitiesTypes, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

import { AppHeaderType } from '@Components/app/types'

export interface AppSelectorType extends Pick<SelectPickerProps, 'onChange'>, Pick<AppHeaderType, 'appName'> {
    appId: number
    isJobView?: boolean
}

export interface AppListOptionsTypes {
    inputValue: string
    isJobView?: boolean
    signal?: AbortSignal
    recentlyVisitedResources?: BaseRecentlyVisitedEntitiesTypes[] | []
}

export interface ChartSelectorType {
    primaryKey: string // url match
    primaryValue: string
    matchedKeys: string[]
    api: (queryString?: string) => Promise<any>
    apiPrimaryKey?: string // primary key to generate map
    onChange?: ({ label, value }) => void
    formatOptionLabel?: ({ label, value, ...rest }) => React.ReactNode
    filterOption?: (option: any, searchString: string) => boolean
    path: string // path pattern for generatePath
}
