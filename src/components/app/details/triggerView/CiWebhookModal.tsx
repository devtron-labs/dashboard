import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { getCIWebhookPayload } from './ciWebhook.service';
import { Pagination, Progressing, showError } from '../../../common';
import { Moment12HourFormat } from '../../../../config';
import { ReactComponent as Back } from '../../../../assets/icons/ic-back.svg';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Edit } from '../../../../assets/icons/ic-edit.svg';
import { ReactComponent as Right } from '../../../../assets/icons/ic-arrow-left.svg';
import { ReactComponent as InfoOutlined } from '../../../../assets/icons/ic-info-outlined.svg';
import './ciWebhookModal.css';
import moment from 'moment';

export default function CiWebhookModal({ context, webhookPayloads, ciMaterialId, isWebhookPayloadLoading, hideWebhookModal, gitMaterialId, workflowId }) {
    const [showDeatailedPayload, setShowDeatailedPayload] = useState(false)
    const [isPayloadLoading, setIsPayloadLoading] = useState(false)
    const [webhookIncomingPayloadRes, setWebhookIncomingPayloadRes] = useState(undefined)
    const [expandIncomingPayload, setIncomingPayload] = useState(false)
    const [parsedDataId, setParsedDataId] = useState(0)
    const [pagination, setPagination] = useState<{ offset: number, pageSize: number, size: number }>({
        size: 20, pageSize: 20, offset: 0
    })
    const [ sortTimeStamp, setSortTimeStamp] = useState({order: {}})

    const history = useHistory()

    const onEditShowEditableCiModal = (ciMaterialId, workflowId) => {
        let link = `edit/workflow/${workflowId}/ci-pipeline/${ciMaterialId}`;
        history.push(link);
    }
    const renderConfiguredFilters = () => {
        return <div>
            <div className="cn-9 fs-14 pt-20 pb-8 fw-6 flex left">
                Configured filters
                <button type="button" className="mr-20 transparent align-right" onClick={() => onEditShowEditableCiModal(ciMaterialId, workflowId)}>
                    <Edit className=" icon-dim-24" />
                </button> </div>
            <div className="cn-5 fs-12 fw-6 pt-8 pb-8 " style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                <div>Selector/Key</div>
                <div>Configured filter</div>
            </div>
            {Object.keys(webhookPayloads.filters).map((selectorName, index) => {
                let classes = "cn-7 pt-8 pl-4 pb-8"
                if (index % 2 == 0) {
                    classes = "cn-7 pt-8 pl-4 pb-8 bcn-1"
                }
                return <div key={index} className={classes} style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                    <div>{selectorName}</div>
                    <div>{webhookPayloads.filters[selectorName]}</div>
                </div>
            })}
        </div>
    }

    const getCIWebhookPayloadRes = (pipelineMaterialId, parsedDataId) => {
        setParsedDataId(parsedDataId)
        setShowDeatailedPayload(true);
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

    const renderWebhookPayloads = () => {
        return <div className="pt-20 pb-8">
            <div className="fs-14 cn-9 fw-6">
                All incoming webhook payloads for
            <a href={webhookPayloads?.repositoryUrl} rel="noreferrer noopener" target="_blank" className="learn-more__href" > /repo_name</a>
            </div>
            <div>
                {webhookPayloads?.payloads == null ? <div className="bcn-1 empty-payload flex column mt-20 mr-20">
                    <InfoOutlined className="fcn-5 " />
                    <div>Payload data not available</div>
                </div> : <>
                        <div className="cn-5 fw-6 pt-8 pb-8 border-bottom" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                            <div>Received at <span className="filter-icon cursor" ><i className="fa fa-caret-down"></i></span></div>
                            <div>Filters matched</div>
                            <div>Filters failed</div>
                            <div>Result</div>
                        </div>

                        {webhookPayloads?.payloads?.map((payload, index) =>
                            <div key={index} className="cn-5 pt-8 pb-8 fs-13" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                                <div className="cb-5 cursor" onClick={() => getCIWebhookPayloadRes(ciMaterialId, payload.parsedDataId)}>{moment(payload.eventTime).format(Moment12HourFormat)}</div>
                                <div>{payload.matchedFiltersCount}</div>
                                <div>{payload.failedFiltersCount}</div>
                                <div className={payload.matchedFilters == false ? `deprecated-warn__text fs-13` : `cg-5 ml-4 fs-13`}>{payload.matchedFilters == false ? "Failed" : "Passed"}</div>
                            </div>
                        )}
                    </>}
            </div>
        </div>
    }

    const changePage = (pageNo): void => {
        pagination.offset = (pageNo - 1) * pagination.pageSize;
        setPagination({ size: 20, pageSize: 20, offset: 0 });
    }

    const changePageSize = (pageSize): void => {
        pagination.pageSize = pageSize;
        setPagination({ size: 20, pageSize: 20, offset: 0 });
    }

    const renderWebhookPagination = () => {
        return pagination.size > 0 ? <Pagination offset={pagination.offset}
            pageSize={pagination.pageSize}
            size={pagination.size}
            changePage={changePage}
            changePageSize={changePageSize} /> : null
    }

    const onClose = () => {
        return context.closeCIModal(),
            hideWebhookModal()
    }

    const renderWebhookDetailedHeader = (context) => {
        return <div className="trigger-modal__header">
            <div className="flex left">
                <button type="button" className="transparent flex" onClick={() => { setShowDeatailedPayload(!showDeatailedPayload); }}>
                    <Back />
                </button>
                <h1 className="modal__title fs-16 pl-16 flex left">All incoming webhook payloads 
                <Right className="rotate icon-dim-24 ml-16 mr-16" style={{ ['--rotateBy' as any]: '-180deg' }} />
                 {webhookPayloads.payloads.filter((payload, index, array) => payload.parsedDataId == parsedDataId).map((payload) => moment(payload.eventTime).format(Moment12HourFormat)).toString()} </h1>
            </div>
            <button type="button" className="transparent" onClick={() => onClose()}>
                <Close />
            </button>
        </div>
    }

    const renderWebhookDetailedDescription = () => {
        return (
            <div style={{ height: "calc(100vh - 94px" }} className="bcn-0 pl-16 mt-20 ">
                {isPayloadLoading ? <div style={{ height: 'calc(100vh - 200px)' }}>
                    <Progressing pageLoader />
                </div> :
                    <>
                        <div className="" style={{ background: "#f2f4f7", }}>
                            <div className="cn-9 fs-12 fw-6 pt-12 pl-12">Incoming Payload</div>
                            <div className={`${expandIncomingPayload ? `expand-incoming-payload` : `collapsed-incoming-payload`} cn-9 fs-13 pl-12 pr-12 pb-20`} style={{ overflow: "scroll" }}>
                                {webhookIncomingPayloadRes?.result?.payloadJson}
                            </div>
                        </div>
                        <div>
                            <button type="button" className="fs-12 fw-6 pt-8 pb-8 w-100 bcn-0 flex left cb-5 cursor" style={{ border: "none" }} onClick={() => setIncomingPayload(!expandIncomingPayload)}>
                                {expandIncomingPayload ? 'Collapse' : 'Expand'}
                            </button>
                            <div className="cn-9 fw-6 fs-14 flex left">
                                Filter matching results
                                <button type="button" className="mr-20 transparent align-right" onClick={() => onEditShowEditableCiModal(ciMaterialId, workflowId)}>
                                    <Edit className=" icon-dim-24" />
                                </button>
                            </div>
                            <div>
                                <div className="cn-5 fw-6 pt-8 pb-8 border-bottom" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                                    <div className="pl-8">Selector/Key</div>
                                    <div>Selector value in payload</div>
                                    <div>Configured filter</div>
                                    <div>Result</div>
                                </div>
                                {webhookIncomingPayloadRes?.result?.selectorsData?.map((selectedData, index) => {
                                    let classes = "cn-7 pt-8 pl-4 pb-8"
                                    if (index % 2 == 0) {
                                        classes = "cn-7 pt-8 pl-4 pb-8 bcn-1"
                                    }
                                    return <div key={index} className={classes} style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                                        <div >{selectedData?.selectorName}</div>
                                        <div>{selectedData?.selectorValue}</div>
                                        <div>{selectedData?.selectorCondition}</div>
                                        <div className={selectedData?.match == false ? `deprecated-warn__text` : `cg-5 ml-4`}>{selectedData?.match === false ? "Did not match" : "Matched"}</div>
                                    </div>
                                })}
                            </div>
                        </div>
                    </>}
            </div>
        )
    }

    const renderWebHookModal = () => {
        return <>
            <div className={`${webhookPayloads.payloads == null ? 'empty-payload-wrapper' : 'payload-wrapper'} pl-20`}>
                {isWebhookPayloadLoading ? <div style={{ height: 'calc(100vh - 200px)', width: 'calc(100vw - 650px)' }}>
                    <Progressing pageLoader />
                </div> : renderConfiguredFilters()}
                {isWebhookPayloadLoading ?
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
            {webhookPayloads.payloads !== null ? renderWebhookPagination() : null}
        </div>
    )
}
