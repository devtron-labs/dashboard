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

import { ConfigureWebhook } from '@Components/ciPipeline/ConfigureWebhook'

import { ConfigureWebhookWrapperProps } from './types'

export const ConfigureWebhookWrapper = ({
    webhookConditionList,
    selectedWebhookEvent,
    gitHost,
    ciPipelineEditable,
    setCiCdPipeline,
}: ConfigureWebhookWrapperProps) => {
    // HANDLERS
    const addWebhookCondition = () =>
        setCiCdPipeline((prev) => {
            const ciCdPipeline = structuredClone(prev)
            ciCdPipeline.ci.webhookConditionList.push({ selectorId: 0, value: '' })
            return ciCdPipeline
        })

    const deleteWebhookCondition = (index: number) =>
        setCiCdPipeline((prev) => {
            const ciCdPipeline = structuredClone(prev)
            ciCdPipeline.ci.webhookConditionList.splice(index, 1)
            return ciCdPipeline
        })

    const onWebhookConditionSelectorChange = (index: number, selectorId: number) =>
        setCiCdPipeline((prev) => {
            const ciCdPipeline = structuredClone(prev)
            ciCdPipeline.ci.webhookConditionList[index].selectorId = selectorId
            ciCdPipeline.ci.webhookConditionList[index].value = ''
            return ciCdPipeline
        })

    const onWebhookConditionSelectorValueChange = (index: number, value: string) =>
        setCiCdPipeline((prev) => {
            const ciCdPipeline = structuredClone(prev)
            ciCdPipeline.ci.webhookConditionList[index].value = value
            return ciCdPipeline
        })

    return (
        <div>
            <ConfigureWebhook
                webhookConditionList={webhookConditionList}
                gitHost={gitHost}
                selectedWebhookEvent={selectedWebhookEvent}
                addWebhookCondition={addWebhookCondition}
                deleteWebhookCondition={deleteWebhookCondition}
                onWebhookConditionSelectorChange={onWebhookConditionSelectorChange}
                onWebhookConditionSelectorValueChange={onWebhookConditionSelectorValueChange}
                canEditPipeline={ciPipelineEditable}
            />
        </div>
    )
}
