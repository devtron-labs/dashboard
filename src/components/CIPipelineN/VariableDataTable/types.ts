import { DynamicDataTableRowType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export type VariableDataKeys = 'variable' | 'format' | 'val'

export type VariableDataCustomState = {
    choices: { id: number; value: string; error: string }[]
    askValueAtRuntime: boolean
    blockCustomValue: boolean
    selectedValue: Record<string, any>
}

export type VariableDataRowType = DynamicDataTableRowType<VariableDataKeys, VariableDataCustomState>

export enum VariableDataTableActionType {
    UPDATE_ROW = 'update_row',
    UPDATE_VAL_COLUMN = 'update_val_column',
    ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS = 'add_choices_to_value_column_options',
    UPDATE_CHOICES = 'update_choices',
    UPDATE_ASK_VALUE_AT_RUNTIME = 'update_ask_value_at_runtime',
    UPDATE_ALLOW_CUSTOM_INPUT = 'update_allow_custom_input',
}

type VariableDataTableActionPropsMap = {
    [VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT]: VariableDataCustomState['blockCustomValue']
    [VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME]: VariableDataCustomState['askValueAtRuntime']
    [VariableDataTableActionType.UPDATE_CHOICES]: (
        currentChoices: VariableDataCustomState['choices'],
    ) => VariableDataCustomState['choices']
    [VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS]: null
    [VariableDataTableActionType.UPDATE_VAL_COLUMN]: {
        value: string
        selectedValue: SelectPickerOptionType<string>
    }
    [VariableDataTableActionType.UPDATE_ROW]: string
}

export type VariableDataTableAction<
    T extends keyof VariableDataTableActionPropsMap = keyof VariableDataTableActionPropsMap,
> = T extends keyof VariableDataTableActionPropsMap
    ? { actionType: T; actionValue: VariableDataTableActionPropsMap[T] }
    : never

export type HandleRowUpdateActionProps = VariableDataTableAction & {
    rowId: string | number
    headerKey: VariableDataKeys
}

export interface VariableDataTableRowActionProps {
    row: VariableDataRowType
    onClose: () => void
    handleRowUpdateAction: (props: HandleRowUpdateActionProps) => void
}

export type AddChoicesOverlayProps = Pick<VariableDataTableRowActionProps, 'handleRowUpdateAction'> &
    Pick<VariableDataCustomState, 'choices' | 'askValueAtRuntime' | 'blockCustomValue'> & {
        rowId: VariableDataTableRowActionProps['row']['id']
    }
