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

import { ReactElement } from 'react'
import { Dayjs } from 'dayjs'

import { DynamicTabType, InitTabType } from '@devtron-labs/devtron-fe-common-lib'

import { TAB_DATA_VERSION } from './constants'

export enum DynamicTabsVariantType {
    ROUNDED = 'rounded',
    RECTANGULAR = 'rectangular',
}

interface TimerConfigType {
    reload?: () => void
    showTimeSinceLastSync?: boolean
    isLoading?: boolean
}

export interface UseTabsReturnType {
    tabs: DynamicTabType[]
    initTabs: (
        initTabsData: InitTabType[],
        reInit?: boolean,
        tabsToRemove?: string[],
        overrideSelectionStatus?: boolean,
    ) => void
    addTab: (props: AddTabParamsType) => Promise<boolean>
    removeTabByIdentifier: (id: DynamicTabType['id']) => Promise<string>
    stopTabByIdentifier: (id: DynamicTabType['id']) => Promise<string>
    markTabActiveById: (id: DynamicTabType['id'], url?: DynamicTabType['url']) => Promise<boolean>
    getTabId: (
        idPrefix: AddTabParamsType['idPrefix'],
        name: DynamicTabType['name'],
        kind: AddTabParamsType['kind'],
    ) => string
    getTabById: (id: DynamicTabType['id']) => DynamicTabType | null
    updateTabUrl: (props: UpdateTabUrlParamsType) => void
    updateTabComponentKey: (id: DynamicTabType['id']) => void
    updateTabLastSyncMoment: (id: DynamicTabType['id']) => void
}

export interface DynamicTabsProps {
    tabs: DynamicTabType[]
    variant: DynamicTabsVariantType
    removeTabByIdentifier: UseTabsReturnType['removeTabByIdentifier']
    markTabActiveById: UseTabsReturnType['markTabActiveById']
    stopTabByIdentifier: UseTabsReturnType['stopTabByIdentifier']
    backgroundColorToken: 'bg__primary' | 'bg__tertiary' | 'bg__secondary'
    timerConfig: Record<DynamicTabType['id'], TimerConfigType>
    setIsDataStale?: React.Dispatch<React.SetStateAction<boolean>>
    iconsConfig?: Record<DynamicTabType['id'], ReactElement>
}

export interface TimerType {
    start: Dayjs
    callback?: (now: Dayjs) => void
    transition?: () => JSX.Element
    transpose?: (output: string) => JSX.Element
    format?: (start: Dayjs, now: Dayjs) => string
}

export type ParsedTabsData = {
    data: Record<string, DynamicTabType[]>
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
            | 'dynamicTitle'
            | 'isAlive'
            | 'hideName'
            | 'id'
        >,
        Required<Pick<DynamicTabType, 'shouldRemainMounted' | 'title' | 'showNameOnSelect' | 'isAlpha'>> {}

export interface AddTabParamsType
    extends Pick<PopulateTabDataPropsType, 'name' | 'url' | 'tippyConfig'>,
        Partial<Pick<PopulateTabDataPropsType, 'type' | 'dynamicTitle' | 'showNameOnSelect'>>,
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

export interface DynamicTabsSelectProps {
    tabs: DynamicTabType[]
    getMarkTabActiveHandler: (tab: DynamicTabType) => () => void
    selectedTab: DynamicTabType
    handleTabCloseAction: React.MouseEventHandler<HTMLButtonElement>
}
