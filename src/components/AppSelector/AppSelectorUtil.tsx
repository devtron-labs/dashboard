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
import { getIsRequestAborted, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as DropDownIcon } from '../../assets/icons/ic-chevron-down.svg'
import { getAppListMin } from '../../services/service'

let timeoutId

export const appSelectorStyle = {
    control: (base, state) => ({
        ...base,
        border: state.menuIsOpen ? '1px solid var(--B500)' : 'unset',
        boxShadow: 'none',
        color: 'var(--N900)',
        minHeight: '32px',
        minWidth: state.menuIsOpen ? '300px' : 'unset',
        justifyContent: state.menuIsOpen ? 'space-between' : 'flex-start',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-primary)',
    }),
    valueContainer: (base, state) => ({
        ...base,
        display: 'flex',
        flexDirection: 'row-reverse',
        flexBasis: '0px',
        justifyContent: 'flex-end',
        padding: state.selectProps.menuIsOpen ? '0 0 0 4px' : '0',
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : 'var(--N900)',
        height: '30px',
    }),
    singleValue: (base, state) => ({
        ...state,
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : 'var(--N900)',
    }),
    menu: (base, state) => ({
        ...base,
        backgroundColor: 'var(--bg-primary)',
        minWidth: '300px',
        fontSize: '14px',
        fontWeight: 'normal',
    }),
    menuList: (base, state) => ({
        ...base,
        padding: '8px',
    }),
    option: (base, state) => ({
        ...base,
        borderRadius: '4px',
        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'var(--bg-primary)',
        fontWeight: state.isSelected ? 600 : 'normal',
        marginRight: '8px',
    }),
    input: (base, state) => ({
        ...base,
        margin: '0',
        flex: 'unset',
        color: 'var(--N900)',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: '0 4px 0 4px',
    }),
}

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <DropDownIcon
                className="rotate"
                style={{
                    ['--rotateBy' as any]: props.selectProps.menuIsOpen ? '180deg' : '0deg',
                    height: '24px',
                    width: '24px',
                }}
            />
        </components.DropdownIndicator>
    )
}

export const noOptionsMessage = (inputObj: { inputValue: string }): string => {
    if (inputObj && (inputObj.inputValue === '' || inputObj.inputValue.length < 3)) {
        return 'Type 3 chars to see matching results'
    }
    return 'No matching results'
}

export const appListOptions = (inputValue: string, isJobView?: boolean, signal?: AbortSignal): Promise<[]> => {
    const options = signal ? { signal } : null

    return new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([])
                return
            }
            getAppListMin(null, options, inputValue, isJobView ?? false)
                .then((response) => {
                    let appList = []
                    if (response.result) {
                        appList = response.result.map((res) => ({
                            value: res['id'],
                            label: res['name'],
                            ...res,
                        }))
                    }
                    resolve(appList as [])
                })
                .catch((errors: ServerErrors) => {
                    if (!getIsRequestAborted(errors)) {
                        resolve([])
                        if (errors.code) {
                            showError(errors)
                        }
                    }
                })
        }, 300)
    })
}
