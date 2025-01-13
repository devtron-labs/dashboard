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
import { TAB_DATA_VERSION } from './constants'

export interface DynamicTabsProps {
    tabs: DynamicTabType[]
    removeTabByIdentifier: ReturnType<typeof useTabs>['removeTabByIdentifier']
    markTabActiveById: ReturnType<typeof useTabs>['markTabActiveById']
    stopTabByIdentifier: ReturnType<typeof useTabs>['stopTabByIdentifier']
    setIsDataStale: React.Dispatch<React.SetStateAction<boolean>>
    refreshData: () => void
    hideTimer: boolean
}

export interface MoreButtonWrapperProps {
    children?: ReactNode
    readonly isMenuOpen: boolean
    readonly onClose: () => void
    readonly toggleMenu: () => void
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
    version: typeof TAB_DATA_VERSION
}

export interface PopulateTabDataPropsType
    extends Pick<
            DynamicTabType,
            | 'tippyConfig'
            | 'lastActiveTabId'
            | 'type'
            | 'isSelected'
            | 'url'
            | 'name'
            | 'iconPath'
            | 'dynamicTitle'
            | 'isAlive'
            | 'hideName'
            | 'id'
        >,
        Required<Pick<DynamicTabType, 'shouldRemainMounted' | 'title' | 'showNameOnSelect'>> {}

export interface AddTabParamsType
    extends Pick<PopulateTabDataPropsType, 'name' | 'url' | 'tippyConfig'>,
        Partial<Pick<PopulateTabDataPropsType, 'type' | 'iconPath' | 'dynamicTitle' | 'showNameOnSelect'>>,
        Required<Pick<DynamicTabType, 'kind'>> {
    /**
     * Prefix for generating tab IDs
     */
    idPrefix: string
}

export interface UpdateTabUrlParamsType extends Pick<DynamicTabType, 'id' | 'url' | 'dynamicTitle'> {
    /**
     * @default false
     */
    retainSearchParams?: boolean
}
