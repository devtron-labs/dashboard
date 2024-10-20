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

export interface PageSizeOption {
    value: number
    selected: boolean
}
export interface PaginationProps {
    /**
     * number of items
     */
    size: number
    /**
     * pageSize
     */
    pageSize: number
    offset: number
    changePage: (pageNo: number) => void
    changePageSize?: (pageSize: number) => void
    /**
     * If true will not show page size selector
     */
    isPageSizeFix?: boolean
    /**
     * If given would show these options in page size selector else [20,40,50] with 20 as selected
     */
    pageSizeOptions?: PageSizeOption[]
    /**
     * class for wrapper
     */
    rootClassName?: string
}

export interface Page {
    value: number
    selected: boolean
    isVisible: boolean
}

export interface CreatePageArrType extends Pick<PaginationProps, 'size' | 'pageSize'> {
    selectedPageNo: number
}

export interface PageSizeSelectorProps
    extends Pick<PaginationProps, 'pageSizeOptions' | 'pageSize' | 'changePageSize'> {}

export interface PageSizeItemsProps extends Pick<PageSizeSelectorProps, 'changePageSize'> {
    optionValue: PageSizeOption['value']
    options: PageSizeOption[]
    setOptions: React.Dispatch<React.SetStateAction<PageSizeOption[]>>
    handleCloseDropdown: () => void
}

export interface PageValueItemProps {
    value: PageSizeOption['value']
    isSelected: PageSizeOption['selected']
    selectPage: (selectedPageNo: number) => void
}
