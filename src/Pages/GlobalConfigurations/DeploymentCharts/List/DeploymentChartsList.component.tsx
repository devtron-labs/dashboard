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
import DOMPurify from 'dompurify'

import {
    APIResponseHandler,
    EMPTY_STATE_STATUS,
    GenericEmptyState,
    GenericFilterEmptyState,
    getAlphabetIcon,
    highlightSearchText,
    SortableTableHeaderCell,
    Tooltip,
    URLS,
    useAsync,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICDevtronApp } from '@Icons/ic-devtron-app.svg'
import { ReactComponent as ICFolderZip } from '@Icons/ic-folder-zip.svg'
import emptyCustomChart from '@Images/ic-empty-custom-charts.webp'
import { importComponentFromFELibrary } from '@Components/common'
import { DOCUMENTATION } from '@Config/constants'

import { DeploymentChartsListSortableKeys } from '../types'
import DeploymentChartsListHeader from './DeploymentChartsListHeader'
import DownloadChartButton from './DownloadChartButton'
import { getChartList } from './service'
import UploadButton from './UploadButton'
import UploadChartModal from './UploadChartModal'
import { sortChartList } from './utils'

import './styles.scss'

const DeploymentChartActionButton = importComponentFromFELibrary('DeploymentChartActionButton', null, 'function')

const DeploymentChartsList = () => {
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [chartListLoading, chartList, chartListError, reloadChartList] = useAsync(getChartList)

    const { sortBy, sortOrder, searchKey, handleSearch, handleSorting, clearFilters } =
        useUrlFilters<DeploymentChartsListSortableKeys>({
            initialSortKey: DeploymentChartsListSortableKeys.CHART_NAME,
        })

    const handleTriggerSorting = (sortKey: DeploymentChartsListSortableKeys) => () => handleSorting(sortKey)

    const filteredChartList = useMemo(() => {
        const lowerCaseSearch = searchKey.toLowerCase()
        const filteredList = chartList?.filter((chart) => chart.name.toLowerCase().includes(lowerCaseSearch)) || []
        return filteredList.sort((a, b) => sortChartList(a, b, sortBy, sortOrder))
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
            <div className="flexbox-col h-100 dc__gap-8 pt-16" data-testid="custom-charts-list">
                <DeploymentChartsListHeader
                    searchKey={searchKey}
                    handleSearch={handleSearch}
                    handleOpenUploadChartModal={handleOpenUploadChartModal}
                />
                {filteredChartList.length ? (
                    <div className="flexbox-col dc__overflow-auto">
                        <div className="dc__grid dc__gap-16 dc__align-items-center chart-list-row dc__border-bottom px-20 py-10 fs-12 fw-6 lh-20 cn-7">
                            <span />
                            <SortableTableHeaderCell
                                title="Name"
                                isSortable
                                disabled={false}
                                sortOrder={sortOrder}
                                triggerSorting={handleTriggerSorting(DeploymentChartsListSortableKeys.CHART_NAME)}
                                isSorted={sortBy === DeploymentChartsListSortableKeys.CHART_NAME}
                            />
                            <SortableTableHeaderCell
                                title="Version"
                                isSortable
                                disabled={false}
                                sortOrder={sortOrder}
                                triggerSorting={handleTriggerSorting(DeploymentChartsListSortableKeys.CHART_VERSION)}
                                isSorted={sortBy === DeploymentChartsListSortableKeys.CHART_VERSION}
                            />
                            <SortableTableHeaderCell title="Description" isSortable={false} />
                            <SortableTableHeaderCell
                                title="Uploaded by"
                                isSortable
                                disabled={false}
                                sortOrder={sortOrder}
                                triggerSorting={handleTriggerSorting(DeploymentChartsListSortableKeys.UPLOADED_BY)}
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
                                        className="chart-list-row bg__primary fw-4 cn-9 fs-13 lh-20 fw-4 dc__grid dc__gap-16 dc__align-items-center px-20 py-10 dc__hover-n50"
                                    >
                                        <div className="icon-dim-24 p-2">
                                            <ICFolderZip className="icon-dim-20 scb-5" />
                                        </div>
                                        <span
                                            className="dc__truncate"
                                            // eslint-disable-next-line react/no-danger
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(
                                                    highlightSearchText({
                                                        searchText: searchKey,
                                                        text: chartData.name,
                                                        highlightClasses: 'bcy-2',
                                                    }),
                                                ),
                                            }}
                                        />
                                        <div className="flexbox dc__gap-8">
                                            <span>{version}</span>
                                            <span className="cn-6">
                                                {!!(chartData.versions.length - 1) &&
                                                    `+${chartData.versions.length - 1} more`}
                                            </span>
                                        </div>
                                        <Tooltip content={description} placement="top">
                                            <span className="dc__truncate">{description}</span>
                                        </Tooltip>
                                        <div>
                                            <div className="flexbox dc__align-items-center dc__gap-8">
                                                {isUserUploaded ? (
                                                    getAlphabetIcon(uploadedBy, 'icon-dim-20 m-0-imp')
                                                ) : (
                                                    <ICDevtronApp className="icon-dim-20 fcb-5 dc__no-shrink" />
                                                )}
                                                <Tooltip content={uploadedBy} placement="left">
                                                    <span className="dc__truncate">{uploadedBy}</span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="flex dc__gap-4">
                                            {DeploymentChartActionButton && (
                                                <DeploymentChartActionButton name={chartData.name} />
                                            )}
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
