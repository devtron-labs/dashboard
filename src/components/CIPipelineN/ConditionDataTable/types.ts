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

import { ChangeEvent } from 'react'

import {
    ConditionDataTableHeaderKeys,
    ConditionType,
    DynamicDataTableProps,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { ConditionContainerType } from '@Components/ciPipeline/types'

export interface ConditionDataTableCustomState {
    conditionType: ConditionType
    variableType: VariableTypeFormat | null
}

export type ConditionDataTableType = DynamicDataTableProps<ConditionDataTableHeaderKeys, ConditionDataTableCustomState>

export interface ConditionDataTableProps extends Pick<ConditionDataTableCustomState, 'conditionType'> {
    type: ConditionContainerType
    handleConditionTypeChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export enum ConditionDataTableActionType {
    ADD_ROW = 'ADD_ROW',
    UPDATE_ROW = 'UPDATE_ROW',
    DELETE_ROW = 'DELETE_ROW',
}

type ConditionDataTableActionPropsMap = {
    [ConditionDataTableActionType.ADD_ROW]: {}
    [ConditionDataTableActionType.UPDATE_ROW]: {
        actionValue: string
        headerKey: ConditionDataTableHeaderKeys
    }
    [ConditionDataTableActionType.DELETE_ROW]: {}
}

export type ConditionDataTableAction<
    T extends keyof ConditionDataTableActionPropsMap = keyof ConditionDataTableActionPropsMap,
> = T extends keyof ConditionDataTableActionPropsMap
    ? { actionType: T; rowId: string | number } & ConditionDataTableActionPropsMap[T]
    : never

export type HandleRowUpdateActionProps = ConditionDataTableAction
