import { useMemo } from 'react'

import { FiltersTypeEnum, PaginationEnum, Table, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { PROJECT_TABLE_COLUMNS } from '../constants'
import { getProjectList } from '../service'
import { ObservabilityProject, ProjectTableProps } from '../types'

const ProjectList = () => {
    // ASYNC CALLS
    const [isFetching, projectData] = useAsync(() => getProjectList(), [])

    // CONFIGS
    const rows = useMemo<ProjectTableProps['rows']>(
        () =>
            (projectData || []).map((data) => ({
                id: `observe_project_${data.id.toString()}`,
                data,
            })),
        [projectData],
    )

    const filter: ProjectTableProps['filter'] = (
        rowData: { id: string; data: ObservabilityProject },
        filterData: { searchKey: string },
    ) => rowData.data.name.toLowerCase().includes(filterData.searchKey.toLowerCase())

    return (
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
    )
}

export default ProjectList
