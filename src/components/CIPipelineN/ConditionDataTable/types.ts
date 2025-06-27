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
