import React from 'react'

import { TABLE_SIZE_MAP } from './ constants'
import { SortOrder, TableHeaderCellProps } from './types'
import Tippy from '@tippyjs/react'

import { ReactComponent as HelpOutlineIcon } from '../../../assets/img/ic-help-outline.svg'

const SortIcon = ({ order }: { order: SortOrder }) => (
    <span
        className={`${order ? 'sort' : 'sort-col dc__opacity-0_5'} ${order === 'DESC' ? 'sort-up' : ''} ml-4 w-100-imp`}
    />
)

// TODO: Add Typing support
const CellContentWithTooltip = (props) => {
    const { showIcon, content, placement = 'top', value, isSortable, sortOrder, children } = props

    const EndIcon = () => (isSortable ? <SortIcon order={sortOrder} /> : null)

    return showIcon ? (
        <div className="flexbox dc__align-items-center">
            {children}
            {/* TODO: Add Spacing */}
            <Tippy content={content} placement={placement} className="default-tt">
                <HelpOutlineIcon className="icon-dim-16 ml-4 w-100" />
            </Tippy>
            <EndIcon />
        </div>
    ) : (
        <Tippy content={content} placement={placement} className="default-tt">
            <div className="flexbox dc__align-items-center">
                {children}
                <EndIcon />
            </div>
        </Tippy>
    )
}

export const TableHeaderCell = (props: TableHeaderCellProps) => {
    const { value, size, tooltipConfig, onClick, isSortable, sortOrder } = props
    const CellContent = () => <div className="dc__ellipsis-right">{value}</div>

    return (
        <th
            className={`dc-table__header-cell ${!!onClick ? 'cursor' : ''}`}
            style={{
                minWidth: TABLE_SIZE_MAP.sm,
                // TODO: Update the size map for responsiveness
                ...(!!size && { width: TABLE_SIZE_MAP[size], maxWidth: TABLE_SIZE_MAP[size] }),
            }}
            onClick={onClick}
        >
            {!!tooltipConfig ? (
                <CellContentWithTooltip {...tooltipConfig} value={value} isSortable={isSortable} sortOrder={sortOrder}>
                    <CellContent />
                </CellContentWithTooltip>
            ) : (
                <CellContent />
            )}
        </th>
    )
}
