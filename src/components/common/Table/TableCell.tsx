import React, { PropsWithChildren } from "react";
import { TableCellProps } from "./types";

export const TableCell = (props: PropsWithChildren<TableCellProps>) => {
  const { children } = props;

  return (
    <td
      className="dc-table__cell dc__ellipsis-right"
    >
      {children}
    </td>
  );
};
