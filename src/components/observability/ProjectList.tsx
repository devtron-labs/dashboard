import { FiltersTypeEnum, numberComparatorBySortOrder, PaginationEnum, stringComparatorBySortOrder, Table, TableCellComponentProps, TableSignalEnum, Tooltip, useAsync } from ".yalc/@devtron-labs/devtron-fe-common-lib/dist";
import { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { ObservabilityProject, ProjectListFields, ProjectTableProps } from "./types";
import { Link } from "react-router-dom";
import { getProjectList } from "./service";

const ProjectList = () => {

    // ASYNC CALLS
            const [isFetching, projectData, isError, refetch] = useAsync(
                () => getProjectList(),
                [],
            )

            // CONFIGS
                const rows = useMemo<ProjectTableProps['rows']>(
                    () =>
                        (projectData || []).map((data) => ({
                            id: `observe_project_${data.id.toString()}`,
                            data,
                        })),
                    [projectData],
                )

                const filter: ProjectTableProps['filter'] = (rowData, filterData) =>
            rowData.data.name.includes(filterData.searchKey.toLowerCase())

    return <>
        <div className="observability-table-wrapper flexbox-col flex-grow-1 dc__overflow-auto">
                    <Table<ObservabilityProject, FiltersTypeEnum.STATE, {}>
                        id="table__customer-list"
                        loading={isFetching}
                        stylesConfig={{ showSeparatorBetweenRows: true }}
                        columns={PROJECT_TABLE_COLUMNS}
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
}

export default ProjectList;

export const ProjectListCellComponent: FunctionComponent<
    TableCellComponentProps<ProjectTableProps, FiltersTypeEnum.STATE, {}>
> = ({
    field,
    row: {
        data: { id, name, description, status, totalVms, activeVms, healthStatus },
    },
    isRowActive,
    signals,
}: TableCellComponentProps<ProjectTableProps, FiltersTypeEnum.STATE, {}>) => {
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
        case ProjectListFields.PROJECT_NAME:
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
        case ProjectListFields.PROJECT_DESCRIPTION:
            return <span className="flex left py-10">{description}</span>
        case ProjectListFields.PROJECT_STATUS:
            return <span className="flex left py-10">{status}</span>
        case ProjectListFields.TOTAL_VMS:
            return <span className="flex left py-10">{totalVms}</span>
        case ProjectListFields.ACTIVE_VMS:
            return (
                <div className="flex left py-10">
                    <Tooltip content={activeVms}>
                        <span className="dc__truncate">{activeVms}</span>
                    </Tooltip>
                </div>
            )
        case ProjectListFields.HEALTH_STATUS:
            return (
                <div className="flex left py-10">
                    <Tooltip content={healthStatus}>
                        <span className="dc__truncate">{healthStatus}</span>
                    </Tooltip>
                </div>
            )
        default:
            return null
    }
}

export const PROJECT_TABLE_COLUMNS: ProjectTableProps['columns'] = [
    {
        field: 'name',
        label: 'Project name',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: ProjectListCellComponent
    },
    {
        field: 'description',
        label: 'Description',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: ProjectListCellComponent
    },
    {
        field: 'status',
        label: 'Status',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: ProjectListCellComponent
    },
    {
        field: 'totalVms',
        label: 'Total VM',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: ProjectListCellComponent
    },
    {
        field: 'activeVms',
        label: 'Active VM',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: ProjectListCellComponent
    },
    {
        field: 'healthStatus',
        label: 'Health Status',
        size: {
            fixed: 200,
        },
        CellComponent: ProjectListCellComponent
    }
]