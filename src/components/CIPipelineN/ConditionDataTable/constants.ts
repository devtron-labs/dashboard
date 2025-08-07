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

import { ConditionType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export const EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS: SelectPickerOptionType<string>[] = [
    { label: '==', value: '==', description: 'equal to' },
    { label: '!=', value: '!=', description: 'not equal to' },
]

export const CONDITION_DATA_TABLE_OPERATOR_OPTIONS: SelectPickerOptionType<string>[] = [
    ...EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS,
    { label: '<', value: '<', description: 'less than' },
    { label: '>', value: '>', description: 'greater than' },
    { label: '<=', value: '<=', description: 'less than or equal to' },
    { label: '>=', value: '>=', description: 'greater than or equal to' },
]

export const CONDITION_DATA_TABLE_ADD_BUTTON_TIPPY_MAP: Record<ConditionType, string> = {
    [ConditionType.TRIGGER]: 'Add trigger condition',
    [ConditionType.SKIP]: 'Add skip condition',
    [ConditionType.PASS]: 'Add pass condition',
    [ConditionType.FAIL]: 'Add fail condition',
}

export const CONDITION_TYPE_HELP_TEXT_MAP: Record<ConditionType, string> = {
    [ConditionType.TRIGGER]: 'Set trigger conditions to execute this task conditionally',
    [ConditionType.SKIP]: 'Set skip conditions to skip this task conditionally',
    [ConditionType.PASS]: 'Set pass conditions for this stage',
    [ConditionType.FAIL]: 'Set fail conditions for this stage',
}
