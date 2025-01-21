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

import { useState } from 'react'
import {
    GenericEmptyState,
    InfoColourBar,
    APIResponseHandler,
    useAsync,
    Tooltip,
    EMPTY_STATE_STATUS,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '@Config/constants'
import emptyCustomChart from '@Images/ic-empty-custom-charts.png'
import { ReactComponent as DevtronIcon } from '@Icons/ic-devtron-app.svg'
import { ReactComponent as HelpIcon } from '@Icons/ic-help.svg'
import { importComponentFromFELibrary } from '@Components/common'
import UploadChartModal from './UploadChartModal'
import { getChartList } from './service'
import DeploymentChartsListHeader from './DeploymentChartsListHeader'
import UploadButton from './UploadButton'
import DownloadChartButton from './DownloadChartButton'
import './styles.scss'

const EditDeploymentChart = importComponentFromFELibrary('EditDeploymentChart', null, 'function')

const DeploymentChartsList = () => {
    const [showUploadPopup, setShowUploadPopup] = useState(false)
    const [chartListLoading, chartList, chartListError, reloadChartList] = useAsync(getChartList)

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
            <div
                className="chart-list flexbox-col dc__gap-20 dc__overflow-hidden h-100"
                data-testid="custom-charts-list"
            >
                <DeploymentChartsListHeader handleOpenUploadChartModal={handleOpenUploadChartModal} />
                <div
                    data-testid="custom-chart-list"
                    className="en-2 bw-1 bg__primary br-8 h-100 dc__overflow-hidden flexbox-col"
                >
                    <InfoColourBar
                        message={
                            <>
                                <span className="fs-13 fw-6 lh-20">How to use?</span>
                                <span className="fs-13 fw-4 lh-20 ml-4 mr-4">
                                    Uploaded charts can be used in Deployment template to deploy custom applications
                                    created in Devtron.
                                </span>
                                <a
                                    href={DOCUMENTATION.CUSTOM_CHART}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="dc__link dc__no-decor pointer"
                                >
                                    Learn more
                                </a>
                            </>
                        }
                        classname="dc__content-start bcv-1 w-100 custom-chart-info-bar dc__border-bottom-v2 pt-6 pb-6 pl-16 pr-16"
                        Icon={HelpIcon}
                        iconClass="fcv-5 icon-dim-20"
                    />
                    <div className="chart-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-10 pb-10 pr-20 pl-20 dc__uppercase dc__no-shrink">
                        <span>Name</span>
                        <span>Version</span>
                        <span>Description</span>
                    </div>
                    <div className="h-100 dc__overflow-auto">
                        {chartList.map((chartData) => (
                            <div
                                key={`custom-chart_${chartData.name}`}
                                className="chart-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20"
                            >
                                <div className="flexbox dc__gap-8 dc__align-items-center">
                                    <span className="cn-9 dc__ellipsis-right">{chartData.name}</span>
                                    {!chartData.isUserUploaded && (
                                        <div className="flex bcb-1 br-6 py-2 px-6">
                                            <DevtronIcon className="icon-dim-20" />
                                            <span className="ml-4 fs-12 fw-6 cn-7 lh-20 devtron-tag">by Devtron</span>
                                        </div>
                                    )}
                                </div>
                                <span>
                                    {chartData.versions[0].version}
                                    <span className="cn-5 ml-8">
                                        {chartData.versions.length && `+${chartData.versions.length} more`}
                                    </span>
                                </span>
                                <Tooltip content={chartData.versions[0].description} placement="left">
                                    <span className="dc__ellipsis-right">{chartData.versions[0].description}</span>
                                </Tooltip>
                                <div className="flexbox dc__gap-4">
                                    {EditDeploymentChart && <EditDeploymentChart name={chartData.name} />}
                                    <DownloadChartButton name={chartData.name} versions={chartData.versions} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
