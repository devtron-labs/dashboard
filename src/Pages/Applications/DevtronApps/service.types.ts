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
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { ConfigResourceType } from '@devtron-labs/devtron-fe-common-lib'
import { STAGE_NAME } from './Details/AppConfigurations/AppConfig.types'

export interface AppConfigStatusItemType {
    stage: number
    stageName: STAGE_NAME
    status: boolean
    required: boolean
}

export enum ResourceConfigState {
    Unnamed = 'Unnamed',
    Draft = 'Draft',
    ApprovalPending = 'ApprovalPending',
    Published = 'Published',
}

export enum ResourceConfigStage {
    Inheriting = 'Inheriting',
    Overridden = 'Overridden',
    Env = 'Env',
    Unpublished = 'Unpublished',
}

export interface ResourceConfig {
    name: string
    configState: ResourceConfigState
    type: ConfigResourceType
    configStage: ResourceConfigStage
    id: number
}

export interface EnvConfigDTO {
    resourceConfig: ResourceConfig[]
}
