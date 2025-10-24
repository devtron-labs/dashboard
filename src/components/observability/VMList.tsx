import { FiltersTypeEnum, numberComparatorBySortOrder, PaginationEnum, stringComparatorBySortOrder, Table, TableCellComponentProps, TableSignalEnum, Tooltip, useAsync } from ".yalc/@devtron-labs/devtron-fe-common-lib/dist";
import { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { ObservabilityVM, VMListFields, VMTableProps } from "./types";
import { Link } from "react-router-dom";
import { getVMList } from "./service";

const VMList = () => {

    // ASYNC CALLS
    const [isFetching, vmData, isError, refetch] = useAsync(
        () => getVMList(),
        [],
    )

    // CONFIGS
    const rows = useMemo<VMTableProps['rows']>(
        () =>
            (vmData || []).map((data) => ({
                id: `observe_vm_${data.id.toString()}`,
                data,
            })),
        [vmData],
    )

    const filter: VMTableProps['filter'] = (rowData, filterData) =>
        rowData.data.name.includes(filterData.searchKey.toLowerCase())

    return (
        <>
            <div className="observability-table-wrapper flexbox-col flex-grow-1 dc__overflow-auto">
                <Table<ObservabilityVM, FiltersTypeEnum.STATE, {}>
                    id="table__vm-list"
                    loading={isFetching}
                    stylesConfig={{ showSeparatorBetweenRows: true }}
                    columns={VM_TABLE_COLUMNS}
                    rows={rows}
                    filtersVariant={FiltersTypeEnum.STATE}
                    paginationVariant={PaginationEnum.NOT_PAGINATED}
                    emptyStateConfig={{
                        noRowsConfig: {
                            title: 'No resources found',
                            subTitle: `No resources found in this cluster for upgrade compatibility check`,
                        },
                    }}
                    filter={filter}
                    additionalFilterProps={{
                        initialSortKey: 'name',
                    }}
                />
            </div>
        </>
    )
}

export default VMList;

export const VMListCellComponent: FunctionComponent<
    TableCellComponentProps<VMTableProps, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { id, name, ipAddress, status, cpu, memory, disk },
    },
    isRowActive,
    signals,
}: TableCellComponentProps<VMTableProps, FiltersTypeEnum.STATE, {}>) => {
    const linkRef = useRef<HTMLAnchorElement>(null)

    useEffect(() => {
        const handleEnter = ({ detail: { activeRowData } }) => {
            if (activeRowData.data.id === id) {
                linkRef.current?.click()
            }
        }

        if (isRowActive) {
            signals.addEventListener(TableSignalEnum.ENTER_PRESSED, handleEnter)
        }

        return () => {
            signals.removeEventListener(TableSignalEnum.ENTER_PRESSED, handleEnter)
        }
    }, [isRowActive])

    switch (field) {
        case VMListFields.VM_NAME:
            return (
                <Link
                    ref={linkRef}
                    to={'test'}
                    className="flex left py-10"
                >
                    <Tooltip content={name}>
                        <span className="dc__truncate">{name}</span>
                    </Tooltip>
                </Link>
            )
        case VMListFields.VM_IPADDRESS:
            return <span className="flex left py-10">{ipAddress}</span>
        case VMListFields.VM_STATUS:
            return <span className="flex left py-10">{status}</span>
        case VMListFields.VM_CPU:
            return <span className="flex left py-10">{cpu}</span>
        case VMListFields.VM_MEMORY:
            return (
                <div className="flex left py-10">
                    <Tooltip content={memory}>
                        <span className="dc__truncate">{memory}</span>
                    </Tooltip>
                </div>
            )
        case VMListFields.VM_DISK:
            return (
                <div className="flex left py-10">
                    <Tooltip content={disk}>
                        <span className="dc__truncate">{disk}</span>
                    </Tooltip>
                </div>
            )
        default:
            return null
    }
}

export const VM_TABLE_COLUMNS: VMTableProps['columns'] = [
    {
        field: 'name',
        label: 'VM name',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: VMListCellComponent
    },
    {
        field: 'status',
        label: 'Status',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: VMListCellComponent
    },
    {
        field: 'ipAddress',
        label: 'IP Address',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: VMListCellComponent
    },
    {
        field: 'cpu',
        label: 'CPU',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: VMListCellComponent
    },
    {
        field: 'memory',
        label: 'Memory',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: VMListCellComponent
    },
    {
        field: 'disk',
        label: 'Disk',
        size: {
            fixed: 200,
        },
        comparator: numberComparatorBySortOrder,
        CellComponent: VMListCellComponent
    }
]