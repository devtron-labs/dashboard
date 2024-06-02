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
    size: number
    pageSize: number
    offset: number
    changePage: (pageNo: number) => void
    changePageSize?: (pageSize: number) => void
    isPageSizeFix?: boolean
    pageSizeOptions?: PageSizeOption[]
    rootClassName?: string
}

export interface PaginationState {
    show: boolean
    options: PageSizeOption[]
    pages: Page[]
}

export interface Page {
    value: number
    selected: boolean
    isVisible: boolean
}
