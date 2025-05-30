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

import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import {
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ArrowDown } from '../assets/icons/ic-chevron-down.svg'
import { CLUSTER_TERMINAL_MESSAGING } from '../../ClusterNodes/constants'

/**
 * @deprecated
 */
export const getCustomOptionSelectionStyle = (styleOverrides = {}) => {
    return (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? 'var(--B100)'
            : state.isFocused
              ? 'var(--bg-secondary)'
              : 'var(--bg-primary)',
        opacity: state.isDisabled ? 0.5 : 1,
        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
        textOverflow: 'ellipsis',
        fontWeight: '500',
        overflow: 'hidden',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        fontSize: '13px',
        ...styleOverrides,
    })
}

/**
 * @deprecated - use from fe-common
 */

export const getCommonSelectStyle = (styleOverrides = {}) => {
    return {
        menuList: (base) => ({
            ...base,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        control: (base, state) => ({
            ...base,
            minHeight: '32px',
            boxShadow: 'none',
            backgroundColor: 'var(--bg-secondary)',
            border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
            cursor: 'pointer',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--bg-primary)',
            padding: '10px 12px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N400)',
            padding: '0 8px',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 8px',
            fontWeight: '400',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'var(--N900)',
        }),
        input: (base) => ({
            ...base,
            color: 'var(--N900)',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--bg-menu-primary)',
        }),
        ...styleOverrides,
    }
}

/**
 * @deprecated - use SelectOption from fe-common
 */
export const Option = (props) => {
    const { selectProps, data, showTippy, style, placement, tippyContent, tippyClass } = props
    selectProps.styles.option = getCustomOptionSelectionStyle(style)
    const getOption = () => {
        return (
            <div onClick={stopPropagation}>
                <components.Option {...props} />
            </div>
        )
    }

    return showTippy ? (
        <Tippy
            className={tippyClass || 'default-white'}
            arrow={false}
            placement={placement || 'right'}
            content={tippyContent || data.label}
        >
            {getOption()}
        </Tippy>
    ) : (
        getOption()
    )
}

/**
 * @deprecated - use from fe-common
 */

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            {/* FIXME: Why are we hard coding test id here? */}
            <ArrowDown className="icon-dim-20 icon-n5" data-testid="overview-project-edit-dropdown" />
        </components.DropdownIndicator>
    )
}

export const formatOptionLabel = (option): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">{option.label}</span>
            {option.infoText && <small className="cn-6">{option.infoText}</small>}
        </div>
    )
}

export const menuComponentForImage = (props) => {
    return (
        <components.MenuList {...props}>
            <div className="fw-4 lh-20 pl-8 pr-8 pt-6 pb-6 cn-7 fs-13 dc__italic-font-style">
                {CLUSTER_TERMINAL_MESSAGING.CUSTOM_PATH}
            </div>
            {props.children}
        </components.MenuList>
    )
}
