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

export interface FilterOption {
    key: number | string
    label: string
    isSaved: boolean
    isChecked: boolean
}

export interface FilterProps {
    list: FilterOption[]
    labelKey: string
    placeholder: string
    buttonText: string
    type: string
    searchable?: boolean
    multi?: boolean
    applyFilter: (type: string, list: FilterOption[]) => void
    badgeCount?: number
    isDisabled?: boolean
    disableTooltipMessage?: string
    isLabelHtml?: boolean
    onShowHideFilterContent?: (show: boolean) => void
    showPulsatingDot?: boolean
    searchKey?: string
    loading?: boolean
    errored?: boolean
    errorMessage?: string
    errorCallbackFunction?: () => void
    rootClassName?: string
    position?: 'left' | 'right'
    isFirstLetterCapitalize?: boolean
    dataTestId?: string
    appType?: string
}

export interface FilterState {
    list: FilterOption[]
    filteredList: FilterOption[]
    searchStr: string
    show: boolean
}
