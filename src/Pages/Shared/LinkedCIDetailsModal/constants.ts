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

import { getCommonSelectStyle, TriggerType } from '@devtron-labs/devtron-fe-common-lib'
import { LinkedCIApp } from './types'
import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS, DEPLOYMENT_STATUS, SELECT_ALL_VALUE } from '../../../config'

export const appListLoading: LinkedCIApp[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map(
    (index) => ({
        appId: index,
        appName: '',
        deploymentStatus: DEPLOYMENT_STATUS.SUCCEEDED,
        environmentId: 0,
        environmentName: '',
        triggerMode: TriggerType.Auto,
    }),
)

export enum SortableKeys {
    appName = 'app_name',
}

export const ALL_ENVIRONMENT_OPTION = { label: 'All Environments', value: SELECT_ALL_VALUE }

export const ENVIRONMENT_FILTER_SEARCH_KEY = 'environment'

const commonStyles = getCommonSelectStyle()

export const environmentFilterDropdownStyles = {
    ...commonStyles,
    control: (base, state) => ({
        ...commonStyles.control(base, state),
        width: 200,
        height: 32,
        minHeight: 32,
    }),
    menu: (base, state) => ({
        ...commonStyles.menu(base, state),
        zIndex: 5,
    }),
}
