import React, { useState, useEffect } from 'react';
// import { getCIWebhookRes } from './ciWebhook.service'
import { Pagination, Progressing, showError, ErrorScreenManager as ErrorScreen } from '../../../common'
import { ReactComponent as Back } from '../../../../assets/icons/ic-back.svg';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';

export default function CiWebhookModal(context, toggleWebhookModal) {
    const [showDeatailedPayload, setShowDeatailedPayload] = useState(false)
    const [result, setResult] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)

    // useEffect(() => {
    //     getCIWebhookResponse()
    // }, [])

    // const getCIWebhookResponse = () =>
    //     getCIWebhookRes().then((result) => {
    //         setIsLoading(true)
    //         setResult(result)
    //         setIsLoading(false)
    //     }
    //     )


    const renderConfiguredFilters = () => {
        return <div>
            <div className="cn-9 fs-14 pt-20 pb-8 fw-6"> Configured filters </div>
            <div className="cn-5 fs-12 fw-6 pt-8 pb-8 " style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                <div>Selector/Key</div>
                <div>Configured filter</div>
            </div>
            <div className="cn-7 pt-8 pl-4 pb-8 bcn-1" style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                <div>Source branch name</div>
                <div>master-feature*</div>
            </div>
            <div className="cn-7 pt-8 pl-4 pb-8" style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                <div>Target branch name</div>
                <div>master-feature*</div>
            </div>
            <div className="cn-7 pt-8 pl-4 pb-8 bcn-1" style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                <div>Author</div>
                <div>master-feature*</div>
            </div>
            <div className="cn-7 pt-8 pl-4 pb-8" style={{ display: "grid", gridTemplateColumns: "30% 70%", height: "100" }}>
                <div>Title</div>
                <div>master-feature*</div>
            </div>
        </div>
    }

    const renderWebhookPayloads = () => {
        return <div className="pt-20 pb-8">
            <div className="fs-14 cn-9 fw-6">
                All incoming webhook payloads for <span className="cb-5">/repo_name</span>
            </div>
            <div>
                <div className="cn-5 fw-6 pt-8 pb-8 border-bottom" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                    <div>Received at</div>
                    <div>Filters matched</div>
                    <div>Filters failed</div>
                    <div>Result</div>
                </div>
                {result?.result?.result.payloads.map((elm) =>
                    <div className="cn-5 pt-8 pb-8" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                        <div className="cb-5 cursor" onClick={() => setShowDeatailedPayload(true)}>{elm.EventTime}</div>
                        <div>{elm.MatchedFiltersCount}</div>
                        <div>{elm.FailedFiltersCount}</div>
                        <div className={elm.MatchedFilters == 'Failed' ? `deprecated-warn__text` : `cg-5 ml-4`}>{elm.MatchedFilters}</div>
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
                <button type="button" className="transparent" onClick={() => { setShowDeatailedPayload(!showDeatailedPayload) }}>
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
                <div className="pb-20" style={{ background: "#f2f4f7", }}>
                    <div className="cn-9 fs-12 fw-6 pt-12 pl-12">Incoming Payload</div>
                    <div className="cn-9 fs-13 pl-12 pr-12" style={{ overflow: "scroll", maxHeight: '200px' }}>
                        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
                        The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
                        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
                        The standard
                    </div>
                </div>
                <div>
                    <div className="cb-5 pt-8 pb-8">
                        Expand
                    </div>
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
                        <div className="cn-7 bcn-1 pt-8 pb-8" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                            <div >Source branch name</div>
                            <div>staging</div>
                            <div>feature-*</div>
                            <div>Did not match</div>
                        </div>
                        <div className="cn-7 pt-8 pb-8" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                            <div >Target branch name</div>
                            <div>main</div>
                            <div>^main$</div>
                            <div>Matched</div>
                        </div>
                        <div className="cn-7 bcn-1 pt-8 pb-8" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                            <div  >Author</div>
                            <div>shivani@devtron.ai</div>
                            <div>p*@devtron.ai</div>
                            <div>Matched</div>
                        </div>
                        <div className="cn-7 pt-8 pb-8" style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%", height: "100" }}>
                            <div >Title</div>
                            <div>FIX: telemetry meta info api changes</div>
                            <div>FIX-*</div>
                            <div>Matched</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderWebHookModal = () => {
        return <>
            <div className="pl-20" style={{ height: "calc(100vh - 72px" }}>
                {renderConfiguredFilters()}
                {!result?.result?.payload ? 
                <div className="flex column" style={{ 
                    height: "calc(100vh - 400px)",
                     width: '100vw' }}>
                    <div  className="flex pb-12"><Progressing  pageLoader /></div>
                    <div>
                        Fetching webhook payloads.<br/>
                        This might take some time.
                    </div>
                </div>
                    : <div>
                        {renderWebhookPayloads()}
                        {renderWebhookPagination
                        }
                    </div>}
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
