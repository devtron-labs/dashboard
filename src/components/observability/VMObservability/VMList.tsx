import { useMemo } from 'react'

import { FiltersTypeEnum, PaginationEnum, Table, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { VM_TABLE_COLUMNS } from '../constants'
import { getVMList } from '../service'
import { ObservabilityVM, VMTableProps } from '../types'

const VMList = () => {
    // ASYNC CALLS
    const [isFetching, vmData] = useAsync(() => getVMList(), [])

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
    )
}

export default VMList
