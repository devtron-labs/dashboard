import { useMemo } from 'react'

import { FiltersTypeEnum, PaginationEnum, Table, useAsync } from '@devtron-labs/devtron-fe-common-lib/dist'

import { CUSTOMER_TABLE_COLUMN } from './constants'
import { getCustomerListData } from './service'
import { CustomerObservabilityDTO, CustomerTableProps } from './types'

export const CustomerList = () => {
    // ASYNC CALLS
    const [isFetching, customerData] = useAsync(() => getCustomerListData(), [])

    // CONFIGS
    const rows = useMemo<CustomerTableProps['rows']>(
        () =>
            (customerData || []).map((data) => ({
                id: `observe_project_${data.id.toString()}`,
                data,
            })),
        [customerData],
    )

    const filter: CustomerTableProps['filter'] = (
        rowData: { id: string; data: CustomerObservabilityDTO },
        filterData: { searchKey: string },
    ) => rowData.data.name.toLowerCase().includes(filterData.searchKey.toLowerCase())

    return (
        <div className="observability-table-wrapper flexbox-col flex-grow-1 dc__overflow-auto">
            <Table<CustomerObservabilityDTO, FiltersTypeEnum.STATE, {}>
                id="table__customer-list"
                loading={isFetching}
                stylesConfig={{ showSeparatorBetweenRows: true }}
                columns={CUSTOMER_TABLE_COLUMN}
                rows={rows}
                filtersVariant={FiltersTypeEnum.STATE}
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
                paginationVariant={PaginationEnum.PAGINATED}
            />
        </div>
    )
}
