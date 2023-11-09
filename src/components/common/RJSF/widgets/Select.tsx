import React from 'react'
import { WidgetProps } from '@rjsf/utils'
import ReactSelect from 'react-select'
import { PLACEHOLDERS } from '../constants'
import { DropdownIndicator, getCommonSelectStyle } from '../../../v2/common/ReactSelect.utils'

export const Select = (props: WidgetProps) => {
    const {
        id,
        multiple = false,
        options,
        value,
        disabled,
        readonly,
        autofocus = false,
        onChange,
        onBlur,
        onFocus,
        placeholder,
    } = props
    const { enumOptions: selectOptions = [] } = options
    const emptyValue = multiple ? [] : ''

    const handleChange = (option) => {
        onChange(multiple ? option.map((o) => o.value) : option.value)
    }

    const getOption = (value) =>
        multiple
            ? selectOptions.filter((option) => value.includes(option.value))
            : selectOptions.find((option) => option.value === value)

    const commonStyles = getCommonSelectStyle()

    return (
        <ReactSelect
            id={id}
            name={id}
            isMulti={multiple}
            value={typeof value === 'undefined' ? emptyValue : getOption(value)}
            autoFocus={autofocus}
            onChange={handleChange}
            options={selectOptions}
            onBlur={() => onBlur(id, value)}
            onFocus={() => onFocus(id, value)}
            placeholder={placeholder || PLACEHOLDERS.SELECT}
            isDisabled={disabled || readonly}
            styles={{
                ...commonStyles,
                control: (base) => ({
                    ...base,
                    ...commonStyles.control,
                    backgroundColor: 'var(--N50)',
                }),
            }}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
            }}
        />
    )
}
