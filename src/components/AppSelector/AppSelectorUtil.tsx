import React from 'react'
import { components } from 'react-select'
import { ReactComponent as DropDownIcon } from '../../assets/icons/ic-chevron-down.svg'
import { ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
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
    }),
    valueContainer: (base, state) => ({
        ...base,
        display: 'flex',
        flexDirection: 'row-reverse',
        flexBasis: '0px',
        justifyContent: 'flex-end',
        padding: state.selectProps.menuIsOpen ? '0 0 0 4px' : '0',
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
        height: '30px',
    }),
    singleValue: (base, state) => ({
        ...state,
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
    }),
    menu: (base, state) => ({
        ...base,
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
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'white',
        fontWeight: state.isSelected ? 600 : 'normal',
        marginRight: '8px',
    }),
    input: (base, state) => ({
        ...base,
        margin: '0',
        flex: 'unset',
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
                className={`rotate`}
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

export const appListOptions = (inputValue: string, isJobView?: boolean): Promise<[]> =>
    new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([])
                return
            }
            getAppListMin(null, null, inputValue, isJobView ?? false)
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
                    resolve([])
                    if (errors.code) {
                        showError(errors)
                    }
                })
        }, 300)
    })
