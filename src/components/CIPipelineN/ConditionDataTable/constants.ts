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
