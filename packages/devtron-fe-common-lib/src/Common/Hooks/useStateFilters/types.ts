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

import { UseUrlFiltersProps, UseUrlFiltersReturnType } from '../useUrlFilters'

export interface UseStateFiltersProps<T> extends Pick<UseUrlFiltersProps<T, never>, 'initialSortKey'> {}

export interface UseStateFiltersReturnType<T>
    extends Pick<
        UseUrlFiltersReturnType<T>,
        | 'sortBy'
        | 'sortOrder'
        | 'handleSorting'
        | 'clearFilters'
        | 'changePage'
        | 'changePageSize'
        | 'offset'
        | 'pageSize'
        | 'searchKey'
        | 'handleSearch'
    > {}

export interface PaginationType<T> extends Pick<UseUrlFiltersReturnType<T>, 'pageSize'> {
    pageNumber: number
}
