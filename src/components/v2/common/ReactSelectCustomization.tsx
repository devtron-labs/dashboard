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
import Select, { components } from 'react-select'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-appstatus-cancelled.svg'
import { ReactComponent as Check } from '../../../assets/icons/appstatus/ic-check.svg'
import { ReactComponent as RedWarning } from '../../../assets/icons/ic-error-medium.svg'

/**
 * @deprecated
 */
export const Option = (props) => {
    const { selectOption, data } = props
    return (
        <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            <input
                checked={props.isSelected}
                onChange={(e) => selectOption(data)}
                type="checkbox"
                style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
                className="mr-8"
            />
            <components.Option {...props} />
        </div>
    )
}

/**
 * @deprecated
 */
export const SingleSelectOption = (props) => {
    const { selectOption, data } = props
    const style = { height: '16px', width: '16px', flex: '0 0 16px' }
    const onClick = (e) => selectOption(data)
    return (
        <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            {props.isSelected ? (
                <Check onClick={onClick} className="mr-8 icon-dim-16" style={style} />
            ) : (
                <span onClick={onClick} className="mr-8" style={style} />
            )}
            <components.Option {...props} />
        </div>
    )
}

/**
 *
 * @deprecated Use `MultiValueContainer` from common library
 */
export const MultiValueContainer = (props) => {
    const { children, data, innerProps, selectProps } = props
    const { label, value } = data
    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
            <div className="flex fs-12 ml-4 cn-9">{label}</div>
            {children[1]}
        </components.MultiValueContainer>
    )
}

/**
 * @deprecated
 */
export const ClearIndicator = (props) => {
    const {
        children = <ClearIcon className="icon-dim-24" />,
        getStyles,
        innerProps: { ref, ...restInnerProps },
    } = props
    return (
        <div {...restInnerProps} ref={ref} style={getStyles('clearIndicator', props)}>
            <div className="flex pointer">{children}</div>
        </div>
    )
}

/**
 * @deprecated
 */
export const MultiValueRemove = (props) => {
    const {
        data,
        innerProps: { onClick, onMouseDown },
        selectProps,
    } = props
    return (
        <components.MultiValueRemove {...props}>
            <ClearIcon
                {...{ onClick, onMouseDown }}
                onClick={(e) => onClick(data)}
                style={{ height: '18px', width: '18px' }}
            />
        </components.MultiValueRemove>
    )
}

/**
 * @deprecated
 */
export const MultiValueChipContainer = ({ validator, ...props }) => {
    const { children, data, innerProps, selectProps } = props
    const { label, value } = data
    const isValidEmail = validator ? validator(value) : true
    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
            <div className="flex fs-12">
                {!isValidEmail && <RedWarning className="mr-4 icon-dim-16" />}
                <div className={`${isValidEmail ? 'cn-9' : 'cr-5'}`}>{label}</div>
            </div>
            {children[1]}
        </components.MultiValueContainer>
    )
}

/**
 * @deprecated
 */
export const multiSelectStyles = {
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        boxShadow: 'none',
        minheight: '24px !important',
        backgroundColor: 'var(--bg-secondary)',
    }),
    menu: (base, state) => ({
        ...base,
        top: `40px`,
        backgroundColor: 'var(--bg-menu-primary)',
        border: '1px solid var(--N200)',
    }),
    option: (base, state) => {
        return {
            ...base,
            backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--bg-primary)',
            color: 'var(--N900)',
            padding: '8px 12px',
        }
    },
    container: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
    }),
    singleValue: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        fontSize: '13px',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--N900)',
    }),
}

/**
 * @deprecated
 */
export const podsDropdownStyles = {
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        width: '120px',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-menu-primary)',
    }),
    control: (base) => ({
        ...base,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        minHeight: '24px !important',
        cursor: 'pointer',
    }),
    input: (base) => ({
        ...base,
        margin: '0',
        paddingTop: '0',
        color: 'var(--N900)',
    }),
    singleValue: (base) => ({
        ...base,
        fontWeight: 600,
        color: 'var(--N900)',
        marginLeft: '2px',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 8px',
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: '200px',
        borderRadius: '4px',
    }),
}

/**
 * @deprecated
 */
interface CustomSelect {
    sortSelected?: boolean

    options: any[]
    onChange: (...args) => void
    value?: any
    name?: string
    placeholder?: string
    className?: string
    classNamePrefix?: string
    menuPortalTarget?: any
    components?: object
    styles?: object
    isMulti?: boolean
    isDisabled?: boolean
    closeMenuOnSelect?: boolean
    hideSelectedOptions?: boolean
    formatOptionLabel?: (...args) => any
}

/**
 * @deprecated
 */
export const CustomSelect: React.FC<CustomSelect> = (props) => {
    return <Select {...props} />
}
