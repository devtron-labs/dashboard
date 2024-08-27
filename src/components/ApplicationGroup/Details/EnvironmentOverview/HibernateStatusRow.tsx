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

import React from 'react'
import { HibernateResponseRowType, HibernateStatusRowType } from '../../AppGroup.types'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import { ReactComponent as Skipped } from '../../../../assets/icons/ic-info-filled.svg'
import { ACTION_STATE, DEPLOYMENT_WINDOW_TYPE } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../../common'

const ExcludedUsersDescription = importComponentFromFELibrary('ExcludedUsersDescription')

export const HibernateStatusRow = ({
    rowData,
    index,
    isVirtualEnv,
    isHibernateOperation,
    hibernateInfoMap,
}: HibernateStatusRowType) => {
    const renderStatusIcon = (): JSX.Element => {
        if (rowData.success) {
            return <Success className="mr-8 icon-dim-18" />
        }
        if (rowData.authError) {
            return <UnAuthorized className="mr-8 icon-dim-18 fcy-7" />
        }
        if (rowData.skipped) {
            return <Skipped className="mr-8 icon-dim-18" />
        }
        return <Error className="mr-8 icon-dim-18" />
    }

    const getStatus = () => {
        if (rowData.success) {
            return isHibernateOperation ? 'Hibernation Initiated' : 'Unhibernation Initiated'
        }
        if (rowData.authError) {
            return 'Not authorized'
        }
        if (rowData.skipped) {
            return 'Skipped'
        }
        return 'Failed'
    }

    const getMessage = () => {
        if (
            hibernateInfoMap[rowData.id] &&
            hibernateInfoMap[rowData.id].userActionState &&
            hibernateInfoMap[rowData.id].userActionState !== ACTION_STATE.ALLOWED
        ) {
            return (
                <div>
                    {hibernateInfoMap[rowData.id].userActionState === ACTION_STATE.BLOCKED && (
                        <div>
                            You are not authorised to deploy&nbsp;
                            {hibernateInfoMap[rowData.id].type === DEPLOYMENT_WINDOW_TYPE.BLACKOUT
                                ? 'during'
                                : 'outside'}
                            &nbsp;
                            {hibernateInfoMap[rowData.id].type.toLowerCase()} window
                        </div>
                    )}
                    <ExcludedUsersDescription excludedUserEmails={hibernateInfoMap[rowData.id].excludedUserEmails} />
                </div>
            )
        }
        if (rowData.authError) {
            return 'You do not have permission to trigger deployment for this application + environment'
        }
        if (rowData.error) {
            return rowData.error
        }
        if (rowData.skipped) {
            return rowData.skipped
        }
        return '-'
    }

    return (
        <div className={`response-row  pt-8 pb-8 ${isVirtualEnv ? 'is-virtual' : ''}`}>
            <div className="fs-13 fw-4 cn-9">{rowData.appName}</div>
            <div className="flex left top fs-13 fw-4 cn-9">
                {renderStatusIcon()}
                <span data-testid={`response-status-text-${index}`}>{getStatus()}</span>
            </div>
            <div className="fs-13 fw-4 cn-9">{getMessage()}</div>
        </div>
    )
}
