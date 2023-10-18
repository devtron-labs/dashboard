import React from 'react'

import Tippy from '@tippyjs/react'

import { TableBodyDataWithTooltipConfig, TableCellProps } from './types'

/**
 * For narrowing down the type
 */
function isDataWithTooltipConfig(data: TableCellProps['cellData']): data is TableBodyDataWithTooltipConfig {
    return (data as TableBodyDataWithTooltipConfig).value !== undefined
}

export const TableCell = (props: TableCellProps) => {
    const { cellData, colSpan } = props

    return (
        <td className="dc-table__cell dc__ellipsis-right" colSpan={colSpan}>
            {isDataWithTooltipConfig(cellData) ? (
                <Tippy
                    content={cellData.tooltipConfig.content}
                    placement={cellData.tooltipConfig.placement ?? 'top'}
                    className="default-tt"
                >
                    <div>{cellData.value}</div>
                </Tippy>
            ) : (
                cellData
            )}
        </td>
    )
}
