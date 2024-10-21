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

export const baseSelectStyles = {
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '32px',
        fontSize: '12px',
        borderRight: '0',
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    placeholder: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    option: (base, state) => ({
        ...base,
        fontWeight: '500',
        color: 'var(--N900)',
        fontSize: '12px',
        padding: '5px 10px',
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: state.isDisabled ? 'var(--N100) !important' : 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        fontSize: '12px',
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        pointerEvents: 'all',
        width: '100px',
        whiteSpace: 'nowrap',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: state.isDisabled ? 'var(--N100) !important' : 'var(--N50) !important',
    }),
    menu: (base, state) => ({
        ...base,
        marginTop: '0',
    }),
}

export const validateKubernetesKey = (key: string) => {
    const invalidMessageList = []
    if (!key || key.split('/')) {
        invalidMessageList.push('Name is required')
    } else {
        const re = new RegExp('/', 'g')
        const noOfSlashInKey = key.match(re).length
        if (noOfSlashInKey > 1) {
            invalidMessageList.push('Key: Max 1 ( / ) allowed')
        } else {
            const name = key
            if (noOfSlashInKey === 1) {
                const [prefix, name] = key.split('/')
            }
        }
    }
}

export const validateKubernetesValue = (value: string) => {}
