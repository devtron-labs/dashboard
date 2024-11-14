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

import { ReactNode } from 'react'
import { Dayjs } from 'dayjs'
import { DynamicTabType } from '@devtron-labs/devtron-fe-common-lib'
import { useTabs } from './useTabs'

export interface DynamicTabsProps {
    tabs: DynamicTabType[]
    removeTabByIdentifier: ReturnType<typeof useTabs>['removeTabByIdentifier']
    markTabActiveById: ReturnType<typeof useTabs>['markTabActiveById']
    stopTabByIdentifier: ReturnType<typeof useTabs>['stopTabByIdentifier']
    setIsDataStale: React.Dispatch<React.SetStateAction<boolean>>
    refreshData: () => void
    hideTimer: boolean
}

export interface TabsDataType {
    fixedTabs: DynamicTabType[]
    dynamicTabs: DynamicTabType[]
}

export interface MoreButtonWrapperProps {
    children?: ReactNode
    readonly isMenuOpen: boolean
    readonly onClose: () => void
    readonly toggleMenu: () => void
    tabPopupMenuRef: React.MutableRefObject<HTMLButtonElement>
}

export interface TimerType {
    start: Dayjs
    callback?: (now: Dayjs) => void
    transition?: () => JSX.Element
    transpose?: (output: string) => JSX.Element
    format?: (start: Dayjs, now: Dayjs) => string
}

export type ParsedTabsData = {
    key: string
    data: DynamicTabType[]
}

export interface PopulateTabDataPropsType
    extends Pick<DynamicTabType, 'tippyConfig' | 'switchedFromTabId'>,
        Required<Pick<DynamicTabType, 'shouldRemainMounted'>> {
    id: string
    /**
     * Name for the tab.
     *
     * Note: Used for the title
     */
    name: string
    /**
     * URL for the tab
     */
    url: string
    isSelected: boolean
    title: string
    /**
     * Specify the tabs position. If position is POS_INFY it's a dynamic tab.
     *
     * @default Number.MAX_SAFE_INTEGER
     */
    position: number
    /**
     * Whether to show the tab name when selected
     *
     * @default false
     */
    showNameOnSelect: boolean
    /**
     * Path of the icon for the tab
     *
     * @default ''
     */
    iconPath?: string
    /**
     * Dynamic title for the tab
     *
     * @default ''
     */
    dynamicTitle?: string
    /**
     * Indicates if showNameOnSelect tabs have been selected once
     *
     * @default false
     */
    isAlive?: boolean
    /**
     * @description Would remove the title/name from tab heading, but that does not mean name is not required, since it is used in other calculations
     * @default false
     */
    hideName?: boolean
}

export interface AddTabParamsType
    extends Pick<PopulateTabDataPropsType, 'name' | 'url' | 'tippyConfig'>,
        Partial<Pick<PopulateTabDataPropsType, 'position' | 'iconPath' | 'dynamicTitle' | 'showNameOnSelect'>> {
    /**
     * Prefix for generating tab IDs
     */
    idPrefix: string
    /**
     * Kind of tab
     */
    kind: string
}

export interface UpdateTabUrlParamsType extends Pick<DynamicTabType, 'id' | 'url' | 'dynamicTitle'> {
    /**
     * @default false
     */
    retainSearchParams?: boolean
}
