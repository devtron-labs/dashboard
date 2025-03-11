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

import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerModalRow } from './TriggerModalTableRow'
import { SourceUpdateResponseModalProps } from './types'

const SourceUpdateResponseModal = ({ responseList, isLoading }: SourceUpdateResponseModalProps) => {
    if (isLoading) {
        return <Progressing pageLoader />
    }

    return (
        <div className="response-list-container bg__primary dc__overflow-auto pr-20 pb-16 pl-20">
            <div className="dc__position-sticky dc__top-0 bg__primary dc__border-bottom response-row pt-24 pb-8 dc__uppercase">
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

export default SourceUpdateResponseModal
