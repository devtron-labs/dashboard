import {
    DynamicDataTableHeaderType,
    SelectPickerOptionType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { PluginVariableType } from '@Components/ciPipeline/types'

import { VariableDataKeys } from './types'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

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

export const VAL_COLUMN_DROPDOWN_LABEL = {
    CHOICES: 'Default values',
    SYSTEM_VARIABLES: 'System variables',
    PRE_BUILD_STAGE: 'From Pre-build Stage',
    POST_BUILD_STAGE: 'From Post-build Stage',
    PREVIOUS_STEPS: 'From Previous Steps',
}

export const FORMAT_OPTIONS_MAP = {
    [VariableTypeFormat.STRING]: 'String',
    [VariableTypeFormat.NUMBER]: 'Number',
    [VariableTypeFormat.BOOL]: 'Boolean',
    [VariableTypeFormat.DATE]: 'Date',
    [VariableTypeFormat.FILE]: 'File',
}

export const FORMAT_COLUMN_OPTIONS: SelectPickerOptionType<string>[] = [
    {
        label: FORMAT_OPTIONS_MAP.STRING,
        value: VariableTypeFormat.STRING,
    },
    {
        label: FORMAT_OPTIONS_MAP.NUMBER,
        value: VariableTypeFormat.NUMBER,
    },
    {
        label: FORMAT_OPTIONS_MAP.BOOL,
        value: VariableTypeFormat.BOOL,
    },
    {
        label: FORMAT_OPTIONS_MAP.DATE,
        value: VariableTypeFormat.DATE,
    },
    ...(isFELibAvailable
        ? [
              {
                  label: FORMAT_OPTIONS_MAP.FILE,
                  value: VariableTypeFormat.FILE,
              },
          ]
        : []),
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

export const VARIABLE_DATA_TABLE_CELL_ERROR_MSGS = {
    EMPTY_ROW: 'Please complete or remove this variable',
    VARIABLE_NAME_REQUIRED: 'Variable name is required',
    INVALID_VARIABLE_NAME: 'Invalid name. Only alphanumeric chars and (_) is allowed',
    UNIQUE_VARIABLE_NAME: 'Variable name should be unique',
    VARIABLE_VALUE_REQUIRED: 'Variable value is required',
    VARIABLE_VALUE_NOT_A_NUMBER: 'Variable value is not a number',
}
