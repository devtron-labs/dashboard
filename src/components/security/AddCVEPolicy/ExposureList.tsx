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

import {
    DEFAULT_BASE_PAGE_SIZE,
    GenericFilterEmptyState,
    Pagination,
    SortableTableHeaderCell,
} from '@devtron-labs/devtron-fe-common-lib'
import { ExposureListProps } from '../security.types'

const ExposureList = ({
    appListResponse,
    areFiltersApplied,
    clearExposureListFilters,
    offset,
    pageSize,
    changePage,
    changePageSize,
}: ExposureListProps) => {
    const appListLength = appListResponse.result.scanList.length
    if (!appListLength && areFiltersApplied) {
        return (
            <div className="dc__position-rel" style={{ height: 'calc(100vh - 200px)' }}>
                <GenericFilterEmptyState handleClearFilters={clearExposureListFilters} />
            </div>
        )
    }
    return appListLength ? (
        <>
            <div className="w-100">
                <div className="fs-12 fw-6 lh-20 cn-7 pl-20 pr-20 dc__border-bottom px-20 vulnerability-exp-table-row h-36">
                    <SortableTableHeaderCell title="NAME" isSortable={false} />
                    <SortableTableHeaderCell title="ENVIRONMENT" isSortable={false} />
                    <SortableTableHeaderCell title="POLICY" isSortable={false} />
                </div>
                {appListResponse.result.scanList.map((cve) => (
                    <div
                        key={`${cve.appName}-${cve.envName}`}
                        className="dc__border-bottom-n1 dc__hover-n50 vulnerability-exp-table-row px-20 h-44 dc__align-items-center fs-13 lh-20 cn-9"
                    >
                        <span>{cve.appName}</span>
                        <span>{cve.envName}</span>
                        <span>
                            <span className={`security-tab__cell-policy--${cve.policy}`}>
                                {cve.policy.toUpperCase()}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
            {appListLength > DEFAULT_BASE_PAGE_SIZE && (
                <Pagination
                    rootClassName="flex dc__content-space px-20"
                    size={appListLength}
                    pageSize={pageSize}
                    offset={offset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )}
        </>
    ) : null
}

export default ExposureList
