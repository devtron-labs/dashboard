import { GroupBase, StylesConfig } from "react-select"
import { OptionType } from "../../../app/types"
import { CheckboxProps } from "../Checkbox"

interface WidgetPropsType {
    title: string
    description?: string
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
    value: string
    pattern?: string
}

export interface SliderPropsType extends WidgetPropsType {
    unit: string
    defaultValue?: number
    onInput?: (e) => void
    hideValueInput?: boolean
}

export interface CheckboxWithTippyProps extends CheckboxProps {
    label: string
    showTippy: boolean
    description: string
}

export interface StyledSelectPropsType extends WidgetPropsType {
    value: OptionType
    options: OptionType[]
    classNamePrefix?: string
    styleOverrides?: StylesConfig<any, false, GroupBase<any>>
}
