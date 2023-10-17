import React, { PropsWithChildren } from 'react'
import { TableHeadProps } from './types';

export const TableHead = (props: PropsWithChildren<TableHeadProps>) => {
    const { children } = props;

  return (
      <thead className="dc-table__head">{children}</thead>
  )
}
