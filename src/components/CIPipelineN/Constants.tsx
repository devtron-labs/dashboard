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

import { ConditionContainerType, ConditionType } from '@Components/ciPipeline/types'

export const TIPPY_VAR_MSG = 'This is a variable. It will be replaced with the value during execution.'

export const excludeVariables = ['DOCKER_IMAGE_TAG', 'DOCKER_IMAGE']

export const INLINE_PLUGIN_TEXT = {
    TITLE: 'Execute custom task',
    DESCRIPTION: 'Write a script to perform custom task or create custom plugin',
}

export const CONTAINER_CONDITION_TYPE_TO_CONDITION_TYPE_MAP = {
    [ConditionContainerType.TRIGGER_SKIP]: [ConditionType.TRIGGER, ConditionType.SKIP],
    [ConditionContainerType.PASS_FAILURE]: [ConditionType.PASS, ConditionType.FAIL],
}

export enum TaskActionMenuOptionIdEnum {
    DELETE = 'delete',
    MOVE = 'move',
}
