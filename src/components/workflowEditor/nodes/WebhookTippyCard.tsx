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
import { Link } from 'react-router-dom'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { WebhookTippyType } from '../types'

export default function WebhookTippyCard({ link, hideTippy }: WebhookTippyType) {
    return (
        <div className="webhook-tippy-card-container w-300 br-8">
            <div className="arrow-down" />
            <div className={`webhook-tippy-card cn-0 p-20 br-8 fs-13 `}>
                <div className="flexbox dc__content-space mb-12">
                    <Webhook className="icon-dim-32 webhook-icon-white" />
                    <Close className="icon-dim-24 fcn-0 cursor" onClick={hideTippy} />
                </div>
                <div className="flex column left fw-6">Click to get webhook details</div>
                <div>Get webhook url and sample JSON to be used in external CI service.</div>
                <div className="mt-12 lh-18">
                    <Link onClick={hideTippy} to={link} className="dc__no-decor">
                        <div className="bg__primary bw-0 cn-9 fw-6 br-4 mr-12 pt-4 pb-4 pl-8 pr-8 pl-8 pr-8 dc__inline-block ">
                            Show webhook details
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
