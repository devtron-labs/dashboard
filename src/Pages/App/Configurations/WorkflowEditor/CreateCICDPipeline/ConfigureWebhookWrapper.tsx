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
