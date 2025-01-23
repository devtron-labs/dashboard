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
import {
    GenericEmptyState,
    APIResponseHandler,
    useAsync,
    Tooltip,
    EMPTY_STATE_STATUS,
    URLS,
    SortableTableHeaderCell,
    getAlphabetIcon,
    useUrlFilters,
    GenericFilterEmptyState,
    stringComparatorBySortOrder,
    DeploymentChartType,
} from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '@Config/constants'
import emptyCustomChart from '@Images/ic-empty-custom-charts.webp'
import { ReactComponent as ICFolderZip } from '@Icons/ic-folder-zip.svg'
import { ReactComponent as ICDevtron } from '@Icons/ic-devtron.svg'
import { importComponentFromFELibrary } from '@Components/common'
import UploadChartModal from './UploadChartModal'
import { getChartList } from './service'
import DeploymentChartsListHeader from './DeploymentChartsListHeader'
import UploadButton from './UploadButton'
import DownloadChartButton from './DownloadChartButton'
import './styles.scss'
import { DeploymentChartsListSortableKeys } from '../types'

const EditDeploymentChart = importComponentFromFELibrary('EditDeploymentChart', null, 'function')

const DeploymentChartsList = () => {
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [chartListLoading, chartList, chartListError, reloadChartList] = useAsync(getChartList)

    const { sortBy, sortOrder, searchKey, handleSearch, handleSorting, clearFilters } =
        useUrlFilters<DeploymentChartsListSortableKeys>({
            initialSortKey: DeploymentChartsListSortableKeys.CHART_NAME,
        })

    const sortChartList = (a: DeploymentChartType, b: DeploymentChartType) => {
        switch (sortBy) {
            case DeploymentChartsListSortableKeys.CHART_VERSION:
                return stringComparatorBySortOrder(a.versions[0].version, b.versions[0].version, sortOrder)
            case DeploymentChartsListSortableKeys.UPLOADED_BY:
                return stringComparatorBySortOrder(a.versions[0].uploadedBy, b.versions[0].uploadedBy, sortOrder)
            default:
                return stringComparatorBySortOrder(a.name, b.name, sortOrder)
        }
    }

    const filteredChartList = useMemo(() => {
        const lowerCaseSearch = searchKey.toLowerCase()
        const filteredList = chartList?.filter((chart) => chart.name.toLowerCase().includes(lowerCaseSearch)) || []
        return filteredList.sort((a, b) => sortChartList(a, b))
    }, [sortBy, sortOrder, searchKey, chartList])

    const handleCloseUploadChartModal = (isReloadChartList: boolean): void => {
        setShowUploadPopup(false)
        if (isReloadChartList) {
            reloadChartList()
        }
    }

    const handleOpenUploadChartModal = () => {
        setShowUploadPopup(true)
    }

    const renderUploadButton = () => <UploadButton handleOpenUploadChartModal={handleOpenUploadChartModal} />

    const renderBody = () => {
        if (chartList.length === 0) {
            return (
                <GenericEmptyState
                    image={emptyCustomChart}
                    title={EMPTY_STATE_STATUS.CUSTOM_CHART_LIST.TITLE}
                    subTitle={
                        <>
                            Import custom charts to use them in apps instead of the default system template.
                            <a
                                className="dc__no-decor"
                                href={DOCUMENTATION.DEPLOYMENT_TEMPLATE}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                Learn more
                            </a>
                        </>
                    }
                    isButtonAvailable
                    renderButton={renderUploadButton}
                />
            )
        }

        return (
            <div className="flexbox-col flex-grow-1 pt-16 dc__gap-8" data-testid="custom-charts-list">
                <DeploymentChartsListHeader
                    searchKey={searchKey}
                    handleSearch={handleSearch}
                    handleOpenUploadChartModal={handleOpenUploadChartModal}
                />
                {filteredChartList.length ? (
                    <div className="flexbox-col flex-grow-1">
                        <div className="dc__grid dc__gap-16 dc__align-items-center chart-list-row dc__border-bottom px-20 py-10 fs-12 fw-6 lh-20 cn-7">
                            <span />
                            <SortableTableHeaderCell
                                title="Name"
                                isSortable
                                disabled={false}
                                sortOrder={sortOrder}
                                triggerSorting={() => handleSorting(DeploymentChartsListSortableKeys.CHART_NAME)}
                                isSorted={sortBy === DeploymentChartsListSortableKeys.CHART_NAME}
                            />
                            <SortableTableHeaderCell
                                title="Version"
                                isSortable
                                disabled={false}
                                sortOrder={sortOrder}
                                triggerSorting={() => handleSorting(DeploymentChartsListSortableKeys.CHART_VERSION)}
                                isSorted={sortBy === DeploymentChartsListSortableKeys.CHART_VERSION}
                            />
                            <SortableTableHeaderCell title="Description" isSortable={false} />
                            <SortableTableHeaderCell
                                title="Uploaded by"
                                isSortable
                                disabled={false}
                                sortOrder={sortOrder}
                                triggerSorting={() => handleSorting(DeploymentChartsListSortableKeys.UPLOADED_BY)}
                                isSorted={sortBy === DeploymentChartsListSortableKeys.UPLOADED_BY}
                            />
                            <span />
                        </div>
                        <div className="flexbox-col dc__overflow-auto flex-grow-1">
                            {filteredChartList.map((chartData) => {
                                const { version, description, uploadedBy, isUserUploaded } = chartData.versions[0]
                                return (
                                    <div
                                        key={`custom-chart_${chartData.name}`}
                                        className="chart-list-row fw-4 cn-9 fs-13 lh-20 fw-4 dc__grid dc__gap-16 dc__align-items-center px-20 py-10"
                                    >
                                        <ICFolderZip className="icon-dim-24 fcb-5" />
                                        <span className="dc__ellipsis-right">{chartData.name}</span>
                                        <div className="flexbox dc__gap-8">
                                            <span>{version}</span>
                                            <span className="cn-5">
                                                {!!(chartData.versions.length - 1) &&
                                                    `+${chartData.versions.length - 1} more`}
                                            </span>
                                        </div>
                                        <Tooltip content={description} placement="left">
                                            <span className="dc__ellipsis-right">{description}</span>
                                        </Tooltip>
                                        <div>
                                            {isUserUploaded ? (
                                                <>
                                                    {getAlphabetIcon(uploadedBy)}
                                                    <span>{uploadedBy}</span>
                                                </>
                                            ) : (
                                                <div className="flexbox dc__align-items-center dc__gap-4 fcb-5">
                                                    <ICDevtron className="icon-dim-20" />
                                                    <span>Devtron</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flexbox dc__gap-4">
                                            {EditDeploymentChart && <EditDeploymentChart name={chartData.name} />}
                                            <DownloadChartButton name={chartData.name} versions={chartData.versions} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <GenericFilterEmptyState handleClearFilters={clearFilters} />
                )}
            </div>
        )
    }

    return (
        <APIResponseHandler
            isLoading={chartListLoading}
            progressingProps={{
                pageLoader: true,
            }}
            error={chartListError}
            errorScreenManagerProps={{
                code: chartListError?.code,
                reload: reloadChartList,
                redirectURL: URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST,
            }}
        >
            {!!chartList && (
                <>
                    {renderBody()}
                    {showUploadPopup && <UploadChartModal closeUploadPopup={handleCloseUploadChartModal} />}
                </>
            )}
        </APIResponseHandler>
    )
}

export default DeploymentChartsList
