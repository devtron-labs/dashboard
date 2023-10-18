import React, { PropsWithChildren } from 'react'

import { SortOrder, TableHeaderCellProps } from './types'
import Tippy from '@tippyjs/react'

import { ReactComponent as HelpOutlineIcon } from '../../../assets/img/ic-help-outline.svg'

const SortIcon = ({ order }: { order: SortOrder }) => (
    <span className={`${order ? 'sort' : 'sort-col dc__opacity-0_5'} ${order === 'DESC' ? 'sort-up' : ''} mw-12`} />
)

const CellContentWithTooltip = (
    props: PropsWithChildren<
        Pick<TableHeaderCellProps, 'isSortable' | 'sortOrder'> & TableHeaderCellProps['tooltipConfig']
    >,
) => {
    const { showIcon, content, placement = 'top', isSortable, sortOrder, children } = props

    const EndIcon = () => (isSortable ? <SortIcon order={sortOrder} /> : null)

    return showIcon ? (
        <div className="flexbox dc__align-items-center dc__gap-4">
            {children}
            <Tippy content={content} placement={placement} className="default-tt">
                <HelpOutlineIcon className="icon-dim-16 mw-16" />
            </Tippy>
            <EndIcon />
        </div>
    ) : (
        <Tippy content={content} placement={placement} className="default-tt">
            <div className="flexbox dc__align-items-center dc__gap-4 mw-16">
                {children}
                <EndIcon />
            </div>
        </Tippy>
    )
}

export const TableHeaderCell = (props: TableHeaderCellProps) => {
    const { value, size, tooltipConfig, onClick, isSortable, sortOrder } = props
    const CellContent = () => <div className="dc__ellipsis-right">{value}</div>
    const cellSizeClass = size ? `dc-table__header-cell--${size}` : ''

    return (
        <th className={`dc-table__header-cell ${!!onClick ? 'cursor' : ''} ${cellSizeClass}`} onClick={onClick}>
            {!!tooltipConfig ? (
                <CellContentWithTooltip {...tooltipConfig} isSortable={isSortable} sortOrder={sortOrder}>
                    <CellContent />
                </CellContentWithTooltip>
            ) : (
                <CellContent />
            )}
        </th>
    )
}
