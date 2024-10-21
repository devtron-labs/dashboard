/*
 * Copyright (c) 2024. Devtron Inc.
 */

import React, { useState, useMemo } from 'react'
import { SortableTableHeaderCell } from '@Common/SortableTableHeaderCell'
import { SortingOrder } from '@Common/Constants'
import { ReactComponent as ICExpand } from '@Icons/ic-expand.svg'
import { SortOrderEnum, TablePropsType, TableSortStateType } from '../types'
import { compareStringAndObject } from '../utils'

const Table: React.FC<TablePropsType> = ({ headers, rows, defaultSortIndex, hasExpandableRows, headerTopPosition }) => {
    /* TODO: should the sort order by default be DESC or should it be DESC only for severity? (product-team) */
    const [sort, setSort] = useState<TableSortStateType>({
        index: defaultSortIndex || 0,
        order: headers[defaultSortIndex]?.defaultSortOrder || SortOrderEnum.ASC,
    })
    const [rowExpandedStateArray, setRowExpandedStateArray] = useState(Array(rows.length).fill(false))

    const sortedRows = useMemo(
        () =>
            rows.sort((a, b) => {
                const aCellContent = a.cells[sort.index].cellContent
                const bCellContent = b.cells[sort.index].cellContent
                const compareFunc = headers[sort.index].compareFunc || compareStringAndObject
                return sort.order * compareFunc(aCellContent, bCellContent)
            }),
        [rows, sort],
    )

    const handleSortOrderChange = () => setSort({ ...sort, order: -1 * sort.order })

    const handleSortIndexChange = (index: number) => () =>
        setSort({ index, order: headers[index]?.defaultSortOrder || SortOrderEnum.ASC })

    const handleToggleExpandAllRows = () =>
        setRowExpandedStateArray(Array(rows.length).fill(!rowExpandedStateArray.every((rowState) => rowState)))

    const getToggleRowExpandHandler = (rowIndex: number) => () => {
        rowExpandedStateArray[rowIndex] = !rowExpandedStateArray[rowIndex]
        setRowExpandedStateArray([...rowExpandedStateArray])
    }

    return (
        <div className="flexbox-col">
            <div
                className="flexbox dc__gap-8 dc__position-sticky dc__border-bottom-n1 pt-8 pb-8 bcn-0 dc__zi-10"
                style={{ top: `${headerTopPosition}px` }}
            >
                {hasExpandableRows && (
                    <button
                        className="flex dc__unset-button-styles"
                        type="button"
                        onClick={handleToggleExpandAllRows}
                        aria-label="Expand all rows"
                    >
                        <ICExpand
                            className="icon-dim-20 rotate"
                            style={{
                                ['--rotateBy' as any]: !rowExpandedStateArray.every((rowState) => rowState)
                                    ? '-90deg'
                                    : '0deg',
                            }}
                        />
                    </button>
                )}
                <div className="flexbox dc__content-space w-100">
                    {headers.map((header, index) => (
                        <div className="dc__uppercase fs-12 lh-20 fw-6" style={{ width: `${header.width}px` }}>
                            {header.isSortable ? (
                                <SortableTableHeaderCell
                                    isSorted={sort.index === index}
                                    triggerSorting={
                                        sort.index === index ? handleSortOrderChange : handleSortIndexChange(index)
                                    }
                                    sortOrder={sort.order === 1 ? SortingOrder.ASC : SortingOrder.DESC}
                                    title={header.headerText}
                                    disabled={false}
                                />
                            ) : (
                                <span>{header.headerText}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {sortedRows.map((row, rowIndex) => (
                <div
                    className={`flexbox-col dc__gap-16 dc__border-bottom-n1 ${hasExpandableRows ? 'pt-16 pb-16' : 'pt-10 pb-10'}`}
                >
                    <div className="flexbox dc__gap-8 dc__align-start">
                        {hasExpandableRows && (
                            <button
                                type="button"
                                className="dc__unset-button-styles"
                                onClick={getToggleRowExpandHandler(rowIndex)}
                                aria-label={`Expand row ${rowIndex}`}
                                data-testid={`security-table-expand-${rowIndex}`}
                            >
                                <ICExpand
                                    className="icon-dim-20 rotate"
                                    style={{
                                        ['--rotateBy' as any]: !rowExpandedStateArray[rowIndex] ? '-90deg' : '0deg',
                                    }}
                                />
                            </button>
                        )}
                        <div className="flexbox dc__content-space w-100">
                            {row.cells.map((cell, index) => (
                                <div
                                    className="flexbox dc__align-start dc__content-start fs-13 lh-20 fw-4 dc__word-break"
                                    style={{ width: `${headers[index].width}px` }}
                                    data-testid={`security-table-cell-${rowIndex}:${index}`}
                                >
                                    {cell.component || cell.cellContent}
                                </div>
                            ))}
                        </div>
                    </div>
                    {hasExpandableRows && rowExpandedStateArray[rowIndex] && row.expandableComponent}
                </div>
            ))}
        </div>
    )
}

export default Table
