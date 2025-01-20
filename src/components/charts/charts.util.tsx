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
import React from 'react'
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg'

export const styles = {
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        boxShadow: 'none',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    placeholder: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    option: (base, state) => {
        return {
            ...base,
            fontWeight: '500',
            color: 'var(--N900)',
            fontSize: '12px',
            padding: '8px 24px',
        }
    },
}

export const menuList = {
    menuList: (base, state) => ({
        ...base,
        maxHeight: '180px',
    }),
}

export const smallMenuList = {
    menuList: (base, state) => ({
        ...base,
        maxHeight: '90px',
    }),
}

export const ValueContainer = (props) => {
    const { length } = props.getValue()
    let count = ''
    if (length === props.options.length) {
        count = 'All'
    } else {
        count = length
    }

    function filterName() {
        if (length == 1) {
            if (props.selectProps.name == 'environment') {
                return 'Environment'
            }
            if (props.selectProps.name == 'repository') {
                return 'Repository'
            }
        } else {
            if (props.selectProps.name == 'environment') {
                return 'Environments'
            }
            if (props.selectProps.name == 'repository') {
                return 'Repositories'
            }
        }
    }

    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && (
                        <>
                            {' '}
                            {filterName()}: <span className="badge">{count}</span>
                        </>
                    )}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 icon-n4" />
        </components.DropdownIndicator>
    )
}

export const QueryParams = {
    ChartRepoId: 'chartRepoId',
    IncludeDeprecated: 'includeDeprecated',
    AppStoreName: 'appStoreName',
    RegistryId: 'registryId',
    SearchKey: 'searchKey',
}

export const PaginationParams = {
    pageOffset: 0,
    pageSize: 20,
}

export const renderAdditionalErrorInfo = (
    handleNameChange: (index: number, suggestedName: string) => void,
    suggestedName: string,
    index: number,
): JSX.Element => {
    return (
        suggestedName && (
            <>
                . Suggested Name:
                <span className="anchor pointer" onClick={(e) => handleNameChange(index, suggestedName)}>
                    {suggestedName}
                </span>
            </>
        )
    )
}
