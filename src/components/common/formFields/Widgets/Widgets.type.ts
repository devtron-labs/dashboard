import { GroupBase, StylesConfig } from "react-select"
import { OptionType } from "../../../app/types"
import { CheckboxProps } from '@devtron-labs/devtron-fe-common-lib'

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
