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

import { MultiValue } from 'react-select'

import { OptionType } from '@devtron-labs/devtron-fe-common-lib'

import { FilterParentType, GroupFilterType, GroupOptionType } from '@Components/ApplicationGroup/AppGroup.types'

export enum FILE_EXTENSION {
    JSON = 'json',
    YAML = 'yaml',
    YML = 'yml',
}

export enum MIME_TYPE {
    APPLICATION_JSON = 'application/json',
    APPLICATION_X_YAML = 'application/x-yaml',
    APPLICATION_YAML = 'application/yaml',
    TEXT_X_YAML = 'text/x-yaml',
    TEXT_YAML = 'text/yaml',
    PLAIN_TEXT = 'plain/text',
}

export enum URL_PARAM_MODE_TYPE {
    REVIEW_CONFIG = 'review-config',
    LIST = 'list',
}

export interface GetAndSetAppGroupFiltersParamsType
    extends Pick<
        GroupFilterType,
        'appListOptions' | 'groupFilterOptions' | 'setSelectedAppList' | 'setSelectedGroupFilter'
    > {
    filterParentType: FilterParentType
    resourceId: string
}

export interface SetFiltersInLocalStorageParamsType {
    filterParentType: FilterParentType
    resourceId: string
    resourceList: MultiValue<OptionType>
    groupList: MultiValue<GroupOptionType>
}
