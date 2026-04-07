import { useCallback, useMemo } from 'react'
import { generatePath, Link, useHistory } from 'react-router-dom'

import {
    ExportToCsv,
    FiltersTypeEnum,
    getSelectPickerOptionByValue,
    Icon,
    noop,
    PaginationEnum,
    RESOURCE_BROWSER_ROUTES,
    SearchBar,
    SelectPicker,
    SelectPickerOptionType,
    Table,
    TableCellComponentProps,
    TableColumnType,
    TableProps,
    TableViewWrapperProps,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { getNodeViewGroupList, getNodeViewGroupListForExport } from '../service'
import {
    AutoscalerTypes,
    ExportNodeViewGroupListType,
    NodeErrorsKeys,
    NodeSchedulingKeys,
    NodeViewGroupListFiltersType,
    NodeViewGroupListFiltersTypeEnum,
    NodeViewGroupRowType,
    NodeViewGroupType,
} from '../types'
import { AUTOSCALER_TYPE_LABELS, EXPORT_NODE_LIST_HEADERS, NODE_ERRORS_LABEL_MAP } from './constants'
import { AutoscalerTypeFilters, NodeErrorsFilters, NodeSchedulingTypeFilters } from './types'
import { getNodeListFilterOptions } from './utils'

const NodeScheduleCellComponent = ({ row }: TableCellComponentProps<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>) => {
    const { schedulable } = row.data

    return (
        <div className="flex left py-10 dc__gap-6">
            <Icon name={schedulable ? 'ic-check' : 'ic-close-small'} color={schedulable ? 'G500' : 'R500'} />
            <span>{schedulable ? 'Schedulable' : 'Unschedulable'}</span>
        </div>
    )
}

const ErrorCellComponent = ({ row }: TableCellComponentProps<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>) => {
    const nodeErrors = row.data.nodeErrors.map((error) => NODE_ERRORS_LABEL_MAP[error])?.join(', ') || ''

    return (
        <div className="flex left py-10">
            <Tooltip content={nodeErrors}>
                <span className="dc__truncate">{nodeErrors}</span>
            </Tooltip>
        </div>
    )
}

const NodeNameCellComponent = ({ row }: TableCellComponentProps<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>) => {
    const { nodeName, clusterId } = row.data

    return (
        <div className="flex left py-10">
            <Tooltip content={nodeName}>
                <Link
                    className="dc__truncate"
                    to={generatePath(RESOURCE_BROWSER_ROUTES.NODE_DETAIL, { clusterId, name: nodeName })}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {nodeName}
                </Link>
            </Tooltip>
        </div>
    )
}

const ClusterNameCellComponent = ({ row }: TableCellComponentProps<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>) => {
    const { clusterName } = row.data

    return (
        <div className="flex left py-10">
            <Tooltip content={clusterName}>
                <span className="dc__truncate">{clusterName}</span>
            </Tooltip>
        </div>
    )
}

const AutoscalerTypeCellComponent = ({
    row,
}: TableCellComponentProps<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>) => {
    const { autoscalerType } = row.data
    const autoscalerTypeLabel = AUTOSCALER_TYPE_LABELS[autoscalerType] || ''

    return (
        <div className="flex left py-10">
            <Tooltip content={autoscalerTypeLabel}>
                <span className="dc__truncate">{autoscalerTypeLabel}</span>
            </Tooltip>
        </div>
    )
}

const getGroupSpecificTableColumns = (
    nodeViewGroupType: NodeViewGroupType,
): TableColumnType<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>[] => {
    switch (nodeViewGroupType) {
        case NodeViewGroupType.NODE_ERRORS:
            return [
                {
                    label: 'ERRORS',
                    field: 'nodeErrors',
                    size: { fixed: 250 },
                    CellComponent: ErrorCellComponent,
                },
                {
                    label: 'NODE STATUS',
                    field: 'nodeStatus',
                    size: { fixed: 150 },
                    isSortable: true,
                },
            ]
        case NodeViewGroupType.NODE_SCHEDULING:
            return [
                {
                    label: 'SCHEDULABLE',
                    field: 'schedulable',
                    size: { fixed: 120 },
                    isSortable: true,
                    CellComponent: NodeScheduleCellComponent,
                },
            ]
        case NodeViewGroupType.AUTOSCALER_MANAGED:
            return [
                {
                    label: 'AUTOSCALER TYPE',
                    field: 'autoscalerType',
                    size: { fixed: 150 },
                    isSortable: true,
                    CellComponent: AutoscalerTypeCellComponent,
                },
            ]
        default:
            return []
    }
}

const NodeViewGroupListWrapper = ({
    searchKey,
    handleSearch,
    children,
    errorType,
    autoscalerType,
    schedulableType,
    nodeViewGroupType,
    updateSearchParams,
}: TableViewWrapperProps<NodeViewGroupRowType, FiltersTypeEnum.URL, NodeViewGroupListFiltersType>) => {
    const handleErrorTypeChange = (selectedOption: SelectPickerOptionType<NodeErrorsFilters>) => {
        const optionValue = selectedOption?.value
        updateSearchParams({
            [NodeViewGroupListFiltersTypeEnum.ERROR_TYPE]: optionValue === 'ALL' ? null : optionValue,
        })
    }

    const handleAutoscalerTypeChange = (selectedOption: SelectPickerOptionType<AutoscalerTypeFilters>) => {
        const optionValue = selectedOption?.value
        updateSearchParams({
            [NodeViewGroupListFiltersTypeEnum.AUTOSCALER_TYPE]: optionValue === 'ALL' ? null : optionValue,
        })
    }

    const handleSchedulingChange = (selectedOption: SelectPickerOptionType<NodeSchedulingTypeFilters>) => {
        const optionValue = selectedOption?.value
        updateSearchParams({
            [NodeViewGroupListFiltersTypeEnum.SCHEDULABLE]: optionValue === 'ALL' ? null : optionValue,
        })
    }

    const getFilterChangeHandler = () => {
        switch (nodeViewGroupType) {
            case NodeViewGroupType.NODE_ERRORS:
                return handleErrorTypeChange
            case NodeViewGroupType.AUTOSCALER_MANAGED:
                return handleAutoscalerTypeChange
            case NodeViewGroupType.NODE_SCHEDULING:
                return handleSchedulingChange
            default:
                return noop
        }
    }

    const getFilterValue = () => {
        switch (nodeViewGroupType) {
            case NodeViewGroupType.NODE_ERRORS:
                return errorType
            case NodeViewGroupType.AUTOSCALER_MANAGED:
                return autoscalerType
            case NodeViewGroupType.NODE_SCHEDULING:
                return schedulableType
            default:
                return ''
        }
    }

    const filterOptions = useMemo(() => getNodeListFilterOptions(nodeViewGroupType), [nodeViewGroupType])

    const filterType = getFilterValue()

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-auto">
            <div className="flex dc__content-space py-12 px-16">
                <div className="flex dc__gap-12">
                    <SearchBar initialSearchText={searchKey} handleEnter={handleSearch} keyboardShortcut="/" />
                    <SelectPicker
                        inputId="node-list-filter"
                        options={filterOptions}
                        value={getSelectPickerOptionByValue(filterOptions, filterType ?? 'ALL')}
                        onChange={getFilterChangeHandler()}
                    />
                </div>
                <ExportToCsv<ExportNodeViewGroupListType>
                    apiPromise={getNodeViewGroupListForExport(nodeViewGroupType)}
                    fileName="nodeList"
                    triggerElementConfig={{
                        showOnlyIcon: true,
                    }}
                    headers={EXPORT_NODE_LIST_HEADERS}
                />
            </div>
            {children}
        </div>
    )
}

const NodeViewGroupList = ({ nodeViewGroupType }: { nodeViewGroupType: NodeViewGroupType }) => {
    const { push } = useHistory()
    const getRows: TableProps<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>['getRows'] = useCallback(
        async (
            {
                searchKey,
                offset,
                pageSize,
                sortBy,
                sortOrder,
                errorType,
                autoscalerType,
                schedulableType,
            }: Record<NodeViewGroupListFiltersTypeEnum, string> & Parameters<TableProps['getRows']>[0],
            abortSignal,
        ) => {
            const response = await getNodeViewGroupList({
                searchKey,
                groupBy: nodeViewGroupType,
                offset,
                pageSize,
                sortBy,
                sortOrder,
                ...(nodeViewGroupType === NodeViewGroupType.NODE_ERRORS && errorType !== 'ALL'
                    ? { errorType: errorType as NodeErrorsKeys }
                    : {}),
                ...(nodeViewGroupType === NodeViewGroupType.AUTOSCALER_MANAGED && autoscalerType !== 'ALL'
                    ? { autoscalerType: autoscalerType as AutoscalerTypes }
                    : {}),
                ...(nodeViewGroupType === NodeViewGroupType.NODE_SCHEDULING && schedulableType !== 'ALL'
                    ? { schedulableType: schedulableType as NodeSchedulingKeys }
                    : {}),
                abortSignal,
            })

            return {
                rows: (response.result?.nodeList || []).map((node) => ({
                    id: `${node.nodeName}-${node.clusterName}`,
                    data: node,
                })),
                totalRows: response.result?.totalCount || 0,
            }
        },
        [],
    )

    const clearFilters = () => {
        push({ search: '' })
    }

    return (
        <Table<NodeViewGroupRowType, FiltersTypeEnum.URL, {}>
            id="table__node-detailed-list"
            columns={[
                {
                    label: 'NODE NAME',
                    field: 'nodeName',
                    size: { fixed: 300 },
                    isSortable: true,
                    CellComponent: NodeNameCellComponent,
                },
                {
                    label: 'CLUSTER NAME',
                    field: 'clusterName',
                    size: { fixed: 150 },
                    isSortable: true,
                    CellComponent: ClusterNameCellComponent,
                },
                ...getGroupSpecificTableColumns(nodeViewGroupType),
            ]}
            getRows={getRows}
            emptyStateConfig={{
                noRowsConfig: {
                    title: 'No Nodes Found',
                    subTitle: 'There are no nodes to display in this view.',
                },
            }}
            paginationVariant={PaginationEnum.PAGINATED}
            filtersVariant={FiltersTypeEnum.URL}
            filter={null}
            additionalFilterProps={{
                initialSortKey: 'nodeName',
                parseSearchParams: (searchParams) => ({
                    errorType: searchParams.get(NodeViewGroupListFiltersTypeEnum.ERROR_TYPE),
                    autoscalerType: searchParams.get(NodeViewGroupListFiltersTypeEnum.AUTOSCALER_TYPE),
                    schedulableType: searchParams.get(NodeViewGroupListFiltersTypeEnum.SCHEDULABLE),
                }),
            }}
            additionalProps={{ nodeViewGroupType }}
            ViewWrapper={NodeViewGroupListWrapper}
            clearFilters={clearFilters}
        />
    )
}

export default NodeViewGroupList
