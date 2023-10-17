import React, { useState } from 'react'

import { TableHeaderCell } from './TableHeaderCell'
import { TableRow } from './TableRow'
import { TableCell } from './TableCell'
import { TableBody } from './TableBody'
import { TableHead } from './TableHead'
import { SortOrder, TableBodyConfig, TableProps } from './types'

import './table.scss'

const getRequestedSortOrder = ({ clickedHeaderCellId, sortedHeaderCellId, currentSortOrder }): SortOrder => {
    if (clickedHeaderCellId === sortedHeaderCellId) {
        if (currentSortOrder === 'ASC') {
            return 'DESC'
        } else if (currentSortOrder === 'DESC') {
            return 'ASC'
        } else {
            return null
        }
    } else {
        return 'ASC'
    }
}

export const Table = (props: TableProps) => {
    // TODO: Add support for action buttons
    const { headers, body, onRowClick, sortConfig } = props
    const [currentHoveredRow, setCurrentHoveredRow] = useState<TableBodyConfig['id']>()

    const handleHover = (e, { id: rowId, eventType }: { id: TableBodyConfig['id']; eventType: 'enter' | 'leave' }) => {
        setCurrentHoveredRow(eventType === 'enter' ? rowId : null)
    }

    return (
        <div className="dc__overflow-scroll max-w-100">
            <table className="dc-table">
                <TableHead>
                    <TableRow>
                        {headers.map((header) => (
                            <TableHeaderCell
                                key={`header-cell-${header.id}`}
                                {...header}
                                onClick={
                                    header.isSortable
                                        ? (e) =>
                                              sortConfig?.sortFunction?.(e, {
                                                  clickedHeaderCellId: header.id,
                                                  // order: sortConfig.order,
                                                  requestedSortOrder: getRequestedSortOrder({
                                                      clickedHeaderCellId: header.id,
                                                      sortedHeaderCellId: sortConfig.sortedHeaderCellId,
                                                      currentSortOrder: sortConfig.order,
                                                  }),
                                              })
                                        : undefined
                                }
                                sortOrder={sortConfig.sortedHeaderCellId === header.id ? sortConfig.order : undefined}
                            />
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {body.length
                        ? body.map((row) => {
                              const isRowDataArray = Array.isArray(row.data)
                              return (
                                  <TableRow
                                      key={`row-${row.id}`}
                                      onMouseEnter={
                                          isRowDataArray
                                              ? undefined
                                              : (e) => handleHover(e, { id: row.id, eventType: 'enter' })
                                      }
                                      onMouseLeave={
                                          isRowDataArray
                                              ? undefined
                                              : (e) => handleHover(e, { id: row.id, eventType: 'leave' })
                                      }
                                      onClick={(e) => onRowClick(e, { rowId: row.id })}
                                  >
                                      {(Array.isArray(row.data)
                                          ? row.data
                                          : row.data({ rowId: row.id, isHovered: currentHoveredRow === row.id })
                                      ).map((cell, index) => (
                                          <TableCell key={`row-${row.id}-cell-${index}`}>{cell}</TableCell>
                                      ))}
                                  </TableRow>
                              )
                          })
                        : // TODO: Update the Null State
                          'No Results Found!'}
                </TableBody>
            </table>
        </div>
    )
}
