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

import { Tooltip } from '@Common/Tooltip'
import { ReactComponent as SortIcon } from '../../Assets/Icon/ic-arrow-up-down.svg'
import { ReactComponent as SortArrowDown } from '../../Assets/Icon/ic-sort-arrow-down.svg'
import { SortingOrder } from '../Constants'
import { noop } from '../Helper'
import { SortableTableHeaderCellProps } from './types'

/**
 * Reusable component for the table header cell with support for sorting icons
 *
 * @example Usage
 * ```tsx
 * <SortableTableHeaderCell
 *   isSorted={currentSortedCell === 'cell'}
 *   triggerSorting={() => {}}
 *   sortOrder={SortingOrder.ASC}
 *   title="Header Cell"
 *   disabled={isDisabled}
 * />
 * ```
 */
const SortableTableHeaderCell = ({
    isSorted,
    triggerSorting,
    sortOrder,
    title,
    disabled,
    isSortable = true,
    showTippyOnTruncate = false,
}: SortableTableHeaderCellProps) => {
    const renderSortIcon = () => {
        if (!isSortable) {
            return null
        }

        if (isSorted) {
            return (
                <SortArrowDown
                    className={`icon-dim-12 mw-12 scn-7 dc__no-shrink dc__transition--transform ${sortOrder === SortingOrder.DESC ? 'dc__flip-180' : ''}`}
                />
            )
        }

        return <SortIcon className="icon-dim-12 mw-12 scn-7 dc__no-shrink" />
    }

    return (
        <button
            type="button"
            className={`dc__transparent p-0 cn-7 flex dc__content-start dc__gap-4 dc__select-text ${!isSortable ? 'cursor-default' : ''}`}
            onClick={isSortable ? triggerSorting : noop}
            disabled={disabled}
        >
            <Tooltip showOnTruncate={showTippyOnTruncate} content={title}>
                <span className="dc__uppercase dc__ellipsis-right">{title}</span>
            </Tooltip>
            {renderSortIcon()}
        </button>
    )
}

export default SortableTableHeaderCell
