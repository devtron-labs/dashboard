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

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Progressing,
    sortCallback,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as RetryIcon } from '../../../../assets/icons/ic-arrow-clockwise.svg'
import { TriggerResponseModalBodyProps, TriggerResponseModalFooterProps } from '../../AppGroup.types'
import { BulkResponseStatus } from '../../Constants'
import { TriggerModalRow } from './TriggerModalTableRow'

export const TriggerResponseModalFooter = ({
    closePopup,
    isLoading,
    responseList,
    skipHibernatedApps,
    onClickRetryBuild,
    onClickRetryDeploy,
}: TriggerResponseModalFooterProps) => {
    const isShowRetryButton = responseList?.some((response) => response.status === BulkResponseStatus.FAIL)

    const handleRetryBuild = (e: React.MouseEvent): void => {
        e.stopPropagation()
        const appsToRetry: Record<string, boolean> = {}
        responseList.forEach((response) => {
            if (response.status === BulkResponseStatus.FAIL) {
                appsToRetry[response.appId] = true
            }
        })

        if (onClickRetryBuild) {
            onClickRetryBuild(appsToRetry)
        } else {
            onClickRetryDeploy(skipHibernatedApps, appsToRetry)
        }
    }

    return (
        <div className={`dc__border-top flex px-20 py-16 ${isShowRetryButton ? 'dc__content-space' : 'right'}`}>
            <Button
                dataTestId="close-popup"
                text="Close"
                onClick={closePopup}
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
            />
            {isShowRetryButton && (
                <Button
                    dataTestId="bulk-ci-cd-retry-failed"
                    text="Retry failed"
                    startIcon={<RetryIcon />}
                    isLoading={isLoading}
                    onClick={handleRetryBuild}
                />
            )}
        </div>
    )
}

const TriggerResponseModalBody = ({ responseList, isLoading, isVirtualEnv }: TriggerResponseModalBodyProps) => {
    if (isLoading) {
        return <Progressing pageLoader />
    }
    return (
        <div className="response-list-container bg__primary pr-20 pb-16 pl-20">
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
                    />
                ))}
        </div>
    )
}

export default TriggerResponseModalBody
