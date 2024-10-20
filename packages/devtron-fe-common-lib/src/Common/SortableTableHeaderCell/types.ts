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

import { SortingOrder } from '../Constants'

export interface SortableTableHeaderCellProps {
    /**
     * If true, the cell is sorted
     */
    isSorted: boolean
    /**
     * Callback for handling the sorting of the cell
     */
    triggerSorting: () => void
    /**
     * Current sort order
     *
     * Note: On click, the sort order should be updated as required
     */
    sortOrder: SortingOrder
    /**
     * Label for the cell
     */
    title: string
    /**
     * If true, the cell is disabled
     */
    disabled: boolean
    /**
     * If false, the cell acts like normal table header cell
     * @default true
     */
    isSortable?: boolean
    /**
     * If true, the tippy is shown on Sortable header if text is truncated
     * @default false
     */
    showTippyOnTruncate?: boolean
}
