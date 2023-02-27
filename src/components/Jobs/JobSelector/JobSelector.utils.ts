import React from 'react'
import { ServerErrors } from '../../../modals/commonTypes'
import { showError } from '../../common'
import { getJobs } from '../Service'

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

let timeoutId
export const jobListOptions = (inputValue: string): Promise<[]> =>
    new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([])
                return
            }

            const payload = {
                teams: [],
                appStatuses: [],
                sortBy: 'appNameSort',
                sortOrder: 'ASC',
                offset: 0,
                size: 100,
            }

            getJobs(payload, {})
                .then((response) => {
                    let jobsList = []
                    if (response.result?.jobContainers) {
                        jobsList = response.result.jobContainers.map((res) => ({
                            value: res['jobId'],
                            label: res['jobName'],
                            ...res,
                        }))
                    }
                    resolve(jobsList as [])
                })
                .catch((errors: ServerErrors) => {
                    resolve([])
                    if (errors.code) {
                        showError(errors)
                    }
                })
        }, 300)
    })
