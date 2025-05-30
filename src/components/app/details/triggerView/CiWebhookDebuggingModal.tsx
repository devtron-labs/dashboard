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

import { useCallback, useEffect, useState } from 'react'
import { NavLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CodeEditor,
    ComponentSizeType,
    getFormattedSchema,
    getUrlWithSearchParams,
    Icon,
    MODES,
    Progressing,
    showError,
    sortCallback,
    Tooltip,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'

import { Moment12HourFormat, URLS } from '../../../../config'
import { getCIPipelineURL } from '../../../common'
import { getCIWebhookPayload } from './ciWebhook.service'
import { CiWebhookModalProps, CIWebhookPayload, WebhookPayload, WebhookReceivedFiltersType } from './types'

import './triggerView.scss'

export const CiWebhookModal = ({
    webhookPayloads,
    ciPipelineMaterialId,
    ciPipelineId,
    isWebhookPayloadLoading,
    workflowId,
    fromAppGrouping,
    isJobView,
    appId,
}: CiWebhookModalProps) => {
    const [isPayloadLoading, setIsPayloadLoading] = useState(false)
    const [webhookIncomingPayload, setWebhookIncomingPayload] = useState<CIWebhookPayload | null>(null)
    const [selectedPassedCountRatio, setSelectedPassedCountRatio] = useState<string>('')
    const location = useLocation()
    const history = useHistory()
    const { url } = useRouteMatch()

    const getCIWebhookPayloadRes = async (pipelineMaterialId: number, webhookPayload: WebhookPayload) => {
        setIsPayloadLoading(true)
        const totalFilters = webhookPayload.matchedFiltersCount + webhookPayload.failedFiltersCount
        setSelectedPassedCountRatio(`${webhookPayload.matchedFiltersCount}/${totalFilters}`)
        try {
            const response = await getCIWebhookPayload(pipelineMaterialId, webhookPayload.parsedDataId)
            setWebhookIncomingPayload(response.result)
        } catch (err) {
            showError(err)
        } finally {
            setIsPayloadLoading(false)
        }
    }

    const { queryParams, searchParams } = useSearchString()

    useEffect(() => {
        if (webhookPayloads?.payloads && webhookPayloads.payloads[0]?.parsedDataId) {
            // to redirect to the first payload if the payload id is not present in the URL
            const flatMap = webhookPayloads.payloads.flatMap((payload) => `${payload.parsedDataId}`)
            const payloadIdInSearchParam = searchParams[URLS.WEBHOOK_RECEIVED_PAYLOAD_ID]
            queryParams.set(
                URLS.WEBHOOK_RECEIVED_PAYLOAD_ID,
                payloadIdInSearchParam && flatMap.includes(payloadIdInSearchParam)
                    ? searchParams[URLS.WEBHOOK_RECEIVED_PAYLOAD_ID]
                    : webhookPayloads.payloads[0].parsedDataId.toString(),
            )
            history.replace({ search: queryParams.toString() })
        }
    }, [webhookPayloads])

    useEffect(() => {
        if (ciPipelineMaterialId && webhookPayloads?.payloads?.[0]) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            getCIWebhookPayloadRes(ciPipelineMaterialId, webhookPayloads?.payloads[0])
        }
    }, [ciPipelineMaterialId, webhookPayloads])

    const renderSelectedPassedCountRatio = (matchedFiltersCount: number, failedFiltersCount: number): string => {
        const totalFilters = matchedFiltersCount + failedFiltersCount
        return `${matchedFiltersCount}/${totalFilters}`
    }

    const renderPassedText = useCallback(
        (passedCount: string) => <div className="flex left lh-18">Passed {passedCount} filters</div>,
        [],
    )

    const onEditShowEditableCiModal = (_ciPipelineId: number, _workflowId: string) => {
        if (fromAppGrouping) {
            window.open(
                window.location.href.replace(
                    location.pathname,
                    getCIPipelineURL(appId, _workflowId, true, _ciPipelineId, isJobView, false, false),
                ),
                '_blank',
                'noreferrer',
            )
        } else {
            history.push(`/app/${appId}/edit/workflow/${_workflowId}/ci-pipeline/${_ciPipelineId}`)
        }
    }

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

    const renderSidebar = () => (
        <div className="flexbox-col dc__border-right-n2 dc__overflow-hidden dc__border-right-n1">
            <span className="py-14 fw-6 lh-20 px-16">Received webhooks</span>
            <div className="p-8 flexbox-col flex-grow-1 dc__overflow-auto">
                {webhookPayloads?.payloads?.map((webhookPayload: WebhookPayload) => {
                    const isPassed = webhookPayload.matchedFiltersCount > 0 && webhookPayload.failedFiltersCount === 0
                    const webhookPayloadId = webhookPayload.parsedDataId
                    const isActive = searchParams[URLS.WEBHOOK_RECEIVED_PAYLOAD_ID] === String(webhookPayloadId)
                    return (
                        <div
                            key={webhookPayloadId}
                            className={`cn-5 p-8 dc__hover-n50 ${isActive ? 'bcb-1 br-4' : ''}`}
                        >
                            <NavLink
                                activeClassName="active"
                                key={webhookPayloadId}
                                data-testid={`payload-id-${webhookPayloadId}-anchor`}
                                to={getUrlWithSearchParams(url, {
                                    [URLS.WEBHOOK_RECEIVED_PAYLOAD_ID]: webhookPayloadId,
                                })}
                                className="dc__no-decor"
                                type="button"
                                aria-label="View webhook payload"
                                onClick={() => getCIWebhookPayloadRes(ciPipelineMaterialId, webhookPayload)}
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
                            </NavLink>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const renderIncomingPayloadTitle = () => (
        <div className="fw-6 fs-14 flex left dc__content-space w-100">
            <div className="flex left fs-14 fw-6">
                <div className="flex left">
                    {renderPassedText(selectedPassedCountRatio)}. Webhook received from&nbsp;
                </div>

                <a href={webhookPayloads?.repositoryUrl} rel="noreferrer noopener" target="_blank" className="dc__link">
                    /{webhookPayloads?.repositoryUrl.replace('.git', '').split('/').pop()}
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
                onClick={() => onEditShowEditableCiModal(ciPipelineId, workflowId.toString())}
            />
        </div>
    )

    const getWebhookIncomingPayload = () =>
        webhookIncomingPayload?.selectorsData?.sort((a, b) => sortCallback('selectorName', a, b)) || []

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

    if (isWebhookPayloadLoading) {
        return (
            <div className="flex h-100 ">
                <Progressing pageLoader />
            </div>
        )
    }

    return (
        <div className="ci-trigger__webhook-wrapper fs-13 cn-9 h-100 dc__overflow-hidden">
            {renderSidebar()}
            {renderWebhookPayloadContent()}
        </div>
    )
}
