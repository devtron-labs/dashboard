import React, { useState } from 'react'

import { TableHeaderCell } from './TableHeaderCell'
import { TableRow } from './TableRow'
import { TableCell } from './TableCell'
import { SortOrder, TableBodyConfig, TableProps } from './types'

import './table.scss'

/**
 * Returns the next sort order to be applied to the header cell
 */
const getRequestedSortOrder = ({ clickedHeaderCellId, sortedHeaderCellId, currentSortOrder }): SortOrder => {
    if (clickedHeaderCellId === sortedHeaderCellId) {
        if (!currentSortOrder) {
            return 'ASC'
        }
        return currentSortOrder === 'ASC' ? 'DESC' : null
    } else {
        return 'ASC'
    }
}

/**
 * TODO: Add documentation
 */
export const Table = (props: TableProps) => {
    const { actionButtons, headers, body, onRowClick, sortConfig } = props
    const [currentHoveredRow, setCurrentHoveredRow] = useState<TableBodyConfig['id']>()

    const handleHover = (e, { id: rowId, eventType }: { id: TableBodyConfig['id']; eventType: 'enter' | 'leave' }) => {
        setCurrentHoveredRow(eventType === 'enter' ? rowId : null)
    }

    return (
        <div className="dc__overflow-scroll max-w-100 max-h-100">
            <table className="dc-table">
                <thead className="dc-table__head">
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
                </thead>
                <tbody className="dc-table__body">
                    {body.length
                        ? body.map((row) => {
                              // Check for object based row configuration
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
                                      ).map((cellData, index) => (
                                          <TableCell key={`row-${row.id}-cell-${index}`} cellData={cellData} />
                                      ))}
                                      {/* TODO: This is broken on displaying action buttons */}
                                      {actionButtons?.length > 0 && (
                                          <div className="dc-table__action-buttons">
                                              {actionButtons.map((actionButton) =>
                                                  actionButton.getActionButton({ rowId: row.id }),
                                              )}
                                          </div>
                                      )}
                                  </TableRow>
                              )
                          })
                        : // TODO: Update the Null State
                          'No Results Found!'}
                </tbody>
            </table>
        </div>
    )
}
