import React from 'react'
import { ReactComponent as Webhook } from '../../../assets/icons/ic-CIWebhook.svg'

export default function WebhookTippyCard() {
    const onClickedOkay = (e) => {
        // setActionWithExpiry('clickedOkay', 1)
        // hideGettingStartedCard()
        // handlePostHogEventUpdate(e)
    }

    return (
        <div className="webhook-tippy-card-container w-300 br-8">
            <div className="arrow-down" />
            <div className={`webhook-tippy-card cn-0 p-20 br-8 fs-13 `}>
                <Webhook className="icon-dim-32 webhook-icon-white"/>
                <div className="flex column left fw-6">Click to get webhook details</div>
                <div>Get webhook url and sample JSON to be used in external CI service.</div>
                <div className="mt-12 lh-18">
                    <button onClick={onClickedOkay} className="bw-0 cn-9 fw-6 br-4 mr-12 pt-4 pb-4 pl-8 pr-8 pl-8 pr-8">
                    Show webhook details
                    </button>
                </div>
            </div>
        </div>
    )
}
