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

export const CommonGroupedDropdownStyles = {
    container: (base, state) => ({
        ...base,
        ...(state.isDisabled && {
            cursor: 'not-allowed',
            pointerEvents: 'auto',
        }),
        minHeight: '36px',
        width: '100%',
    }),
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        minHeight: '36px',
        backgroundColor: 'var(--N50)',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        opacity: state.isDisabled ? 0.5 : 1,
    }),
    singleValue: (base) => ({
        ...base,
        fontWeight: 400,
        color: 'var(--N900)',
        fontSize: '13px',
    }),
    option: (base, state) => ({
        ...base,
        padding: '6px 8px 6px 0',
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        color: 'var(--N900)',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '13px',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '4px 0px 4px 8px',
        display: 'flex',
        minHeight: '36px',
        gap: '6px',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        ...(state.isDisabled ? { opacity: state.isDisabled ? 0.7 : 1 } : {}),
    }),
    group: (base) => ({
        ...base,
        paddingTop: '4px',
        paddingBottom: 0,
    }),
    groupHeading: (base) => ({
        ...base,
        fontWeight: 600,
        fontSize: '12px',
        color: 'var(--N900)',
        backgroundColor: 'var(--N100)',
        marginBottom: 0,
        padding: '4px 8px',
        textTransform: 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    menuList: (base) => ({
        ...base,
        padding: 0,
        marginBottom: '4px',
    }),
    multiValue: (base) => ({
        ...base,
        border: `1px solid var(--N200)`,
        borderRadius: `4px`,
        background: 'white',
        height: '28px',
        margin: '0px',
        padding: '2px',
        fontSize: '13px',
    }),
    multiValueLabel: (base) => ({
        ...base,
        padding: '0px',
        fontSize: '13px',
    }),
    placeholder: (base) => ({
        ...base,
        position: 'absolute',
    }),
}
