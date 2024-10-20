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
    ACTION_STATE,
    DEPLOYMENT_WINDOW_TYPE,
    GenericEmptyState,
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { BulkRotatePodsMap, ResourcesMetaDataMap, RestartStatusListDrawerProps } from '../../AppGroup.types'
import { ReactComponent as ArrowRight } from '../../../../assets/icons/ic-expand.svg'
import { ReactComponent as Failed } from '../../../../assets/icons/ic-error.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { APP_DETAILS_TEXT, DATA_TEST_IDS, RESTART_STATUS_TEXT } from './constants'
import { ReactComponent as MechanicalIcon } from '../../../../assets/img/ic-mechanical-operation.svg'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'

import './envOverview.scss'
import { AllExpandableDropdown } from './AllExpandableDropdown'
import { importComponentFromFELibrary } from '../../../common'

const ExcludedUsersDescription = importComponentFromFELibrary('ExcludedUsersDescription')
export const RestartStatusListDrawer = ({
    bulkRotatePodsMap,
    statusModalLoading,
    envName,
    hibernateInfoMap,
}: RestartStatusListDrawerProps) => {
    const [expandedAppIds, setExpandedAppIds] = useState<number[]>([])
    const [isExpandableButtonClicked, setExpandableButtonClicked] = useState(false)
    const hasPartialDeploymentWindowAccess = (appId) =>
        hibernateInfoMap[appId] &&
        hibernateInfoMap[appId].userActionState &&
        hibernateInfoMap[appId].userActionState === ACTION_STATE.PARTIAL

    const toggleWorkloadCollapse = (appId: number) => {
        if (expandedAppIds.includes(appId)) {
            setExpandedAppIds(expandedAppIds.filter((id) => id !== appId))
        } else {
            setExpandedAppIds([...expandedAppIds, appId])
        }
    }

    const getDeploymentMessage = (appId) => {
        if (
            hibernateInfoMap[appId] &&
            hibernateInfoMap[appId].userActionState &&
            hibernateInfoMap[appId].userActionState !== ACTION_STATE.ALLOWED
        ) {
            return (
                <div>
                    {hibernateInfoMap[appId].userActionState === ACTION_STATE.BLOCKED && (
                        <div>
                            You are not authorised to restart workload&nbsp;
                            {hibernateInfoMap[appId].type === DEPLOYMENT_WINDOW_TYPE.BLACKOUT ? 'during' : 'outside'}
                            &nbsp;
                            {hibernateInfoMap[appId].type.toLowerCase()} window
                        </div>
                    )}
                    <ExcludedUsersDescription
                        excludedUserEmails={hibernateInfoMap[appId].excludedUserEmails}
                        rootClassName="dc__ellipsis-right pr-16"
                    />
                </div>
            )
        }
        return null
    }

    const _userIsBlocked = (appId): boolean => {
        if (getDeploymentMessage(appId) && !hasPartialDeploymentWindowAccess(appId)) {
            return true
        }
        return false
    }

    const getStatusIcon = (errorResponse: string, appId: number) => {
        if (errorResponse || _userIsBlocked(appId)) {
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
                {Object.keys(resources).map((kindName) => (
                    <div
                        key={kindName}
                        data-testid="bulk-workload-status-details__row"
                        className="pl-16 pr-16 pt-8 pb-8 bulk-workload-status-details__row dc__gap-8 dc__hover-n50 dc__align-start"
                    >
                        <div />
                        <div className="dc__hover-n50">
                            <span className="fw-6">{kindName.split('/')[0]}&nbsp;/&nbsp;</span>
                            {kindName.split('/')[1]}
                        </div>
                        <div className="dc__gap-6 flex left">
                            {getStatusIcon(resources[kindName].errorResponse, appId)}
                            {_userIsBlocked(appId) ? (
                                `Restart ${RESTART_STATUS_TEXT.FAILED}`
                            ) : (
                                <>
                                    Restart&nbsp;
                                    {resources[kindName].errorResponse
                                        ? RESTART_STATUS_TEXT.FAILED
                                        : RESTART_STATUS_TEXT.INITIATED}
                                </>
                            )}
                        </div>

                        <div>{getDeploymentMessage(appId) || resources[kindName].errorResponse}</div>
                    </div>
                ))}
            </div>
        )
    }

    const renderWorkloadStatusItems = () => {
        const renderStatusIcon = (status: RESTART_STATUS_TEXT) => {
            if (status === RESTART_STATUS_TEXT.FAILED) {
                return <Failed className="icon-dim-16" />
            }
            return <Success className="icon-dim-16" />
        }

        const renderCount = (statusCount: number, status: RESTART_STATUS_TEXT, _appId: string) => {
            if (statusCount > 0) {
                return (
                    <div className="flex dc__gap-6">
                        {renderStatusIcon(status)}
                        {statusCount}
                        <span className="dc__capitalize">{status}</span>
                        {status === RESTART_STATUS_TEXT.FAILED && bulkRotatePodsMap[_appId].successCount > 0 && ` • `}
                    </div>
                )
            }
            return null
        }

        return (
            <div className="drawer-body-section__status-drawer dc__overflow-auto">
                {Object.keys(bulkRotatePodsMap as BulkRotatePodsMap)
                    .filter((_appId) => bulkRotatePodsMap[_appId].isChecked)
                    .map((_appId: string) => (
                        <div key={_appId} className="dc__border-bottom-n1">
                            <div
                                className="dc__zi-1 bulk-workload-status-details__row pt-8 pb-8 pl-16 pr-16 dc__hover-n50 dc__gap-8 cursor"
                                onClick={() => toggleWorkloadCollapse(+_appId)}
                            >
                                <ArrowRight
                                    className="icon-dim-20 rotate fcn-9 flex"
                                    style={{
                                        ['--rotateBy' as string]: `${(expandedAppIds.includes(+_appId) ? 1 : 0) * 90}deg`,
                                    }}
                                />
                                <div>{bulkRotatePodsMap[_appId].appName}</div>
                                <div className="flex left dc__gap-6">
                                    {getDeploymentMessage(+_appId) && !hasPartialDeploymentWindowAccess(+_appId) ? (
                                        <>
                                            <Failed className="icon-dim-16" />
                                            {Object.keys(bulkRotatePodsMap[_appId].resources).length} Failed
                                        </>
                                    ) : (
                                        <>
                                            {renderCount(
                                                bulkRotatePodsMap[_appId].failedCount,
                                                RESTART_STATUS_TEXT.FAILED,
                                                _appId,
                                            )}
                                            {renderCount(
                                                bulkRotatePodsMap[_appId].successCount,
                                                RESTART_STATUS_TEXT.INITIATED,
                                                _appId,
                                            )}
                                        </>
                                    )}
                                </div>
                                <div />
                            </div>
                            {renderWorkloadStatusDetails(
                                +_appId,
                                bulkRotatePodsMap[_appId].appName,
                                bulkRotatePodsMap[_appId].resources,
                            )}
                        </div>
                    ))}
            </div>
        )
    }

    const renderWorkloadStatusTableHeader = () => (
        <div className="dc__zi-1 bulk-workload-status-details__row pt-8 pb-8 fs-12 fw-6 cn-7 dc__border-bottom-n1 w-100 pl-16 pr-16 pt-8 p-8 dc__gap-8 lh-18">
            <AllExpandableDropdown
                expandedAppIds={expandedAppIds}
                setExpandedAppIds={setExpandedAppIds}
                bulkRotatePodsMap={bulkRotatePodsMap}
                SvgImage={ArrowRight}
                iconClassName={`icon-dim-20 ${isExpandableButtonClicked ? 'dc__flip-90' : ''}`}
                isExpandableButtonClicked={isExpandableButtonClicked}
                setExpandableButtonClicked={setExpandableButtonClicked}
            />
            <div>{APP_DETAILS_TEXT.APPLICATIONS}</div>
            <div>{APP_DETAILS_TEXT.RESTART_STATUS}</div>
            <div />
        </div>
    )

    if (statusModalLoading) {
        return (
            <div className="drawer-section__empty flex">
                <GenericEmptyState
                    title={`Restarting selected workload on ${envName}`}
                    subTitle={APP_DETAILS_TEXT.APP_GROUP_RESTART_WORKLOAD_SUBTITLE}
                    SvgImage={MechanicalIcon}
                >
                    <InfoColourBar
                        message={APP_DETAILS_TEXT.APP_GROUP_EMPTY_WORKLOAD_INFO_BAR}
                        classname="warn cn-9 lh-2 w-100"
                        Icon={Warn}
                        iconClass="warning-icon h-100-imp"
                        iconSize={24}
                    />
                </GenericEmptyState>
            </div>
        )
    }

    return (
        <div className="bulk-restart-workload-wrapper" data-testid={DATA_TEST_IDS.WORKLOAD_RESTART_MODAL}>
            {renderWorkloadStatusTableHeader()}
            {renderWorkloadStatusItems()}
        </div>
    )
}
