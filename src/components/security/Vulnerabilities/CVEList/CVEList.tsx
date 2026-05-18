import { FiltersTypeEnum, PaginationEnum, Table } from '@devtron-labs/devtron-fe-common-lib'

import CVETableWrapper from './CVEListTableWrapper'
import { CVE_LIST_TABLE_COLUMNS } from './constants'
import { getCVEList } from './service'
import { CVEDetails } from './types'
import { parseSearchParams } from './utils'

const CVEList = () => (
    // biome-ignore lint/complexity/noBannedTypes: Legacy
    <Table<CVEDetails, FiltersTypeEnum.URL, {}>
        id="table__cve-listing"
        columns={CVE_LIST_TABLE_COLUMNS}
        getRows={getCVEList}
        emptyStateConfig={{
            noRowsConfig: {
                title: 'No CVEs Found',
            },
        }}
        paginationVariant={PaginationEnum.PAGINATED}
        filtersVariant={FiltersTypeEnum.URL}
        filter={null}
        additionalFilterProps={{
            initialSortKey: 'cveName',
            parseSearchParams,
        }}
        ViewWrapper={CVETableWrapper}
    />
)

export default CVEList
