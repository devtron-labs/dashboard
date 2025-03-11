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

import {
    DynamicDataTableHeaderType,
    FilePropertyTypeSizeUnit,
    InputOutputVariablesHeaderKeys,
    SelectPickerOptionType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { PluginVariableType } from '@Components/ciPipeline/types'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

export const getVariableDataTableHeaders = (
    type: PluginVariableType,
): DynamicDataTableHeaderType<InputOutputVariablesHeaderKeys>[] => [
    {
        label: 'VARIABLE',
        key: InputOutputVariablesHeaderKeys.VARIABLE,
        width: '200px',
    },
    {
        label: 'TYPE',
        key: InputOutputVariablesHeaderKeys.FORMAT,
        width: '100px',
    },
    {
        label: type === PluginVariableType.INPUT ? 'VALUE' : 'DESCRIPTION',
        key: InputOutputVariablesHeaderKeys.VALUE,
        width: '1fr',
    },
]

export const VAL_COLUMN_DROPDOWN_LABEL = {
    CHOICES: 'Choices',
    SUPPORTED_DATE_FORMATS: 'Supported date formats',
    SYSTEM_VARIABLES: 'System variables',
    PRE_BUILD_STAGE: 'From Pre-build Stage',
    POST_BUILD_STAGE: 'From Post-build Stage',
    PREVIOUS_STEPS: 'From Previous Steps',
}

export const FORMAT_OPTIONS_MAP: Record<VariableTypeFormat, string> = {
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

export const FILE_MOUNT_DIR = '/devtroncd'

export const FILE_UPLOAD_SIZE_UNIT_OPTIONS: SelectPickerOptionType<number>[] = [
    {
        label: FilePropertyTypeSizeUnit.KB,
        value: 1,
    },
    {
        label: FilePropertyTypeSizeUnit.MB,
        value: 1024,
    },
]

export const VARIABLE_DATA_TABLE_EMPTY_ROW_MESSAGE: Record<PluginVariableType, string> = {
    [PluginVariableType.INPUT]:
        'Input variables are available as environment variables and can be used in the script to inject values from previous tasks or other sources.',
    [PluginVariableType.OUTPUT]:
        'Output variables must be set in the environment variables and can be used as input variables in other scripts.',
}

export const VARIABLE_DATA_TABLE_CELL_ERROR_MSGS = {
    EMPTY_ROW: 'Please complete or remove this variable',
    VARIABLE_NAME_REQUIRED: 'Variable name is required',
    INVALID_VARIABLE_NAME: 'Invalid name. Only alphanumeric chars and (_) is allowed',
    UNIQUE_VARIABLE_NAME: 'Variable name should be unique',
    VARIABLE_VALUE_REQUIRED: 'Variable value is required',
    VARIABLE_VALUE_NOT_A_NUMBER: 'Variable value is not a number',
    VARIABLE_VALUE_NOT_A_BOOLEAN: 'Variable value is not a boolean',
}

export const VARIABLE_DATA_TABLE_CELL_BOOL_VALUES = ['True', 'False', 'true', 'false']
