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
import Tippy from '@tippyjs/react'
import { ReactComponent as ICErrorCross } from '@Icons/ic-error-cross.svg'
import { ReactComponent as ClearIcon } from '../Assets/Icon/ic-appstatus-cancelled.svg'
import { ReactComponent as Check } from '../Assets/Icon/ic-check.svg'
import { ReactComponent as RedWarning } from '../Assets/Icon/ic-error-medium.svg'
import { Checkbox } from './Checkbox'
import { CHECKBOX_VALUE } from './Types'
import { ConditionalWrap } from './Helper'

export const Option = (props) => {
    const { selectOption, data, isDisabled, showTippy, tippyPlacement } = props

    const handleChange = (e) => {
        selectOption(data)
    }

    const renderOption = () => (
        <div
            className={`flex left pl-12 cursor dc__gap-8 ${isDisabled ? 'dc__disabled' : ''}`}
            style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
        >
            <Checkbox
                isChecked={props.isSelected || false}
                onChange={handleChange}
                value={CHECKBOX_VALUE.CHECKED}
                rootClassName="mb-0 w-20"
                disabled={isDisabled || false}
            />
            <components.Option {...props} />
        </div>
    )

    const renderTippy = (children) => {
        const placement = tippyPlacement === 'left' || tippyPlacement === 'right' ? tippyPlacement : 'auto'
        return (
            <Tippy
                content={data.label}
                className="default-tt dc__mxw-200 dc__word-break"
                placement={placement}
                arrow={false}
            >
                {children}
            </Tippy>
        )
    }

    return (
        <ConditionalWrap condition={showTippy} wrap={renderTippy}>
            {renderOption()}
        </ConditionalWrap>
    )
}

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
 *  Multi value container
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
 *
 * Multi value container with count
 */
export const MultiValueContainerWithCount = (props: any) => {
    const { children, data, innerProps, selectProps } = props
    const selectedLen = selectProps.value?.length ?? 0

    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
            {(!selectProps.menuIsOpen || !selectProps.inputValue) && (
                <span className="cn-9 fs-13 lh-20">
                    {selectProps.placeholder}
                    {selectedLen > 0 && (
                        <span className="bcb-5 cn-0 fw-6 fs-12 br-8 ml-4 pr-8 pl-8">{selectedLen}</span>
                    )}
                </span>
            )}
            {children[1]}
        </components.MultiValueContainer>
    )
}

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

export const MultiValueRemove = (props) => {
    const {
        data,
        innerProps: { onClick, onMouseDown },
    } = props
    return (
        <components.MultiValueRemove {...props}>
            <ICErrorCross
                {...{ onClick, onMouseDown }}
                onClick={(e) => onClick(data)}
                className="icon-n5"
                style={{ height: '14px', width: '14px' }}
            />
        </components.MultiValueRemove>
    )
}

export const MultiValueChipContainer = ({ validator, isAllSelected = false, ...props }) => {
    const { children, data, innerProps, selectProps } = props
    const { label, value } = data
    const isValidEmail = validator ? validator(value) : true

    if (isAllSelected && value !== '*') return null

    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
            <div className="flex left fs-12 pl-4 pr-4 dc__ellipsis-right">
                {!isValidEmail && <RedWarning className="mr-4 icon-dim-16 dc__no-shrink" />}
                <div className={`dc__ellipsis-right ${isValidEmail ? 'cn-9' : 'cr-5'}`}>{label}</div>
            </div>
            {children[1]}
        </components.MultiValueContainer>
    )
}

export const multiSelectStyles = {
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
        boxShadow: 'none',
    }),
    menu: (base, state) => ({
        ...base,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        color: 'var(--N900)',
        padding: '8px 12px',
    }),
    container: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
    }),
}

export interface CustomSelect {
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

export const CustomSelect: React.FC<CustomSelect> = (props) => <Select {...props} />
