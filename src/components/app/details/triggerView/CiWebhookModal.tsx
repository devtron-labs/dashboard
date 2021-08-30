import React, { useState } from 'react';
import { getCIWebhookPayload } from './ciWebhook.service';
import { Pagination, Progressing, showError, ErrorScreenManager as ErrorScreen } from '../../../common';
import moment from 'moment';
import { Moment12HourFormat } from '../../../../config';
import { ReactComponent as Back } from '../../../../assets/icons/ic-back.svg';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import './ciWebhookModal.css';

export default function CiWebhookModal({ context, webhookPayloads, id }) {
    const [showDeatailedPayload, setShowDeatailedPayload] = useState(false)
    const [isPayloadLoading, setIsPayloadLoading] = useState(false)
    const [webhookIncomingPayloadRes, setWebhookIncomingPayloadRes] = useState(undefined)
    const [expandIncomingPayload, setIncomingPayload] = useState(false)

    const renderConfiguredFilters = () => {
        return <div>
            <div className="cn-9 fs-14 pt-20 pb-8 fw-6"> Configured filters </div>
            <div className="cn-5 fs-12 fw-6 pt-8 pb-8 " style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                <div>Selector/Key</div>
                <div>Configured filter</div>
            </div>
            {Object.keys(webhookPayloads.filters).map((selectorName, index) => {
                return <div key={index} className="cn-7 pt-8 pl-4 pb-8 bcn-1" style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                    <div>{selectorName}</div>
                    <div>{webhookPayloads.filters[selectorName]}</div>
                </div>
            })}
        </div>
    }

    const getCIWebhookPayloadRes = (pipelineMaterialId, parsedDataId) => {
        setShowDeatailedPayload(true);
        setIsPayloadLoading(true)
        getCIWebhookPayload(pipelineMaterialId, parsedDataId).then((result) => {
            setWebhookIncomingPayloadRes(result)
        })
        setIsPayloadLoading(false)
    }

    const renderWebhookPayloads = () => {
        return <div className="pt-20 pb-8">
            <div className="fs-14 cn-9 fw-6">
                All incoming webhook payloads for
            <a href={webhookPayloads?.repositoryUrl} rel="noreferrer noopener" target="_blank" className="learn-more__href" > /repo_name</a>
            </div>
            <div>
                <div className="cn-5 fw-6 pt-8 pb-8 border-bottom" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                    <div>Received at</div>
                    <div>Filters matched</div>
                    <div>Filters failed</div>
                    <div>Result</div>
                </div>

                {webhookPayloads?.payloads?.map((payload, index) =>
                    <div key={index} className="cn-5 pt-8 pb-8" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                        <div className="cb-5 cursor" onClick={() => getCIWebhookPayloadRes(id, payload.parsedDataId)}>{moment(payload.eventTime).format(Moment12HourFormat)}</div>
                        <div>{payload.matchedFiltersCount}</div>
                        <div>{payload.failedFiltersCount}</div>
                        <div className={payload.matchedFilters == false ? `deprecated-warn__text` : `cg-5 ml-4`}>{payload.matchedFilters == false ? "Failed" : "Passed"}</div>
                    </div>
                )}
            </div>
        </div>
    }

    const renderWebhookPagination = () => {
        return <Pagination size={40}
            pageSize={20}
            offset={2}
            changePage={() => 2}
            changePageSize={() => 2}
        />
    }

    const renderWebhookDetailedHeader = (context) => {
        return <div className="trigger-modal__header">
            <div className="flex left">
                <button type="button" className="transparent" onClick={() => { setShowDeatailedPayload(!showDeatailedPayload); }}>
                    <Back />
                </button>
                <h1 className="modal__title fs-16 pl-16">All incoming webhook payloads, Wed, 19 Jun 2019, 04:02:05 PM </h1>
            </div>
            <button type="button" className="transparent" onClick={() => { setShowDeatailedPayload(false) }}>
                <Close />
            </button>
        </div>
    }

    const renderWebhookDetailedDescription = () => {
        return (
            <div style={{ height: "calc(100vh - 72px" }} className="bcn-0 pl-16 mt-20 ">
                <div className="" style={{ background: "#f2f4f7", }}>
                    <div className="cn-9 fs-12 fw-6 pt-12 pl-12">Incoming Payload</div>
                    <div className={`${expandIncomingPayload ? `expand-incoming-payload` : `collapsed-incoming-payload`} cn-9 fs-13 pl-12 pr-12 pb-20`} style={{ overflow: "scroll" }}>
                        {webhookIncomingPayloadRes?.result?.payloadJson}
                    </div>
                </div>
                <div>
                    <button type="button" className="fs-12 fw-6 pt-8 pb-8 w-100 bcn-0 flex left cb-5 cursor" style={{ border: "none" }} onClick={() => setIncomingPayload(!expandIncomingPayload)}>
                        {expandIncomingPayload ? 'Collapsed' : 'Expand'}
                    </button>
                    <div className="cn-9 fw-6 fs-14">
                        Filter matching results
                    </div>
                    <div>
                        <div className="cn-5 fw-6 pt-8 pb-8 border-bottom" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                            <div className="pl-8">Selector/Key</div>
                            <div>Selector value in payload</div>
                            <div>Configured filter</div>
                            <div>Result</div>
                        </div>
                        {isPayloadLoading ?
                            <div style={{ minHeight: '200px', width: '100vw' }}>
                                <Progressing pageLoader />
                            </div> :
                            webhookIncomingPayloadRes?.result?.selectorsData?.map((selectedData, index) => {
                                return <div key={index} className="cn-7 bcn-1 pt-8 pb-8" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                                    <div >{selectedData?.selectorName}</div>
                                    <div>{selectedData?.selectorValue}</div>
                                    <div>{selectedData?.selectorCondition}</div>
                                    <div className={selectedData?.match == false ? `deprecated-warn__text` : `cg-5 ml-4`}>{selectedData?.match === false ? "Did not match" : "Matched"}</div>
                                </div>
                            })}
                    </div>
                </div>
            </div>
        )
    }

    const renderWebHookModal = () => {
        return <>
            <div className="pl-20" style={{ height: "calc(100vh - 72px" }}>
                {renderConfiguredFilters()}
                {isPayloadLoading ?
                    <div className="flex column" style={{
                        height: "calc(100vh - 400px)",
                        width: '100vw'
                    }}>
                        <div className="flex pb-12"><Progressing pageLoader /></div>
                        <div>
                            Fetching webhook payloads.<br />
                        This might take some time.
                    </div>
                    </div>
                    : <div>
                        {renderWebhookPayloads()}
                        {renderWebhookPagination
                        }
                    </div>
                }
            </div>
        </>
    }

    const renderDeatailedPayload = () => {
        return (
            <div className="bcn-0" style={{ position: "fixed", top: "0", right: "0", width: '800px', background: 'var(--N000)', zIndex: 100 }}>
                <div>{renderWebhookDetailedHeader(context)}</div>
                <div>{renderWebhookDetailedDescription()}</div>
            </div>
        )
    }

    return (
        <div>
            { showDeatailedPayload ? renderDeatailedPayload() : renderWebHookModal()}
        </div>
    )
}
