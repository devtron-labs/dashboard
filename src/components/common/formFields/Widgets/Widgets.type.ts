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

import { GroupBase, StylesConfig } from 'react-select'
import { CheckboxProps } from '@devtron-labs/devtron-fe-common-lib'
import { OptionType } from '../../../app/types'

interface WidgetPropsType {
    title: string
    description?: string
    type?: string
    rootClassName?: string
    onChange?: (e) => void
    onBlur?: (e) => void
    minLength?: number
    maxLength?: number
    isRequired?: boolean
    placeholder?: string
    errorMessage?: string
}

export interface StyledFieldPropsType {
    title: string
    description?: string
    rootClassName?: string
    isRequired?: boolean
    errorMessage?: string
    showBox?: boolean
    children: React.ReactNode
}

export interface StyledInputPropsType extends WidgetPropsType {
    value: any
    pattern?: string
}

export interface SliderPropsType extends WidgetPropsType {
    sliderMin: number
    sliderMax: number
    sliderUnit: string
    value?: string
    onInputValue?: (value: number) => void
    hideValueInput?: boolean
}

export interface CheckboxWithTippyProps extends CheckboxProps {
    title: string
    description: string
}

export interface StyledSelectPropsType extends WidgetPropsType {
    value: OptionType
    options: OptionType[]
    classNamePrefix?: string
    styleOverrides?: StylesConfig<any, false, GroupBase<any>>
}

export interface StyledProgressBarProps {
    resetProgress?: boolean
    updateProgressValue?: (currentValue: number) => void
    styles?: React.CSSProperties
    classes?: string
    progress?: number
}

export interface ShortcutKeyBadgeProps {
    rootClassName?: string
    shortcutKey: string
    onClick?: (e?: any) => void
}
