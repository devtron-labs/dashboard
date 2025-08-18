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
import moment from 'moment'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    CodeEditor,
    ComponentSizeType,
    ErrorScreenManager,
    GenericEmptyState,
    getFormattedSchema,
    Icon,
    MODES,
    Progressing,
    showError,
    sortCallback,
    Tooltip,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'

import { Moment12HourFormat } from '../../../../config'
import { getCIPipelineURL } from '../../../common'
import { getCIWebhookPayload, getCIWebhookRes } from './ciWebhook.service'
import {
    CiWebhookModalProps,
    CIWebhookPayload,
    WebhookPayload,
    WebhookPayloadType,
    WebhookReceivedFiltersType,
} from './types'

import './TriggerWebhook.scss'

export const CiWebhookModal = ({
    ciPipelineMaterialId,
    gitMaterialUrl,
    ciPipelineId,
    workflowId,
    isJobView,
    appId,
    isJobCI,
}: CiWebhookModalProps) => {
    const [isPayloadLoading, setIsPayloadLoading] = useState(false)
    const [webhookIncomingPayload, setWebhookIncomingPayload] = useState<CIWebhookPayload | null>(null)
    const [selectedWebhookPayload, setSelectedWebhookPayload] = useState<WebhookPayload | null>(null)

    const getCIWebhookPayloadRes = async (webhookPayload: WebhookPayload) => {
        setIsPayloadLoading(true)
        setSelectedWebhookPayload(webhookPayload)

        try {
            const { result } = await getCIWebhookPayload(ciPipelineMaterialId, webhookPayload.parsedDataId)
            setWebhookIncomingPayload(result)
        } catch (err) {
            showError(err)
        } finally {
            setIsPayloadLoading(false)
        }
    }
    const getCIWebhookDetails = async () => {
        const { result } = await getCIWebhookRes(ciPipelineMaterialId)
        if (result?.payloads?.length) {
            await getCIWebhookPayloadRes(result.payloads[0])
        }
        return result
    }

    const [isWebhookPayloadLoading, webhookPayloads, webhookPayloadsError, reloadWebhookPayloads] =
        useAsync<WebhookPayloadType>(getCIWebhookDetails, [ciPipelineMaterialId], !!ciPipelineMaterialId)

    const renderSelectedPassedCountRatio = (matchedFiltersCount: number, failedFiltersCount: number): string => {
        const totalFilters = matchedFiltersCount + failedFiltersCount
        return `${matchedFiltersCount}/${totalFilters}`
    }

    const renderPassedText = (passedCount: string) => (
        <div className="flex left lh-18">Passed {passedCount} filters</div>
    )

    const renderWebhookPayloadLoader = () => (
        <div className="flex column flex-grow-1 dc__gap-16">
            {/* NOTE: Wrapped Loader in a div to prevent the 'loader' class from enforcing full height */}
            <div>
                <Progressing pageLoader />
            </div>
            <p className="flexbox-col dc__gap-4 fs-16 cn-7 lh-20">
                <span>Fetching webhook payloads.</span>
                <span>This might take some time.</span>
            </p>
        </div>
    )

    const getOnWebhookPayloadClick = (webhookPayload: WebhookPayload) => async () => {
        await getCIWebhookPayloadRes(webhookPayload)
    }

    const renderSidebar = () => (
        <div className="flexbox-col dc__border-right-n2 dc__overflow-hidden dc__border-right-n1">
            <span className="py-14 fw-6 lh-20 px-16">Received webhooks</span>
            <div className="p-8 flexbox-col flex-grow-1 dc__overflow-auto">
                {webhookPayloads?.payloads?.map((webhookPayload: WebhookPayload) => {
                    const isPassed = webhookPayload.matchedFiltersCount > 0 && webhookPayload.failedFiltersCount === 0
                    const webhookPayloadId = webhookPayload.parsedDataId
                    const isActive = selectedWebhookPayload?.parsedDataId === webhookPayloadId

                    return (
                        <button
                            key={webhookPayloadId}
                            data-testid={`payload-id-${webhookPayloadId}-anchor`}
                            className={`dc__transparent cn-5 p-8 dc__hover-n50 ${isActive ? 'bcb-1 br-4' : ''}`}
                            onClick={getOnWebhookPayloadClick(webhookPayload)}
                            type="button"
                        >
                            <div className="flex left top dc__gap-8">
                                <Icon name={isPassed ? 'ic-success' : 'ic-error'} size={20} color={null} />
                                <div>
                                    <span className={`lh-20 ${isActive ? 'cb-5 fw-6' : 'cn-9'}`}>
                                        {moment(webhookPayload.eventTime).format(Moment12HourFormat)}
                                    </span>
                                    <div className="cn-7 fs-12">
                                        {renderPassedText(
                                            renderSelectedPassedCountRatio(
                                                webhookPayload.matchedFiltersCount,
                                                webhookPayload.failedFiltersCount,
                                            ),
                                        )}
                                    </div>
                                </div>
                                <br />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )

    const webhookRepoName = (webhookPayloads?.repositoryUrl ?? gitMaterialUrl)?.replace('.git', '').split('/').pop()

    const renderIncomingPayloadTitle = () => (
        <div className="fw-6 fs-14 flex left dc__content-space w-100">
            <div className="flex left fs-14 fw-6">
                <div className="flex left">
                    {renderPassedText(
                        renderSelectedPassedCountRatio(
                            selectedWebhookPayload.matchedFiltersCount,
                            selectedWebhookPayload.failedFiltersCount,
                        ),
                    )}
                    . Webhook received from&nbsp;
                </div>

                <a href={webhookPayloads?.repositoryUrl} rel="noreferrer noopener" target="_blank" className="dc__link">
                    /{webhookRepoName}
                </a>
            </div>
            {/* Here the CI model requires the CiPipelineId not the CiPipelineMaterialId */}
            <Button
                ariaLabel="Edit filters"
                icon={<Edit />}
                variant={ButtonVariantType.borderLess}
                style={ButtonStyleType.neutral}
                dataTestId="show-approvers-info-button"
                size={ComponentSizeType.xs}
                component={ButtonComponentType.anchor}
                anchorProps={{
                    href: `${window.__BASE_URL__}${getCIPipelineURL(appId, String(workflowId), true, ciPipelineId, isJobView, isJobCI, false)}`,
                }}
            />
        </div>
    )

    const getWebhookIncomingPayload = () =>
        structuredClone(webhookIncomingPayload?.selectorsData)?.sort((a, b) => sortCallback('selectorName', a, b)) || []

    const renderFilterTableContent = () => (
        <div className="w-100">
            <div className="cn-7 fw-6 dc__border-bottom ci__filter-table__row dc__uppercase py-8 fs-12 dc__gap-12">
                <div className="lh-20">Selector/Key</div>
                <div className="lh-20">Selector value in payload</div>
                <div className="lh-20">Configured filter</div>
                <div className="lh-20">Result</div>
            </div>

            {getWebhookIncomingPayload().map((selectedData: WebhookReceivedFiltersType) => (
                <div key={`${selectedData.selectorName}`} className="ci__filter-table__row py-10 lh-20 dc__gap-12">
                    <Tooltip content={selectedData.selectorName}>
                        <span className="dc__truncate dc__word-break">{selectedData.selectorName}</span>
                    </Tooltip>
                    <Tooltip content={selectedData.selectorValue}>
                        <span className="dc__truncate dc__word-break">{selectedData.selectorValue}</span>
                    </Tooltip>
                    <Tooltip content={selectedData.selectorCondition}>
                        <span className="dc__truncate dc__word-break">{selectedData.selectorCondition}</span>
                    </Tooltip>
                    <div className={selectedData.match === false ? `cr-5` : `cg-5`}>
                        {selectedData.match === false ? 'Failed' : 'Passed'}
                    </div>
                </div>
            ))}
        </div>
    )

    const renderFilterTable = () => (
        <div className=" flex column dc__gap-16 w-100">
            {renderIncomingPayloadTitle()}
            {renderFilterTableContent()}
        </div>
    )

    const _value = webhookIncomingPayload?.payloadJson ? getFormattedSchema(webhookIncomingPayload.payloadJson) : ''

    const renderReceivedPayloadCodeEditor = () => (
        <CodeEditor.Container flexExpand>
            <CodeEditor readOnly mode={MODES.YAML} value={_value} height="fitToParent">
                <CodeEditor.Header className="px-16 py-10 flex dc__content-space bg__secondary">
                    <p className="m-0 fw-6">Payload</p>
                    <CodeEditor.Clipboard />
                </CodeEditor.Header>
            </CodeEditor>
        </CodeEditor.Container>
    )

    const renderTimeStampDetailedDescription = () => (
        <div className="bg__primary mw-none flexbox-col dc__gap-16 px-20 py-16">
            {renderFilterTable()}
            {renderReceivedPayloadCodeEditor()}
        </div>
    )

    const renderWebhookPayloadContent = () =>
        isPayloadLoading ? (
            <div className="flex payload-wrapper-no-header">{renderWebhookPayloadLoader()}</div>
        ) : (
            renderTimeStampDetailedDescription()
        )

    const renderNoWebhook = () => (
        <div className="flex column w-100">
            <span className="fs-16">No webhook received from</span>
            <a
                href={webhookPayloads?.repositoryUrl}
                rel="noreferrer noopener"
                target="_blank"
                className="dc__link dc__word-break w-100"
            >
                /{webhookRepoName}
            </a>
        </div>
    )

    if (isWebhookPayloadLoading) {
        return (
            <div className="flex h-100">
                <Progressing pageLoader />
            </div>
        )
    }

    if (webhookPayloadsError) {
        return <ErrorScreenManager code={webhookPayloadsError?.code} reload={reloadWebhookPayloads} />
    }

    if (!webhookPayloads?.payloads?.length) {
        return (
            <GenericEmptyState
                title={renderNoWebhook()}
                subTitle="All webhook payloads received from the repository will be available here"
                classname="h-100"
            />
        )
    }

    return (
        <div className="ci-trigger__webhook-wrapper fs-13 cn-9 h-100 dc__overflow-hidden">
            {renderSidebar()}
            {renderWebhookPayloadContent()}
        </div>
    )
}
