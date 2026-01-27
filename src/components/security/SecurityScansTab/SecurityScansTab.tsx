/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    EMPTY_STATE_STATUS,
    FiltersTypeEnum,
    PaginationEnum,
    Table,
    URLS,
    useAsync,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import AppNotDeployed from '../../../assets/img/app-not-deployed.svg'
import { getVulnerabilityFilterData } from '../security.service'
import { SecurityScanType } from '../security.types'
import { INITIAL_SCAN_DETAILS } from './constants'
import SecurityScansTableWrapper from './SecurityScansTableWrapper'
import { getSecurityScans } from './service'
import {
    ScanDetailsType,
    ScanListUrlFiltersType,
    ScanTypeOptions,
    SecurityListSortableKeys,
} from './types'
import { getSecurityScansTableColumns, parseSearchParams } from './utils'

import './styles.scss'

const SecurityScansTab = () => {
    const { push } = useHistory()
    const { scanStatus } = useUrlFilters<SecurityListSortableKeys, Partial<ScanListUrlFiltersType>>({
        parseSearchParams,
        initialSortKey: SecurityListSortableKeys.APP_NAME,
    })
    const [scanDetails, setScanDetails] = useState<ScanDetailsType>(INITIAL_SCAN_DETAILS)

    const [clusterEnvListLoading, clusterEnvListResult, clusterEnvListError, reloadClusterEnvOptions] = useAsync(() =>
        getVulnerabilityFilterData(),
    )

    const isNotScannedList = scanStatus === ScanTypeOptions.NOT_SCANNED

    const redirectToAppEnv = (appId: number, envId: number) => {
        push(`${URLS.APPLICATION_MANAGEMENT_APP}/${appId}/details/${envId}`)
    }

    const handleRowClick = (row: { data: SecurityScanType; id: string }) => {
        if (isNotScannedList) {
            redirectToAppEnv(row.data.appId, row.data.envId)
        } else {
            setScanDetails({
                appId: row.data.appId,
                envId: row.data.envId,
            })
        }
    }

    const columns = useMemo(() => getSecurityScansTableColumns(isNotScannedList), [isNotScannedList])

    return (
        <div className="security-scan-container bg__primary flexbox-col flex-grow-1 dc__overflow-hidden">
            <Table<SecurityScanType, FiltersTypeEnum.URL, ScanListUrlFiltersType>
                id="table__security-scans"
                columns={columns}
                getRows={getSecurityScans}
                emptyStateConfig={{
                    noRowsConfig: {
                        image: AppNotDeployed,
                        title: EMPTY_STATE_STATUS.SECURITY_SCANS.TITLE,
                    },
                }}
                paginationVariant={PaginationEnum.PAGINATED}
                filtersVariant={FiltersTypeEnum.URL}
                filter={null}
                additionalFilterProps={{
                    initialSortKey: SecurityListSortableKeys.APP_NAME,
                    parseSearchParams,
                }}
                additionalProps={{
                    clusterEnvListLoading,
                    clusterEnvListResult,
                    clusterEnvListError,
                    reloadClusterEnvOptions,
                    scanDetails,
                    setScanDetails,
                }}
                ViewWrapper={SecurityScansTableWrapper}
                rowStartIconConfig={{
                    name: 'ic-devtron-app',
                    size: 24,
                    color: 'B500',
                }}
                onRowClick={handleRowClick}
            />
        </div>
    )
}

export default SecurityScansTab
