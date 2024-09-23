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
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as CheckSelected } from '../../assets/icons/ic-checkbox-selected.svg'
import { ReactComponent as CheckNotSelected } from '../../assets/icons/ic-checkbox-unselected.svg'
import { VulnerabilityAction } from './security.types'

export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        height: '30px',
    }),
    menu: (base, state) => {
        return {
            ...base,
        }
    },
    valueContainer: (base, state) => {
        return {
            ...base,
            fontSize: '14px',
            fontWeight: 'normal',
            color: 'var(--N900)',
            cursor: 'pointer',
        }
    },
    indicatorSeparator: (base, state) => ({
        ...base,
        display: 'none',
    }),
    option: (base, state) => {
        return {
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }
    },
}

export const portalStyles = {
    control: (base, state) => ({
        ...base,
        border: 'none',
    }),
    valueContainer: (base, state) => {
        return {
            ...base,
            padding: '0px',
            textTransform: 'none',
            cursor: 'pointer',
        }
    },
    menu: (base, state) => {
        return {
            ...base,
            top: `0px`,
        }
    },
}

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 icon-n5" />
        </components.DropdownIndicator>
    )
}

export const ValueContainer = (props) => {
    if (!props.hasValue) {
        return <components.ValueContainer {...props} />
    }

    return (
        <components.ValueContainer {...props}>
            <p style={{ margin: '0px' }}>
                {props?.selectProps?.name}
                <span className="badge">{props.getValue()?.length}</span>
            </p>
        </components.ValueContainer>
    )
}

export const Option = (props) => {
    return (
        <components.Option {...props}>
            <p className="m-0 dc__ellipsis-right dc__lowercase">
                {props.isSelected ? (
                    <CheckSelected className="icon-dim-24 dc__vertical-align-middle mr-5" />
                ) : (
                    <CheckNotSelected className="icon-dim-24 dc__vertical-align-middle mr-5" />
                )}
                {props.label}
            </p>
        </components.Option>
    )
}

export const MultiValue = (props) => {
    return <components.MultiValue {...props} />
}

export const MultiValueContainer = (props) => {
    return <components.MultiValueContainer {...props} />
}

export const SEVERITY_POLICY_OPTIONS = [
    { label: 'BLOCK', value: VulnerabilityAction.block },
    { label: 'ALLOW', value: VulnerabilityAction.allow },
    { label: 'INHERIT', value: VulnerabilityAction.inherit },
]