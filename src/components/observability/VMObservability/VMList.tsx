import { useMemo, useState } from 'react'

import {
    ComponentSizeType,
    FiltersTypeEnum,
    PageHeader,
    PaginationEnum,
    SearchBar,
    Table,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { VM_TABLE_COLUMNS } from '../constants'
import { getVMList } from '../service'
import { ObservabilityVM, VMTableProps } from '../types'

const VMList = ({ renderBreadcrumbs, renderTabs }: { renderBreadcrumbs; renderTabs }) => {
    // ASYNC CALLS
    const [isFetching, vmData] = useAsync(() => getVMList(), [])
    const [searchKey, setSearchKey] = useState('')

    // CONFIGS
    const rows = useMemo<VMTableProps['rows']>(
        () =>
            (vmData || []).map((data) => ({
                id: `observe_vm_${data.id.toString()}`,
                data,
            })),
        [vmData],
    )

    const handleSearch = (_searchKey: string) => {
        setSearchKey(_searchKey)
    }

    const filter: VMTableProps['filter'] = (rowData, filterData) =>
        rowData.data.name.includes(filterData.searchKey.toLowerCase())

    return (
        <div>
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} showTabs renderHeaderTabs={renderTabs} />

            <div className="observability-table-wrapper flexbox-col flex-grow-1 dc__overflow-auto">
                <div className="px-20 py-12">
                    <SearchBar
                        containerClassName="w-250"
                        dataTestId="search-project-env"
                        initialSearchText={searchKey}
                        inputProps={{
                            placeholder: 'Search project',
                        }}
                        handleEnter={handleSearch}
                        size={ComponentSizeType.medium}
                        keyboardShortcut="/"
                    />
                </div>
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
        </div>
    )
}

export default VMList
