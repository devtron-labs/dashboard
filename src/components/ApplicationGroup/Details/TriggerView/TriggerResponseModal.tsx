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
import { Progressing, sortCallback } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as RetryIcon } from '../../../../assets/icons/ic-arrow-clockwise.svg'
import { TriggerResponseModalType } from '../../AppGroup.types'
import { BulkResponseStatus } from '../../Constants'
import { TriggerModalRow } from './TriggerModalTableRow'

export default function TriggerResponseModal({
    closePopup,
    responseList,
    isLoading,
    onClickRetryBuild,
    isVirtualEnv,
    envName,
}: TriggerResponseModalType) {
    const isShowRetryButton = responseList?.some((response) => response.status === BulkResponseStatus.FAIL)

    const renderResponseBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="response-list-container bg__primary dc__height-inherit dc__overflow-auto pr-20 pb-16 pl-20">
                <div
                    className="dc__position-sticky dc__top-0 bg__primary dc__border-bottom response-row dc__border-bottom pt-24 pb-8"
                    style={{ zIndex: 1 }}
                >
                    <div className="fs-12 fw-6 cn-7">Application</div>
                    <div className="fs-12 fw-6 cn-7">Trigger status</div>
                    <div className="fs-12 fw-6 cn-7">Message</div>
                </div>
                {responseList
                    .sort((a, b) => sortCallback('appName', a, b))
                    .map((response, index) => (
                        <TriggerModalRow
                            key={response.appId}
                            rowData={response}
                            index={index}
                            isVirtualEnv={isVirtualEnv}
                            envName={envName}
                        />
                    ))}
            </div>
        )
    }

    const handleRetryBuild = (e: React.MouseEvent): void => {
        e.stopPropagation()
        const appsToRetry: Record<string, boolean> = {}
        for (const response of responseList) {
            if (response.status === BulkResponseStatus.FAIL) {
                appsToRetry[response.appId] = true
            }
        }
        onClickRetryBuild(appsToRetry)
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div
                className={`dc__border-top flex bg__primary pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 env-modal-width ${
                    isShowRetryButton ? 'dc__content-space' : 'right'
                }`}
            >
                <button className="cta cancel flex h-36" data-testid="close-popup" onClick={closePopup}>
                    Close
                </button>
                {isShowRetryButton && (
                    <button className="cta flex h-36" onClick={handleRetryBuild}>
                        {isLoading ? (
                            <Progressing />
                        ) : (
                            <>
                                <RetryIcon className="icon-dim-16 dc__no-svg-fill scn-0 mr-8" />
                                Retry Failed
                            </>
                        )}
                    </button>
                )}
            </div>
        )
    }

    return (
        <>
            {renderResponseBodySection()}
            {renderFooterSection()}
        </>
    )
}
