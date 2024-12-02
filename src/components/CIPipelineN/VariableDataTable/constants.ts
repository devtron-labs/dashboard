import { DynamicDataTableHeaderType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { PluginVariableType } from '@Components/ciPipeline/types'

import { VariableDataKeys } from './types'

export const getVariableDataTableHeaders = (
    type: PluginVariableType,
): DynamicDataTableHeaderType<VariableDataKeys>[] => [
    {
        label: 'VARIABLE',
        key: 'variable',
        width: '200px',
    },
    {
        label: 'TYPE',
        key: 'format',
        width: '100px',
    },
    {
        label: type === PluginVariableType.INPUT ? 'VALUE' : 'DESCRIPTION',
        key: 'val',
        width: '1fr',
    },
]

export const FORMAT_COLUMN_OPTIONS: SelectPickerOptionType<string>[] = [
    {
        label: 'STRING',
        value: 'STRING',
    },
    {
        label: 'NUMBER',
        value: 'NUMBER',
    },
    {
        label: 'BOOLEAN',
        value: 'BOOLEAN',
    },
    {
        label: 'FILE',
        value: 'FILE',
    },
    {
        label: 'DATE',
        value: 'DATE',
    },
]
