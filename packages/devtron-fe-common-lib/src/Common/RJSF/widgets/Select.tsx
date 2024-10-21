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

import React from 'react'
import { WidgetProps } from '@rjsf/utils'
import ReactSelect, { MenuListProps, components } from 'react-select'
import { PLACEHOLDERS } from '../constants'
import { getCommonSelectStyle } from '../utils'

import { ReactComponent as ArrowDown } from '../../../Assets/Icon/ic-chevron-down.svg'
import { deepEqual } from '@Common/Helper'

const commonStyles = getCommonSelectStyle()

const MenuList = ({ children, ...props }: MenuListProps) => (
    <components.MenuList {...props}>{Array.isArray(children) ? children.slice(0, 20) : children}</components.MenuList>
)

const DropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" data-testid="overview-project-edit-dropdown" />
    </components.DropdownIndicator>
)

export const SelectWidget = (props: WidgetProps) => {
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
            ? selectOptions.filter((option) => value.some((val) => deepEqual(val, option.value)))
            : selectOptions.find((option) => deepEqual(value, option.value))

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
                MenuList,
            }}
            menuPlacement="auto"
        />
    )
}
