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

import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { showError, Progressing, sortCallback, stopPropagation, getUrlWithSearchParams } from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { getCIWebhookPayload } from './ciWebhook.service'
import { getCIPipelineURL } from '../../../common'
import { Moment12HourFormat } from '../../../../config'
import { ReactComponent as Back } from '../../../../assets/icons/ic-back.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-edit.svg'
import { ReactComponent as Right } from '../../../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as InfoOutlined } from '../../../../assets/icons/ic-info-outlined.svg'
import './ciWebhookModal.css'

export default function CiWebhookModal({
    context,
    webhookPayloads,
    ciPipelineMaterialId,
    ciPipelineId,
    isWebhookPayloadLoading,
    hideWebhookModal,
    workflowId,
    fromAppGrouping,
    fromBulkCITrigger,
    appId,
    isJobView,
}) {
    const [showDetailedIncomingPayload, setShowDetailedIncomingPayload] = useState(false)
    const [isPayloadLoading, setIsPayloadLoading] = useState(false)
    const [expandIncomingPayload, setExpandedIncomingPayload] = useState(false)
    const [webhookIncomingPayloadRes, setWebhookIncomingPayloadRes] = useState(undefined)
    const [parsedDataId, setParsedDataId] = useState(0)
    const location = useLocation()

    const history = useHistory()
    const onEditShowEditableCiModal = (ciPipelineId, workflowId) => {
        if (fromAppGrouping) {
            window.open(
                window.location.href.replace(
                    location.pathname,
                    getCIPipelineURL(appId, workflowId, true, ciPipelineId, isJobView, false),
                ),
                '_blank',
                'noreferrer',
            )
        } else {
            history.push(`/app/${appId}/edit/workflow/${workflowId}/ci-pipeline/${ciPipelineId}`)
        }
    }

    const getCIWebhookPayloadRes = (e, pipelineMaterialId, parsedDataId) => {
        stopPropagation(e)
        setParsedDataId(parsedDataId)
        setShowDetailedIncomingPayload(true)
        setIsPayloadLoading(true)
        try {
            getCIWebhookPayload(pipelineMaterialId, parsedDataId).then((result) => {
                setWebhookIncomingPayloadRes(result)
                setIsPayloadLoading(false)
            })
        } catch (err) {
            showError(err)
        }
    }

    const onClose = () => {
        return context.closeCIModal(), hideWebhookModal()
    }

    const renderWebhookPayloadLoader = () => {
        return (
            <div className="flex column">
                <div className=" pb-12">
                    <Progressing pageLoader />
                </div>
                <div>
                    Fetching webhook payloads.
                    <br />
                    This might take some time.
                </div>
            </div>
        )
    }

    const renderConfiguredFilters = () => {
        return (
            <div>
                <div className="cn-9 fs-14 pt-20 pb-8 fw-6 flex left">
                    Configured filters
                    <button
                        type="button"
                        className="mr-20 dc__transparent dc__align-right"
                        onClick={() => onEditShowEditableCiModal(ciPipelineId, workflowId)}
                    >
                        <Edit className=" icon-dim-24" />
                    </button>{' '}
                </div>
                <div
                    className="cn-5 fs-12 fw-6 pt-8 pb-8 "
                    style={{ display: 'grid', gridTemplateColumns: '30% 70%', height: '100' }}
                >
                    <div>Selector/Key</div>
                    <div>Configured filter</div>
                </div>
                {Object.keys(webhookPayloads.filters).map((selectorName, index) => {
                    let classes = 'cn-7 pt-8 pl-4 pb-8'
                    if (index % 2 == 0) {
                        classes = 'cn-7 pt-8 pl-4 pb-8 bcn-1'
                    }
                    return (
                        <div
                            key={index}
                            className={classes}
                            style={{ display: 'grid', gridTemplateColumns: '30% 70%', height: '100' }}
                        >
                            <div>{selectorName}</div>
                            <div>{webhookPayloads.filters[selectorName]}</div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderTimeStampWebhookFilters = () => {
        const repoUrl = webhookPayloads?.repositoryUrl.replace('.git', '')
        const tokens = repoUrl.split('/')
        const { length, [length - 1]: repo } = tokens

        return (
            <div className="pt-20 pb-8">
                <div className="fs-14 cn-9 fw-6 mb-8">
                    All incoming webhook payloads for
                    <a
                        href={webhookPayloads?.repositoryUrl}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="dc__link"
                    >
                        {' '}
                        /{repo}
                    </a>
                </div>
                <div>
                    {webhookPayloads?.payloads == null ? (
                        <div className="bcn-1 empty-payload flex column mt-20 mr-20">
                            <InfoOutlined className="fcn-5 " />
                            <div>Payload data not available</div>
                        </div>
                    ) : (
                        <>
                            <div
                                className="cn-5 fw-6 pt-8 pb-8 dc__border-bottom"
                                style={{ display: 'grid', gridTemplateColumns: '40% 20% 20% 20%', height: '100' }}
                            >
                                <div>
                                    Received at{' '}
                                    <button className="dc__transparent filter-icon">
                                        <i className="fa fa-caret-down" />
                                    </button>
                                </div>
                                <div>Filters matched</div>
                                <div>Filters failed</div>
                                <div>Result</div>
                            </div>

                            <div className="dc__overflow-scroll" style={{ height: 'calc(100vh - 330px)' }}>
                                {webhookPayloads?.payloads?.map((payload, index) => (
                                    <div
                                        key={index}
                                        className="cn-5 pt-8 pb-8 fs-13"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '40% 20% 20% 20%',
                                            height: '100',
                                        }}
                                    >
                                        <div
                                            className="cb-5 cursor"
                                            onClick={(e) =>
                                                getCIWebhookPayloadRes(e, ciPipelineMaterialId, payload.parsedDataId)
                                            }
                                        >
                                            {moment(payload.eventTime).format(Moment12HourFormat)}
                                        </div>
                                        <div>{payload.matchedFiltersCount}</div>
                                        <div>{payload.failedFiltersCount}</div>
                                        <div
                                            className={
                                                payload.matchedFilters == false
                                                    ? `dc__deprecated-warn-text fs-13`
                                                    : `cg-5 ml-4 fs-13`
                                            }
                                        >
                                            {payload.matchedFilters == false ? 'Failed' : 'Passed'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    const renderTimeStampDetailedHeader = (context) => {
        return (
            <div className="trigger-modal__header">
                <div className="flex left">
                    <button
                        type="button"
                        className="dc__transparent flex"
                        onClick={(e) => {
                            stopPropagation(e)
                            setShowDetailedIncomingPayload(!showDetailedIncomingPayload)
                            setExpandedIncomingPayload(false)
                        }}
                    >
                        <Back />
                    </button>
                    <h1 className="modal__title fs-16 pl-16 flex left">
                        All incoming webhook payloads
                        <Right
                            className="rotate icon-dim-24 ml-16 mr-16"
                            style={{ ['--rotateBy' as any]: '-180deg' }}
                        />
                        {webhookPayloads.payloads
                            .filter((payload, index, array) => payload.parsedDataId == parsedDataId)
                            .map((payload) => moment(payload.eventTime).format(Moment12HourFormat))
                            .toString()}{' '}
                    </h1>
                </div>
                <button
                    type="button"
                    className="dc__transparent"
                    onClick={() => {
                        onClose()
                        setExpandedIncomingPayload(false)
                    }}
                >
                    <Close />
                </button>
            </div>
        )
    }

    const webhookIncomingpayload = webhookIncomingPayloadRes?.result?.selectorsData.sort((a, b) =>
        sortCallback('selectorName', a, b),
    )

    const renderTimeStampDetailedDescription = () => {
        return (
            <div style={{ height: 'calc(100vh - 75px' }} className="bcn-0 px-16 mt-20">
                <div style={{ background: '#f2f4f7' }}>
                    <div className="cn-9 fs-12 fw-6 pt-12 pl-12">Incoming Payload</div>
                    <div
                        className={`${expandIncomingPayload ? `expand-incoming-payload` : `collapsed-incoming-payload`} cn-9 fs-13 pl-12 pr-12 pb-20`}
                        style={{ overflow: 'scroll' }}
                    >
                        {webhookIncomingPayloadRes?.result?.payloadJson}
                    </div>
                </div>
                <div>
                    <button
                        type="button"
                        className="fs-12 fw-6 pt-8 pb-8 w-100 bcn-0 flex left cb-5 cursor"
                        style={{ border: 'none' }}
                        onClick={() => setExpandedIncomingPayload(!expandIncomingPayload)}
                    >
                        {expandIncomingPayload ? 'Collapse' : 'Expand'}
                    </button>
                    <div className="cn-9 fw-6 fs-14 flex left dc__content-space">
                        Filter matching results
                        <button
                            type="button"
                            className="dc__transparent"
                            onClick={() => onEditShowEditableCiModal(ciPipelineId, workflowId)}
                        >
                            {/* Here the CI model requires the CiPipelineId not the CiPipelineMaterialId */}
                            <Edit className=" icon-dim-24" />
                        </button>
                    </div>
                    <div>
                        <div
                            className="cn-5 fw-6 pt-8 pb-8 dc__border-bottom"
                            style={{ display: 'grid', gridTemplateColumns: '40% 20% 20% 20%', height: '100' }}
                        >
                            <div className="pl-8">Selector/Key</div>
                            <div>Selector value in payload</div>
                            <div>Configured filter</div>
                            <div>Result</div>
                        </div>

                        {webhookIncomingpayload?.map((selectedData, index) => {
                            let classes = 'cn-7 pt-8 pl-4 pb-8'
                            if (index % 2 == 0) {
                                classes = 'cn-7 pt-8 pl-4 pb-8 bcn-1'
                            }
                            return (
                                <div
                                    key={index}
                                    className={classes}
                                    style={{ display: 'grid', gridTemplateColumns: '40% 20% 20% 20%', height: '100' }}
                                >
                                    <div>{selectedData?.selectorName}</div>
                                    <div>{selectedData?.selectorValue}</div>
                                    <div>{selectedData?.selectorCondition}</div>
                                    <div
                                        className={
                                            selectedData?.match == false ? `dc__deprecated-warn-text` : `cg-5 ml-4`
                                        }
                                    >
                                        {selectedData?.match === false ? 'Did not match' : 'Matched'}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    const renderWebHookModal = () => {
        return (
            <div className="payload-wrapper-no-header pl-20">
                {isWebhookPayloadLoading ? (
                    <div style={{ height: 'calc(100vh - 200px)', width: 'calc(100vw - 650px)' }}>
                        {renderWebhookPayloadLoader()}
                    </div>
                ) : (
                    <>
                        {renderConfiguredFilters()}
                        {renderTimeStampWebhookFilters()}
                    </>
                )}
            </div>
        )
    }

    const renderTimeStampDetailedIncomingModal = () => {
        return (
            <div
                className={`bcn-0 w-1024 bcn-0 dc__position-fixed dc__top-0 dc__right-0 timestamp-detail-container ${
                    fromBulkCITrigger ? 'env-modal-width' : ''
                }`}
                style={{ zIndex: 100 }}
            >
                <div>{renderTimeStampDetailedHeader(context)}</div>

                {isPayloadLoading ? (
                    <div className="flex payload-wrapper-no-header">{renderWebhookPayloadLoader()}</div>
                ) : (
                    renderTimeStampDetailedDescription()
                )}
            </div>
        )
    }

    return <div>{showDetailedIncomingPayload ? renderTimeStampDetailedIncomingModal() : renderWebHookModal()}</div>
}
