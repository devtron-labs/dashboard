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

import { getEmptyTagTableRow } from '@devtron-labs/devtron-fe-common-lib'
import { CreateAppFormErrorStateType, CreateAppFormStateType } from './types'

export const createAppInitialFormState: CreateAppFormStateType = {
    name: '',
    projectId: null,
    description: '',
    tags: [getEmptyTagTableRow()],
    cloneAppId: null,
    templateConfig: null,
    gitMaterials: null,
    buildConfiguration: null,
    workflowConfig: null,
}

export const createAppInitialFormErrorState: CreateAppFormErrorStateType = {
    name: '',
    projectId: '',
    description: '',
    tags: {},
    cloneAppId: null,
    gitMaterials: null,
    workflowConfig: null,
}
