import React, { useState } from 'react'
import { GenericEmptyState, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { BulkRotatePodsMap, ResourcesMetaDataMap, RestartStatusListDrawerProps } from '../../AppGroup.types'
import { ReactComponent as ArrowRight } from '../../../../assets/icons/ic-play-filled.svg'
import { ReactComponent as Failed } from '../../../../assets/icons/ic-error.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { APP_DETAILS_TEXT, DATA_TEST_IDS, RESTART_STATUS_TEXT } from './constants'
import { ReactComponent as MechanicalIcon } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'

import './envOverview.scss'

export const RestartStatusListDrawer = ({
    bulkRotatePodsMap,
    statusModalLoading,
    envName,
}: RestartStatusListDrawerProps) => {
    const [expandedAppIds, setExpandedAppIds] = useState<number[]>([])

    const toggleWorkloadCollapse = (appId?: number) => {
        if (expandedAppIds.includes(appId)) {
            setExpandedAppIds(expandedAppIds.filter((id) => id !== appId))
        } else {
            setExpandedAppIds([...expandedAppIds, appId])
        }
    }

    const getStatusIcon = (errorResponse: string) => {
        if (errorResponse) {
            return <Failed className="icon-dim-16" />
        }
        return <Success className="icon-dim-16" />
    }

    const renderWorkloadStatusDetails = (appId: number, appName: string, resources: ResourcesMetaDataMap) => {
        if (!expandedAppIds.includes(appId) || appName !== bulkRotatePodsMap[appId].appName) {
            return null
        }
        return (
            <div>
                {Object.keys(resources).map((kindName) => {
                    return (
                        <div
                            key={kindName}
                            data-testid="bulk-workload-status-details__row"
                            className="bulk-workload-status-details__row cursor dc__gap-16"
                        >
                            <div />
                            <div className="app-group-kind-name-row pt-8 pb-8">
                                <span className="fw-6">{kindName.split('/')[0]}&nbsp;/&nbsp;</span>
                                {kindName.split('/')[1]}
                            </div>
                            <div className="dc__gap-6 flex left">
                                {getStatusIcon(resources[kindName].errorResponse)}
                                Restart
                                {resources[kindName].errorResponse
                                    ? ` ${RESTART_STATUS_TEXT.FAILED}`
                                    : ` ${RESTART_STATUS_TEXT.INITIATED}`}
                            </div>
                            <div>{resources[kindName].errorResponse}</div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderWorkloadStatusItems = () => {
        return Object.keys(bulkRotatePodsMap as BulkRotatePodsMap).map((_appId) => {
            return (
                <div key={_appId} className="dc__border-bottom-n1">
                    <div
                        className="dc__zi-1 bulk-workload-status-details__row pt-8 pb-8 fs-12 cn-7 pl-16 pr-16 cursor flex left"
                        onClick={() => toggleWorkloadCollapse(+_appId)}
                    >
                        <ArrowRight
                            className="icon-dim-12 rotate rotate fcn-9 flex"
                            style={{
                                ['--rotateBy' as string]: `${(expandedAppIds.includes(+_appId) ? 1 : 0) * 90}deg`,
                            }}
                        />
                        <div className="fw-6">{bulkRotatePodsMap[_appId].appName}</div>
                        <div className="flex left dc__gap-6">
                            <Failed className="icon-dim-16" />
                            {bulkRotatePodsMap[_appId].failedCount}
                            <span className="dc__capitalize">{RESTART_STATUS_TEXT.FAILED}</span> &nbsp;•&nbsp;
                            <Success className="icon-dim-16" />
                            {bulkRotatePodsMap[_appId].successCount}
                            <span className="dc__capitalize">{RESTART_STATUS_TEXT.INITIATED}</span>
                        </div>
                        <div />
                    </div>
                    {renderWorkloadStatusDetails(
                        +_appId,
                        bulkRotatePodsMap[_appId].appName,
                        bulkRotatePodsMap[_appId].resources,
                    )}
                </div>
            )
        })
    }
    const renderWorkloadStatusTableHeader = () => (
        <div className="dc__zi-1 bulk-workload-status-details__row pt-8 pb-8 fs-12 fw-6 cn-7 dc__border-bottom-n1 w-100 pl-16 pr-16 pt-8 p-8">
            <div />
            <div>{APP_DETAILS_TEXT.APPLICATIONS}</div>
            <div>{APP_DETAILS_TEXT.RESTART_STATUS}</div>
            <div />
        </div>
    )

    if (statusModalLoading) {
        return (
            <div className="dc__align-reload-center">
                <GenericEmptyState
                    title={`Restarting selected workload on ${envName}`}
                    subTitle={APP_DETAILS_TEXT.APP_GROUP_RESTART_WORKLOAD_SUBTITLE}
                    SvgImage={MechanicalIcon}
                >
                    <InfoColourBar
                        message={APP_DETAILS_TEXT.APP_GROUP_EMPTY_WORKLOAD_INFO_BAR}
                        classname="warn cn-9 lh-2 w-100"
                        Icon={Warn}
                        iconClass="warning-icon"
                        iconSize={24}
                    />
                </GenericEmptyState>
            </div>
        )
    }

    return (
        <div
            className="bulk-restart-workload-wrapper h-100 pb-140 dc__overflow-auto"
            data-testid={DATA_TEST_IDS.WORKLOAD_RESTART_MODAL}
        >
            {renderWorkloadStatusTableHeader()}
            {renderWorkloadStatusItems()}
        </div>
    )
}
