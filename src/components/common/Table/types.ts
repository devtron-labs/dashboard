import { TippyProps } from "@tippyjs/react";
import { ReactNode, SyntheticEvent } from "react";

// TODOs:
// tooltips for cell

type ID = string | number;

export type SortOrder = 'ASC' | 'DESC' | null;

export interface SortConfig {
    order: SortOrder;
    sortedHeaderCellId?: ID;
    sortFunction: (e: SyntheticEvent, {
        requestedSortOrder,
        clickedHeaderCellId
    }: {
        requestedSortOrder: SortOrder;
        clickedHeaderCellId: ID;
    }) => void;
}

export type TableSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';

export interface TableHeadProps { }

interface TooltipConfig {
    content: ReactNode;
    placement?: TippyProps['placement'];
    showIcon?: boolean;
}

export interface TableHeaderCellProps {
    id: ID;
    value: ReactNode;
    size?: TableSize;
    tooltipConfig?: TooltipConfig;
    onClick?: (event: SyntheticEvent) => void;
    isSortable?: boolean;
    sortOrder?: SortOrder;
}

export interface TableRowProps {
    id?: ID;
    onMouseEnter?: (event: SyntheticEvent) => void;
    onMouseLeave?: (event: SyntheticEvent) => void;
    onClick?: (event: SyntheticEvent) => void;
}

export interface TableCellProps {

}

export interface TableBodyConfig {
    id: ID;
    data: ReactNode[] | ((config: { rowId: ID; isHovered?: boolean; }) => ReactNode[]);
}

export interface TableProps {
    headers: (Omit<TableHeaderCellProps, 'onClick' | 'sortOrder'>)[];
    body: TableBodyConfig[];
    // onHeaderCellClick?: (event: SyntheticEvent, { cellId } : {cellId: ID}) => void;
    onRowClick?: (event: SyntheticEvent, { rowId }: { rowId: ID }) => void;
    sortConfig?: SortConfig;
}
