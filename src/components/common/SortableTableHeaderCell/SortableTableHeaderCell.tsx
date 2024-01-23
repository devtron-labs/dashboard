import React from 'react'
import { SortingOrder } from '../../../config'
import { ReactComponent as SortIcon } from '../../../assets/icons/ic-arrow-up-down.svg'
import { ReactComponent as SortArrowDown } from '../../../assets/icons/ic-sort-arrow-down.svg'

// TODO: move this to common library
const SortableTableHeaderCell = ({
    isSorted,
    triggerSorting,
    sortOrder,
    title,
    disabled,
}: {
    isSorted: boolean
    triggerSorting: () => void
    sortOrder: SortingOrder
    title: string
    disabled: boolean
}) => (
    <button
        type="button"
        className="dc__transparent p-0 bcn-0 cn-7 flex dc__content-start dc__gap-4 cursor"
        onClick={triggerSorting}
        disabled={disabled}
    >
        <span className="dc__uppercase dc__ellipsis-right">{title}</span>
        {isSorted ? (
            <SortArrowDown
                className={`icon-dim-12 mw-12 scn-7 ${sortOrder === SortingOrder.DESC ? 'dc__flip-180' : ''}`}
            />
        ) : (
            <SortIcon className="icon-dim-12 mw-12 scn-7" />
        )}
    </button>
)

export default SortableTableHeaderCell
