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
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerModalRow } from './TriggerModalTableRow'
import { SourceUpdateResponseModalProps } from './types'

export default function SourceUpdateResponseModal({
    closePopup,
    responseList,
    isLoading,
}: SourceUpdateResponseModalProps) {
    const renderResponseBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="response-list-container bcn-0 dc__height-inherit dc__overflow-auto pr-20 pb-16 pl-20">
                <div
                    className="dc__position-sticky dc__top-0 bcn-0 dc__border-bottom response-row dc__border-bottom pt-24 pb-8 dc__uppercase"
                    style={{ zIndex: 1 }}
                >
                    <div className="fs-12 fw-6 cn-7 ">Application</div>
                    <div className="fs-12 fw-6 cn-7 ">Branch Change status</div>
                    <div className="fs-12 fw-6 cn-7 ">Message</div>
                </div>
                {responseList.map((response, index) => (
                    <TriggerModalRow key={response.appId} rowData={response} index={index} />
                ))}
            </div>
        )
    }

    // ASK: Why there is no retry button for failed request?
    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="dc__border-top flex bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 env-modal-width right">
                <button className="cta cancel flex h-36" data-testid="close-popup" onClick={closePopup}>
                    Close
                </button>
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
