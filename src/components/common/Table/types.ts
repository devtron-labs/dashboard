import { ReactNode, SyntheticEvent } from "react";
import { TippyProps } from "@tippyjs/react";
import { GenericEmptyStateType } from "@devtron-labs/devtron-fe-common-lib";

// TODOs:
// - Add fix for action buttons
//  - We can add inside the last td element and adjust the padding of the last td element
// - Complete sticky header?

/**
 * Type for the ID
 *
 * Note: These should be unique across.
 */
type ID = string | number;

/**
 * Available sort orders:
 * - ASC: Ascending
 * - DESC: Descending
 * - null: No sorting
 *
 * TODO: Reuse from existing sort order
 */
export type SortOrder = 'ASC' | 'DESC' | null;

interface SortFunctionParams {
    /**
     * Sort order to be next applied to the column
     */
    requestedSortOrder: SortOrder;
    /**
     * ID of the clicked header as per the config
     */
    clickedHeaderCellId: ID;
}

export interface SortConfig {
    /**
     * Current active sort order
     */
    order: SortOrder;
    /**
     * Header ID on which sorting is applied
     */
    sortedHeaderCellId?: ID;
    /**
     * Function to handle the sorting logic
     */
    sortFunction: (event: SyntheticEvent, params: SortFunctionParams) => void;
}

/**
 * Available table sizes
 *
 * - xs: Extra small
 * - sm: Small
 * - md: Medium
 * - lg: Large
 * - xl: Extra large
 */
export type TableSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface TooltipConfig {
    /**
     * Content for the tooltip
     */
    content: TippyProps['content'];
    /**
     * Tooltip placement
     *
     * @default top
     */
    placement?: TippyProps['placement'];
    /**
     * Helper icon to be used for displaying the tooltip
     */
    showIcon?: boolean;
}

export interface TableHeaderCellProps {
    /**
     * Unique identifier for the header cell
     */
    id: ID;
    /**
     * Content for the header cell. It can be string, number or a react component
     */
    value: ReactNode;
    /**
     * Size of the header cell.
     * 
     * Note: It controls the size of the whole column
     */
    size?: TableSize;
    /**
     * Configuration for the tooltip for the header cell
     */
    tooltipConfig?: TooltipConfig;
    /**
     * onClick callback for the header cell
     */
    onClick?: (event: SyntheticEvent) => void;
    /**
     * Denotes whether the header cell is sortable or not
     */
    isSortable?: boolean;
    /**
     * Current sort order
     */
    sortOrder?: SortOrder;
}

export interface TableRowProps {
    /**
     * Unique ID for the row
     */
    id?: ID;
    /**
     * Mouse enter event for handling the hovering logic
     */
    onMouseEnter?: (event: SyntheticEvent) => void;
    /**
     * Mouse leave event for handling the hovering logic
     */
    onMouseLeave?: (event: SyntheticEvent) => void;
    /**
     * Row click callback function
     */
    onClick?: (event: SyntheticEvent) => void;
}

/**
 * Row cell with support for tooltip
 */
export type TableBodyDataWithTooltipConfig = { value: ReactNode; tooltipConfig: Omit<TooltipConfig, 'showIcon'> };

/**
 * Table body data configuration with or without tooltip
 */
type TableBodyData = ReactNode | TableBodyDataWithTooltipConfig;

export interface TableCellProps {
    cellData: TableBodyData;
    /**
     * To make a cell span over multiple columns
     */
    colSpan?: number;
    actionButtons?: ActionButton[];
}

export interface TableBodyConfig {
    /**
     * Unique identifier for the row
     */
    id: ID;
    /**
     * Row data in order of header cells.
     *
     * Note: Use the function callback if some custom logic is to be applied
     */
    data: TableBodyData[] | ((config: { rowId: ID; isHovered?: boolean; }) => TableBodyData[]);
}

export interface ActionButton {
    /**
     * Unique identifier for the action button
     */
    id: ID;
    /**
     * Renderer for the action button
     */
    getActionButton: ({ rowId }: { rowId: ID; }) => ReactNode;
}

export interface TableProps {
    /**
     * Header configuration
     */
    headers: (Omit<TableHeaderCellProps, 'onClick' | 'sortOrder'>)[];
    /**
     * Row / body configuration
     */
    body: TableBodyConfig[];
    /**
     * Click handler for the row
     */
    onRowClick?: (event: SyntheticEvent, { rowId }: { rowId: ID }) => void;
    /**
     * Applied sorting configuration
     */
    sortConfig?: SortConfig;
    /**
     * Action button configuration
     */
    actionButtons?: ActionButton[];
    /**
     * Empty state for the table
     */
    emptyStateProps?: GenericEmptyStateType;
}
