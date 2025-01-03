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
import { components } from 'react-select'
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'

export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        height: '40px',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
    }),
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
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--B100)' : 'var(--N0)',
        }
    },
}

export const Option = (props) => {
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

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 icon-n5" />
        </components.DropdownIndicator>
    )
}
