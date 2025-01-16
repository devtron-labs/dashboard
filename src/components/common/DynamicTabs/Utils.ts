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

import { Dayjs } from 'dayjs'
import { DynamicTabType } from '@devtron-labs/devtron-fe-common-lib'
import { MARK_AS_STALE_DATA_CUT_OFF_MINS } from '../../ResourceBrowser/Constants'
import { DynamicTabsVariantType } from './types'

export const COMMON_TABS_SELECT_STYLES = {
    control: (base) => ({
        ...base,
        borderRadius: '4px 4px 0 0',
        borderBottom: 'none',
        boxShadow: 'none',
        cursor: 'text',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--N200)',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '2px 32px',
    }),
    menu: (base) => ({
        ...base,
        marginTop: 0,
        borderRadius: '0 0 4px 4px',
        width: '300px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-menu)',
        boxShadow: 'none',
        border: '1px solid var(--N200)',
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: 'calc(100vh - 200px)',
        paddingTop: 0,
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
    input: (base) => ({
        ...base,
        color: 'var(--N900)',
        marginLeft: '5px',
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--N900)',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--bg-primary)',
        color: 'var(--N900)',
        padding: '8px 12px',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
    }),
}

export const checkIfDataIsStale = (start: Dayjs, now: Dayjs): boolean =>
    now.diff(start, 'minutes') > MARK_AS_STALE_DATA_CUT_OFF_MINS

export const getOptionLabel = (tab: DynamicTabType) => tab.dynamicTitle || tab.title

export const getClassNameForVariant = (variant: DynamicTabsVariantType) => {
    const prefix = 'variant__'

    switch (variant) {
        case DynamicTabsVariantType.ROUNDED:
            return `${prefix}rounded bg__primary`
        case DynamicTabsVariantType.RECTANGULAR:
            return `${prefix}rectangular bg__tertiary`
        default:
            return ''
    }
}
