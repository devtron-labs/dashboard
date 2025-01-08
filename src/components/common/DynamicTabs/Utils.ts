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
import { OptionType, DynamicTabType } from '@devtron-labs/devtron-fe-common-lib'
import { TabsDataType } from './Types'
import { MARK_AS_STALE_DATA_CUT_OFF_MINS } from '../../ResourceBrowser/Constants'

export const COMMON_TABS_SELECT_STYLES = {
    control: (base) => ({
        ...base,
        borderRadius: '4px 4px 0 0',
        borderBottom: 'none',
        boxShadow: 'none',
        cursor: 'text',
        backgroundColor: 'var(--bg-secondary)',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '2px 32px',
    }),
    menu: (base) => ({
        ...base,
        marginTop: 0,
        borderRadius: '0 0 4px 4px',
        width: '298px',
        marginLeft: '1px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-menu)',
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
    }),
    singleValue: (base) => ({
        ...base,
        color: 'var(--N900)',
    }),
}

export const EMPTY_TABS_DATA = {
    fixedTabs: [],
    dynamicTabs: [],
}

export const initTabsData = (
    tabs: DynamicTabType[],
    setTabsData: React.Dispatch<React.SetStateAction<TabsDataType>>,
    setSelectedTab: React.Dispatch<React.SetStateAction<OptionType & DynamicTabType>>,
    updateMenuState: () => void,
): void => {
    const fixedTabs = []
    const dynamicTabs = []
    tabs.forEach((tab) => {
        const tabOption = {
            ...tab,
            label: tab.dynamicTitle || tab.title,
            value: tab.id,
        }
        if (tab.type === 'fixed') {
            fixedTabs.push(tabOption)
        } else {
            dynamicTabs.push(tabOption)
        }

        if (tabOption.isSelected) {
            setSelectedTab(tabOption)
        }
    })

    setTabsData({
        fixedTabs,
        dynamicTabs,
    })

    // Update menu state when dynamicTabs are not present
    if (dynamicTabs.length === 0) {
        updateMenuState()
    }
}

export const checkIfDataIsStale = (start: Dayjs, now: Dayjs): boolean =>
    now.diff(start, 'minutes') > MARK_AS_STALE_DATA_CUT_OFF_MINS
