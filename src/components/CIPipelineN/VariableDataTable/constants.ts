import {
    DynamicDataTableHeaderType,
    SelectPickerOptionType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

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

export const VAL_COLUMN_CHOICES_DROPDOWN_LABEL = 'Default values'

export const FORMAT_OPTIONS_MAP = {
    [VariableTypeFormat.STRING]: 'String',
    [VariableTypeFormat.NUMBER]: 'Number',
    [VariableTypeFormat.BOOL]: 'Boolean',
    [VariableTypeFormat.DATE]: 'Date',
    [VariableTypeFormat.FILE]: 'File',
}

export const FORMAT_COLUMN_OPTIONS: SelectPickerOptionType<string>[] = [
    {
        label: 'String',
        value: VariableTypeFormat.STRING,
    },
    {
        label: 'Number',
        value: VariableTypeFormat.NUMBER,
    },
    {
        label: 'Boolean',
        value: VariableTypeFormat.BOOL,
    },
    {
        label: 'Date',
        value: VariableTypeFormat.DATE,
    },
    {
        label: 'File',
        value: VariableTypeFormat.FILE,
    },
]

export const VAL_COLUMN_BOOL_OPTIONS: SelectPickerOptionType<string>[] = [
    { label: 'TRUE', value: 'TRUE' },
    { label: 'FALSE', value: 'FALSE' },
]

export const VAL_COLUMN_DATE_OPTIONS: SelectPickerOptionType<string>[] = [
    {
        label: 'YYYY-MM-DD',
        value: 'YYYY-MM-DD',
        description: 'RFC 3339',
    },
    {
        label: 'YYYY-MM-DD HH:mm',
        value: 'YYYY-MM-DD HH:mm',
        description: 'RFC 3339 with minutes',
    },
    {
        label: 'YYYY-MM-DD HH:mm:ss',
        value: 'YYYY-MM-DD HH:mm:ss',
        description: 'RFC 3339 with seconds',
    },
    {
        label: 'YYYY-MM-DD HH:mm:ssZ',
        value: 'YYYY-MM-DD HH:mm:ssZ',
        description: 'RFC 3339 with seconds and timezone',
    },
    {
        label: 'YYYY-MM-DDTHH[Z]',
        value: 'YYYY-MM-DDTHH[Z]',
        description: 'ISO8601 with hour',
    },
    {
        label: 'YYYY-MM-DDTHH:mm[Z]',
        value: 'YYYY-MM-DDTHH:mm[Z]',
        description: 'ISO8601 with minutes',
    },
    {
        label: 'YYYY-MM-DDTHH:mm:ss[Z]',
        value: 'YYYY-MM-DDTHH:mm:ss[Z]',
        description: 'ISO8601 with seconds',
    },
    {
        label: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        value: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        description: 'ISO8601 with nanoseconds',
    },
]

export const FILE_UPLOAD_SIZE_UNIT_OPTIONS: SelectPickerOptionType<number>[] = [
    {
        label: 'KB',
        value: 1024,
    },
    {
        label: 'MB',
        value: 1 / 1024,
    },
]

export const DECIMAL_WITH_SCOPE_VARIABLES_REGEX = /^(\d+(\.\d+)?|@{{[a-zA-Z0-9-]+}})$/
