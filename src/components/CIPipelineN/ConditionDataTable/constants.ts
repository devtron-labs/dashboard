import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export const CONDITION_DATA_TABLE_OPERATOR_OPTIONS: SelectPickerOptionType<string>[] = [
    { label: '==', value: '==', description: 'equal to' },
    { label: '!=', value: '!=', description: 'not equal to' },
    { label: '<', value: '<', description: 'less than' },
    { label: '>', value: '>', description: 'greater than' },
    { label: '<=', value: '<=', description: 'less than or equal to' },
    { label: '>=', value: '>=', description: 'greater than or equal to' },
]
