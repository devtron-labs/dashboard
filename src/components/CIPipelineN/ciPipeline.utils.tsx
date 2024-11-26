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
import { commonSelectStyles, OptionType, SourceTypeMap } from '@devtron-labs/devtron-fe-common-lib'
import { OptionProps, StylesConfig, components } from 'react-select'
import { PluginVersionSelectOptionType } from './types'

export const baseSelectStyles = {
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '32px',
        fontSize: '12px',
        borderLeft: '0',
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    placeholder: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    option: (base, state) => ({
        ...base,
        fontWeight: '500',
        color: 'var(--N900)',
        fontSize: '12px',
        padding: '5px 10px',
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: state.isDisabled ? 'var(--N100) !important' : 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        fontSize: '12px',
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        pointerEvents: 'all',
        width: '100px',
        whiteSpace: 'nowrap',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: state.isDisabled ? 'var(--N100) !important' : 'var(--N50) !important',
    }),
    menu: (base, state) => ({
        ...base,
        marginTop: '0',
    }),
}

export const pluginSelectStyle = {
    ...baseSelectStyles,
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: '4px',
        height: '28px',
        fontSize: '12px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '26px',
        fontSize: '12px',
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px',
        width: '100px',
        whiteSpace: 'nowrap',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px',
    }),
}

export const selectVariableStyle = {
    ...baseSelectStyles,
    control: (base, state) => ({
        ...base,
        border: 'none',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '32px',
        fontSize: '12px',
        maxWidth: '200px',
        width: 'max-content',
    }),
    valueContainer: (base, state) => ({
        ...base,
        display: 'flex',
        height: '32px',
        lineHeight: '26px',
        flexWrap: 'no-wrap',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
    }),
}

export const selectOperatorStyle = {
    ...selectVariableStyle,
    control: (base, state) => ({
        ...base,
        border: 'none',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '32px',
        fontSize: '12px',
        width: '50px',
    }),
    menu: (base, state) => ({
        ...base,
        width: '200px',
        marginTop: '0',
    }),
}

export const outputFormatSelectStyle = {
    ...baseSelectStyles,
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '3px',
        borderTopRightRadius: '4px',
        fontSize: '12px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        fontSize: '12px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
        borderTopRightRadius: '4px',
    }),
}

export const CiPipelineSourceTypeBaseOptions = [
    {
        label: 'Branch Fixed',
        value: SourceTypeMap.BranchFixed,
        isDisabled: false,
        isSelected: false,
        isWebhook: false,
    },
    {
        label: 'Branch Regex',
        value: SourceTypeMap.BranchRegex,
        isDisabled: false,
        isSelected: false,
        isWebhook: false,
    },
]

export const reactSelectStyles = {
    container: (base, state) => ({
        ...base,
        height: '40px',
    }),
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        height: '40px',
        backgroundColor: state.isDisabled ? 'var(--N50)' : 'var(--N000)',
        borderColor: state.isDisabled ? 'var(--N200)' : base.borderColor,
    }),
    menu: (base, state) => {
        return {
            ...base,
            top: `38px`,
        }
    },
    singleValue: (base, state) => {
        return {
            ...base,
            fontWeight: 500,
            color: 'var(--N900)',
        }
    },
    option: (base, state) => {
        return {
            ...base,
            color: state.isDisabled ? 'var(--N500)' : 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N50)' : 'var(--N000)',
        }
    },
}

export enum StageTypeEnums {
    PRE_CD = 'PRE_CD',
    POST_CD = 'POST_CD',
}

export const StageTypeMap = {
    PRE_CD: 'Pre-deployment stage',
    POST_CD: 'Post-deployment stage',
}

export const customTagStageTypeOptions = [
    {
        label: StageTypeMap[StageTypeEnums.PRE_CD],
        value: StageTypeEnums.PRE_CD,
    },
    {
        label: StageTypeMap[StageTypeEnums.POST_CD],
        value: StageTypeEnums.POST_CD,
    },
]

export const getCDStageTypeSelectorValue = (customTagStage: string): OptionType => {
    let stageTypeSelectorValue: OptionType
    if (customTagStage === StageTypeEnums.POST_CD) {
        stageTypeSelectorValue = { label: StageTypeMap.POST_CD, value: StageTypeEnums.POST_CD }
    } else {
        stageTypeSelectorValue = { label: StageTypeMap.PRE_CD, value: StageTypeEnums.PRE_CD }
    }
    return stageTypeSelectorValue
}
