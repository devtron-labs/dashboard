import React from 'react'

export const TableBody = (props) => {
    const { children } = props;
  return (
      <tbody className="dc-table__body">{children}</tbody>
  )
}
